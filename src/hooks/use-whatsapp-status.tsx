import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { createLogger } from '@/utils/structured-logger';

const logger = createLogger('WhatsAppStatus');

interface WhatsAppConfig {
  id: string;
  manager_id: string;
  provider: string;
  instance_name: string;
  evolution_instance_name: string;
  evolution_instance_token: string;
  status: 'disconnected' | 'pending' | 'connecting' | 'authorized';
  qr_code: string | null;
  auto_created: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface WhatsAppStatus {
  status: 'disconnected' | 'pending' | 'connecting' | 'authorized';
  instanceName?: string;
  lastUpdate?: Date;
  error?: string;
  isOnline: boolean;
}

export const useWhatsAppStatus = () => {
  const { user } = useUnifiedAuth();
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({
    status: 'disconnected',
    isOnline: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // Buscar configuração atual do WhatsApp
  const fetchWhatsAppConfig =
    useCallback(async (): Promise<WhatsAppConfig | null> => {
      if (!user) return null;

      // ✅ DEBUG: Log do user ID sendo usado
      console.log('🔍 DEBUG fetchWhatsAppConfig - User ID:', user.id);
      console.log('🔍 DEBUG fetchWhatsAppConfig - User completo:', user);

      try {
        const { data, error } = await supabase
          .from('whatsapp_config')
          .select('*')
          .eq('manager_id', user.id)
          .eq('provider', 'evolution-api')
          .is('deleted_at', null)
          .order('updated_at', { ascending: false })
          .limit(1);

        const config = data?.[0]; // Pegar o primeiro (mais recente)

        if (error) {
          logger.error('Erro ao buscar config WhatsApp', {
            error: error.message,
            userId: user.id,
          });
          return null;
        }

        // ✅ Verificar se a instância ainda existe na Evolution API
        if (config && config.evolution_instance_name) {
          const instanceExists = await checkInstanceExists(config.evolution_instance_name);
          if (!instanceExists) {
            logger.warn('Instância não existe mais na Evolution API, marcando como deletada', {
              instanceName: config.evolution_instance_name
            });
            await cleanupOrphanedInstance(config.evolution_instance_name);
            return null;
          }
        }

        return config;
      } catch (err) {
        logger.error('Erro inesperado ao buscar config', { error: err });
        return null;
      }
    }, [user]);

  // Verificar se instância existe na Evolution API
  const checkInstanceExists = useCallback(
    async (instanceName: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `https://api.urbanautobot.com/instance/connectionState/${instanceName}`,
          {
            method: 'GET',
            headers: {
              apikey: 'cfd9b746ea9e400dc8f4d3e8d57b0180',
            },
          }
        );

        return response.ok;
      } catch (err) {
        logger.error('Erro ao verificar se instância existe', { error: err });
        return false;
      }
    },
    []
  );

  // Limpar instância órfã do banco
  const cleanupOrphanedInstance = useCallback(
    async (instanceName: string) => {
      try {
        logger.info('Limpando instância órfã do banco', { instanceName });
        
        const { error } = await supabase
          .from('whatsapp_config')
          .update({
            status: 'disconnected',
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('evolution_instance_name', instanceName);

        if (error) {
          logger.error('Erro ao limpar instância órfã', { error });
        } else {
          logger.info('✅ Instância órfã limpa do banco');
        }
      } catch (err) {
        logger.error('Erro ao limpar instância órfã', { error: err });
      }
    },
    []
  );

  // Verificar status na Evolution API
  const checkEvolutionAPIStatus = useCallback(
    async (instanceName: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `https://api.urbanautobot.com/instance/connectionState/${instanceName}`,
          {
            method: 'GET',
            headers: {
              apikey: 'cfd9b746ea9e400dc8f4d3e8d57b0180',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            logger.warn('Instância não encontrada na Evolution API', { instanceName });
            // ✅ Limpar instância órfã do banco
            await cleanupOrphanedInstance(instanceName);
            return false;
          }
          logger.warn('Erro ao verificar status Evolution API', { 
            status: response.status,
            instanceName 
          });
          return false;
        }

        const data = await response.json();
        const isConnected =
          data.state === 'open' ||
          data.state === 'CONNECTED' ||
          data.state === 'connected' ||
          data.state === 'OPEN' ||
          data.state === 'ready' ||
          data.state === 'READY' ||
          data.instance?.state === 'open' ||
          data.instance?.state === 'CONNECTED' ||
          data.instance?.state === 'connected' ||
          data.instance?.state === 'OPEN' ||
          data.instance?.state === 'ready' ||
          data.instance?.state === 'READY';

        // ✅ LOG DETALHADO DA RESPOSTA DA API
        logger.info('🔍 Evolution API Status Check:', {
          instanceName,
          responseStatus: response.status,
          apiData: data,
          isConnected,
          detectedStates: {
            mainState: data.state,
            instanceState: data.instance?.state,
          },
        });

        return isConnected;
      } catch (err) {
        logger.error('Erro ao verificar status Evolution API', { error: err });
        return false;
      }
    },
    []
  );

  // Atualizar status no banco
  const updateStatusInDatabase = useCallback(
    async (
      config: WhatsAppConfig,
      newStatus: WhatsAppConfig['status'],
      isOnline: boolean
    ) => {
      try {
        const { error } = await supabase
          .from('whatsapp_config')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id);

        if (error) {
          logger.error('Erro ao atualizar status no banco', {
            error: error.message,
          });
        } else {
          logger.info('Status atualizado no banco', {
            status: newStatus,
            isOnline,
            instanceName: config.instance_name,
          });
        }
      } catch (err) {
        logger.error('Erro inesperado ao atualizar status', { error: err });
      }
    },
    []
  );

  // Verificar status com fallback
  const checkStatusWithFallback = useCallback(async () => {
    if (!user) return;

    try {
      const config = await fetchWhatsAppConfig();

      if (!config) {
        setWhatsappStatus({
          status: 'disconnected',
          isOnline: false,
        });
        setIsLoading(false);
        return;
      }

      // Verificar se a instância está online na Evolution API
      const isOnline = await checkEvolutionAPIStatus(
        config.evolution_instance_name
      );

      // Determinar status baseado na configuração e verificação online
      let currentStatus: WhatsAppConfig['status'] = config.status;

      if (config.status === 'authorized' && !isOnline) {
        // Status no banco diz "authorized" mas API diz offline - precisa reconectar
        currentStatus = 'disconnected';
        await updateStatusInDatabase(config, 'disconnected', false);

        // Tentar reconectar automaticamente
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          logger.info('Tentando reconectar automaticamente', {
            attempt: reconnectAttemptsRef.current,
            maxAttempts: maxReconnectAttempts,
          });

          // Aqui você pode implementar lógica de reconexão automática
          // Por enquanto, apenas marcamos como disconnected
        }
      } else if (config.status === 'pending' && !isOnline) {
        // QR Code expirado ou instância perdida
        currentStatus = 'disconnected';
        await updateStatusInDatabase(config, 'disconnected', false);
      } else if (isOnline && config.status !== 'authorized') {
        // ✅ WhatsApp está conectado mas status no banco não está atualizado
        logger.info('WhatsApp conectado mas status não atualizado no banco', {
          currentStatus: config.status,
          isOnline: true,
        });
        currentStatus = 'authorized';
        await updateStatusInDatabase(config, 'authorized', true);
      } else if (!isOnline && config.status === 'disconnected' && config.evolution_instance_name) {
        // ✅ FALLBACK: Se tem instância mas está desconectado, tentar verificar novamente
        logger.info('Fallback: Tentando verificar status novamente', {
          instanceName: config.evolution_instance_name,
          currentStatus: config.status,
        });
        
        // Tentar verificar status novamente com timeout menor
        try {
          const fallbackCheck = await fetch(
            `https://api.urbanautobot.com/instance/connectionState/${config.evolution_instance_name}`,
            {
              method: 'GET',
              headers: { apikey: 'cfd9b746ea9e400dc8f4d3e8d57b0180' },
              signal: AbortSignal.timeout(5000), // 5s timeout
            }
          );
          
          if (fallbackCheck.ok) {
            const fallbackData = await fallbackCheck.json();
            const fallbackConnected = 
              fallbackData.state === 'open' ||
              fallbackData.state === 'CONNECTED' ||
              fallbackData.state === 'connected' ||
              fallbackData.state === 'OPEN' ||
              fallbackData.state === 'ready' ||
              fallbackData.state === 'READY';
              
            if (fallbackConnected) {
              logger.info('Fallback detectou conexão!', {
                instanceName: config.evolution_instance_name,
                fallbackState: fallbackData.state,
              });
              currentStatus = 'authorized';
              await updateStatusInDatabase(config, 'authorized', true);
            }
          }
        } catch (fallbackError) {
          logger.warn('Fallback check falhou', { error: fallbackError });
        }
      }

      // ✅ LOG DETALHADO PARA DEBUG
      logger.info('🔍 Status WhatsApp determinado:', {
        configStatus: config.status,
        isOnline,
        currentStatus,
        instanceName: config.evolution_instance_name,
        managerId: user.id,
      });

      setWhatsappStatus({
        status: currentStatus,
        instanceName: config.evolution_instance_name,
        lastUpdate: new Date(),
        isOnline,
      });

      setError(null);
      reconnectAttemptsRef.current = 0; // Reset tentativas em caso de sucesso
    } catch (err) {
      logger.error('Erro ao verificar status WhatsApp', { error: err });
      setError(err instanceof Error ? err.message : 'Erro desconhecido');

      setWhatsappStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }));
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    fetchWhatsAppConfig,
    checkEvolutionAPIStatus,
    updateStatusInDatabase,
  ]);

  // Iniciar polling de status
  const startStatusPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Verificar imediatamente
    checkStatusWithFallback();

    // Verificar a cada 30 segundos
    pollingIntervalRef.current = setInterval(() => {
      checkStatusWithFallback();
    }, 30000);

    logger.info('Polling de status WhatsApp iniciado', { interval: '30s' });
  }, [checkStatusWithFallback]);

  // Parar polling
  const stopStatusPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      logger.info('Polling de status WhatsApp parado');
    }
  }, []);

  // Atualizar status manualmente
  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    await checkStatusWithFallback();
  }, [checkStatusWithFallback]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopStatusPolling();
    };
  }, [stopStatusPolling]);

  // Iniciar polling quando usuário estiver disponível
  useEffect(() => {
    if (user) {
      startStatusPolling();
    } else {
      stopStatusPolling();
    }
  }, [user, startStatusPolling, stopStatusPolling]);

  return {
    whatsappStatus,
    isLoading,
    error,
    refreshStatus,
    startStatusPolling,
    stopStatusPolling,
  };
};

