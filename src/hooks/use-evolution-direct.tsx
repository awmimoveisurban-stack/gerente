import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchWithRetry } from '@/utils/fetch-with-retry';
import { createLogger } from '@/utils/structured-logger';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';

// Fallback direto caso .env não esteja configurado
const EVOLUTION_URL = 'https://api.urbanautobot.com';
const EVOLUTION_API_KEY = 'cfd9b746ea9e400dc8f4d3e8d57b0180';

// Logger estruturado
const logger = createLogger('EvolutionAPI');

logger.info('Evolution API Config', {
  url: EVOLUTION_URL,
  hasKey: !!EVOLUTION_API_KEY,
});

interface InstanceData {
  instanceName: string;
  instanceToken: string;
  instanceId?: string;
}

export const useEvolutionDirect = () => {
  const { user } = useUnifiedAuth(); // ✅ FIX: Usar user do contexto em vez de getUser()

  const [instance, setInstance] = useState<InstanceData | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<
    'disconnected' | 'pending' | 'connecting' | 'authorized'
  >('disconnected');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);

  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCreatingRef = useRef(false); // ✅ MELHORIA 2: Proteção contra múltiplas criações
  const connectingCountRef = useRef(0); // ✅ MELHORIA 3: Detectar sincronização travada

  // ✅ 1. CRIAR INSTÂNCIA E GERAR QR CODE
  const createInstance = useCallback(async () => {
    logger.info('createInstance chamado', {
      hasInstance: !!instance,
      isCreating: isCreatingRef.current,
      status,
    });

    // ✅ MELHORIA 2: Proteção contra múltiplas criações
    if (isCreatingRef.current) {
      logger.warn('Criação já em andamento', { isCreating: true });
      toast.error('⚠️ Já existe uma criação em andamento!');
      return;
    }

    if (instance) {
      logger.warn('Instância já existe', {
        instanceName: instance.instanceName,
      });
      toast.error('⚠️ Você já tem uma instância ativa!');
      return;
    }

    isCreatingRef.current = true;
    setIsCreating(true);

    try {
      logger.debug('Iniciando processo de criação...');

      // ✅ FIX: Usar user do contexto (não trava)
      if (!user) {
        logger.error('Usuário não autenticado');
        throw new Error('Não autenticado');
      }

      logger.debug('User obtido do contexto', { userId: user.id });

      // Gerar nome único
      const instanceName = `gerente_${user.id.replace(/-/g, '').substring(0, 12)}`;
      const instanceToken = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      logger.info('Criando instância', { instanceName, userId: user.id });

      // ✅ MELHORIA 1: Criar instância com retry exponencial
      // ✅ Criar instância COM webhook (obrigatório nesta Evolution API)
      const response = await fetchWithRetry(
        `${EVOLUTION_URL}/instance/create`,
        {
          method: 'POST',
          headers: {
            apikey: EVOLUTION_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instanceName,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
            webhook: {
              enabled: true,
              url: 'https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/evolution-webhook',
              webhookByEvents: true,
              webhookBase64: false,
              events: [
                'MESSAGES_UPSERT',
                'MESSAGES_UPDATE',
                'CONNECTION_UPDATE',
              ],
            },
            websocket: {
              enabled: true,
              events: [
                'MESSAGES_UPSERT',
                'MESSAGES_UPDATE',
                'CONNECTION_UPDATE',
              ],
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Erro ao criar instância', {
          status: response.status,
          error: errorText,
        });

        // ✅ FIX: Se instância já existe (403), deletar e tentar novamente
        if (response.status === 403 && errorText.includes('already in use')) {
          logger.warn('Instância já existe no Evolution API, deletando...', {
            instanceName,
          });

          // Deletar instância órfã
          await fetchWithRetry(
            `${EVOLUTION_URL}/instance/delete/${instanceName}`,
            {
              method: 'DELETE',
              headers: { apikey: EVOLUTION_API_KEY },
            },
            1,
            5000
          );

          logger.info('Instância órfã deletada, tentando criar novamente...');

          // Tentar criar novamente (recursivo - chama createInstance de novo)
          toast.info(
            '🔄 Limpando instância antiga... Tente novamente em 2 segundos.'
          );

          // Resetar estado e permitir nova tentativa
          setIsCreating(false);
          isCreatingRef.current = false;

          return; // Usuário precisa clicar novamente
        }

        throw new Error(`Erro ao criar instância: ${errorText}`);
      }

      const data = await response.json();
      logger.info(
        'Instância criada com sucesso (webhook incluído na criação)',
        { data }
      );

      const instanceData: InstanceData = {
        instanceName,
        instanceToken,
        instanceId: data.instance?.instanceId,
      };

      setInstance(instanceData);

      // QR Code
      if (data.qrcode?.base64) {
        console.log('📱 QR Code gerado (base64)');
        setQrCode(data.qrcode.base64);
      } else if (data.qrcode?.code) {
        console.log('📱 QR Code gerado (code)');
        // Gerar imagem do QR Code
        const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data.qrcode.code)}`;
        setQrCode(qrImage);
      }

      setStatus('pending');
      setIsCreating(false); // ✅ FIX: Resetar isCreating para QR Code aparecer
      isCreatingRef.current = false;

      logger.debug('Preparando para salvar no banco...', {
        userId: user.id,
        instanceName,
      });

      // ✅ FIX: INSERT em background (fire-and-forget) para não travar
      supabase
        .from('whatsapp_config')
        .insert({
          manager_id: user.id,
          provider: 'evolution-api',
          instance_name: instanceName, // ✅ Campo obrigatório
          evolution_instance_name: instanceName,
          evolution_instance_token: instanceToken,
          status: 'pending',
          qr_code: data.qrcode?.base64 || null,
        })
        .select()
        .then(({ data: insertData, error: insertError }) => {
          if (insertError) {
            logger.error('❌ ERRO NO INSERT', {
              error: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code,
            });
          } else {
            logger.info('✅ INSERT no banco (background)', {
              success: true,
              rowsInserted: insertData?.length || 0,
            });
          }
        });

      logger.debug('INSERT iniciado em background, continuando...');

      toast.success('✅ QR Code gerado! Você tem 2 minutos para escanear.');

      // ✅ 2. INICIAR MONITORAMENTO DE STATUS
      startMonitoring(instanceData);

      // ✅ 3. INICIAR TIMER DE AUTO-LIMPEZA
      startCleanupTimer(instanceData);
    } catch (error: any) {
      logger.error('Erro fatal ao criar instância', {
        error: error.message,
        stack: error.stack,
      });
      toast.error(
        error.message || 'Erro ao criar instância. Verifique os logs.'
      );
    } finally {
      setIsCreating(false);
      isCreatingRef.current = false; // ✅ MELHORIA 2: Resetar flag
    }
  }, [instance]);

  // ✅ 2. MONITORAR STATUS (Polling a cada 2 segundos)
  const startMonitoring = useCallback((instanceData: InstanceData) => {
    // Limpar intervalo anterior
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
    }

    logger.info('Iniciando monitoramento de status', {
      polling: '2s',
      maxTime: '120s',
    });
    connectingCountRef.current = 0; // ✅ MELHORIA 3: Resetar contador

    let attempts = 0;
    const maxAttempts = 60; // 60 * 2s = 120s = 2 min

    monitorIntervalRef.current = setInterval(async () => {
      // ✅ OTIMIZAÇÃO: Pausar polling se aba não estiver visível
      if (document.hidden) {
        logger.debug('Aba não visível, pulando polling');
        return;
      }

      attempts++;

      if (attempts > maxAttempts) {
        console.log('⏱️ Max tentativas atingido (2 min)');
        if (monitorIntervalRef.current) {
          clearInterval(monitorIntervalRef.current);
        }
        return;
      }

      try {
        // ✅ CORREÇÃO: Usar EVOLUTION_API_KEY (não instanceToken)
        const response = await fetchWithRetry(
          `${EVOLUTION_URL}/instance/connectionState/${instanceData.instanceName}`,
          { headers: { apikey: EVOLUTION_API_KEY } }, // ✅ API Key global
          2, // Apenas 2 tentativas no polling
          5000 // 5s timeout
        );

        if (!response.ok) {
          logger.warn('Erro ao verificar status', {
            status: response.status,
            attempt: attempts,
          });
          return;
        }

        const statusData = await response.json();
        logger.debug(`Status check`, {
          attempt: attempts,
          maxAttempts,
          status: statusData,
        });

        // ✅ MELHORIA 3: Detectar sincronização travada (stuck)
        if (statusData.state === 'connecting') {
          connectingCountRef.current++;

          if (connectingCountRef.current > 15) {
            // 15 * 2s = 30s travado
            logger.warn('Sincronização travada detectada!', {
              connectingTime: connectingCountRef.current * 2,
              instanceName: instanceData.instanceName,
            });

            toast.warning('⚠️ Conexão travada. Reiniciando...');

            // Tentar reiniciar instância
            try {
              await fetchWithRetry(
                `${EVOLUTION_URL}/instance/restart/${instanceData.instanceName}`,
                {
                  method: 'PUT',
                  headers: { apikey: EVOLUTION_API_KEY }, // ✅ API Key global
                },
                1,
                5000
              );

              logger.info('Instância reiniciada', {
                instanceName: instanceData.instanceName,
              });
              connectingCountRef.current = 0;
              toast.info('🔄 Conexão reiniciada! Escaneie o QR novamente.');
            } catch (restartError) {
              logger.error('Erro ao reiniciar instância', {
                error: restartError,
              });
            }
          }
        } else {
          // Resetar contador se não está mais connecting
          connectingCountRef.current = 0;
        }

        // ✅ 3. DETECTOU CONEXÃO!
        // Evolution API pode retornar: 'open', 'CONNECTED', 'connected'
        const isConnected =
          statusData.state === 'open' ||
          statusData.state === 'CONNECTED' ||
          statusData.state === 'connected' ||
          statusData.instance?.state === 'open';

        if (isConnected) {
          logger.info('WhatsApp conectado!', {
            instanceName: instanceData.instanceName,
          });
          logger.stateTransition('pending', 'authorized');

          // Parar monitoramento
          if (monitorIntervalRef.current) {
            clearInterval(monitorIntervalRef.current);
            monitorIntervalRef.current = null;
          }

          // Cancelar timer de limpeza
          if (cleanupTimerRef.current) {
            clearTimeout(cleanupTimerRef.current);
            cleanupTimerRef.current = null;
          }

          // Parar countdown visual
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }

          setStatus('authorized');
          setQrCode(null);

          // ✅ 4. SALVAR SESSÃO NO BANCO (UPSERT em background)
          if (user) {
            logger.info('🔍 Iniciando UPSERT', {
              userId: user.id,
              instanceName: instanceData.instanceName,
              instanceToken:
                instanceData.instanceToken?.substring(0, 20) + '...',
              status: 'authorized',
            });

            void supabase
              .from('whatsapp_config')
              .upsert(
                {
                  manager_id: user.id,
                  provider: 'evolution-api',
                  instance_name: instanceData.instanceName, // ✅ Campo obrigatório
                  evolution_instance_name: instanceData.instanceName,
                  evolution_instance_token: instanceData.instanceToken,
                  status: 'authorized',
                  qr_code: null,
                  auto_created: true,
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: 'manager_id',
                }
              )
              .select()
              .then(({ data: upsertData, error: upsertError }) => {
                if (upsertError) {
                  logger.error('❌ UPSERT FALHOU!', {
                    error: upsertError.message,
                    code: upsertError.code,
                    details: upsertError.details,
                    hint: upsertError.hint,
                  });
                  console.error('❌ ERRO CRÍTICO NO UPSERT:', upsertError);
                } else {
                  logger.info('✅ UPSERT SUCESSO!', {
                    rows: upsertData?.length || 0,
                    data: upsertData?.[0],
                  });
                  console.log('✅ WhatsApp salvo no banco:', upsertData?.[0]);
                }
              });
          }

          // ✅ 5. ENVIAR MENSAGEM TESTE (opcional)
          await sendTestMessage(instanceData);

          toast.success('🎉 WhatsApp conectado com sucesso!');
        }
      } catch (error: any) {
        logger.error('Erro ao monitorar status', {
          error: error.message,
          attempt: attempts,
        });
      }
    }, 2000); // A cada 2 segundos
  }, []);

  // ✅ 3. TIMER DE AUTO-LIMPEZA (2 minutos)
  const startCleanupTimer = useCallback((instanceData: InstanceData) => {
    // Limpar timer anterior
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
    }

    console.log('⏰ Timer de auto-limpeza iniciado: 2 minutos');
    setTimeRemaining(120);

    // Countdown visual (atualiza a cada 1 segundo)
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer principal de limpeza
    cleanupTimerRef.current = setTimeout(async () => {
      console.log('⏱️ Timeout! 2 minutos sem conexão. Deletando instância...');

      // Parar countdown
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      // Parar monitoramento
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
      }

      // Deletar instância automaticamente
      await autoDeleteInstance(instanceData);

      toast.error(
        '⏱️ QR Code expirou após 2 minutos. A instância foi deletada automaticamente. Tente novamente.'
      );
    }, 120000); // 120 segundos = 2 minutos
  }, []);

  // ✅ 5. ENVIAR MENSAGEM TESTE DE CONFIRMAÇÃO
  const sendTestMessage = async (instanceData: InstanceData) => {
    try {
      console.log('📤 Enviando mensagem teste de confirmação...');

      // Por enquanto, apenas log (pode implementar envio real depois)
      console.log('✅ WhatsApp pronto para enviar e receber mensagens!');
    } catch (error) {
      console.error('Erro ao enviar teste:', error);
    }
  };

  // ✅ AUTO-DELETAR (usado pelo timer)
  const autoDeleteInstance = async (instanceData: InstanceData) => {
    try {
      console.log('🗑️ Auto-deletando instância:', instanceData.instanceName);

      // Logout
      try {
        await fetch(
          `${EVOLUTION_URL}/instance/logout/${instanceData.instanceName}`,
          {
            method: 'DELETE',
            headers: { apikey: EVOLUTION_API_KEY }, // ✅ API Key global
          }
        );
      } catch (e) {
        console.warn('Logout falhou (continuando):', e);
      }

      // Deletar instância
      try {
        await fetch(
          `${EVOLUTION_URL}/instance/delete/${instanceData.instanceName}`,
          {
            method: 'DELETE',
            headers: { apikey: EVOLUTION_API_KEY },
          }
        );
      } catch (e) {
        console.warn('Delete falhou (continuando):', e);
      }

      // Soft delete no banco
      // ✅ FIX: Usar user do contexto
      if (user) {
        await supabase
          .from('whatsapp_config')
          .update({
            deleted_at: new Date().toISOString(),
            status: 'expired',
          })
          .eq('manager_id', user.id)
          .eq('evolution_instance_name', instanceData.instanceName);
      }

      setInstance(null);
      setQrCode(null);
      setStatus('disconnected');
      setTimeRemaining(120);

      console.log('✅ Instância auto-deletada');
    } catch (error) {
      console.error('❌ Erro ao auto-deletar:', error);
    }
  };

  // ✅ DELETAR INSTÂNCIA (manual - botão)
  const deleteInstance = useCallback(async () => {
    setIsDeleting(true);

    try {
      if (!instance) {
        toast.error('Nenhuma instância para deletar');
        return;
      }

      console.log('🗑️ Deletando instância manualmente:', instance.instanceName);

      // Parar todos os timers
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);

      // Logout
      await fetch(`${EVOLUTION_URL}/instance/logout/${instance.instanceName}`, {
        method: 'DELETE',
        headers: { apikey: EVOLUTION_API_KEY }, // ✅ API Key global
      }).catch(e => console.warn('Logout:', e));

      // Deletar
      await fetch(`${EVOLUTION_URL}/instance/delete/${instance.instanceName}`, {
        method: 'DELETE',
        headers: { apikey: EVOLUTION_API_KEY },
      }).catch(e => console.warn('Delete:', e));

      // Soft delete no banco
      // ✅ FIX: Usar user do contexto
      if (user) {
        await supabase
          .from('whatsapp_config')
          .update({
            deleted_at: new Date().toISOString(),
            status: 'disconnected',
          })
          .eq('manager_id', user.id)
          .eq('evolution_instance_name', instance.instanceName);
      }

      setInstance(null);
      setQrCode(null);
      setStatus('disconnected');
      setTimeRemaining(120);

      logger.info('Instância deletada e estado resetado', {
        instance: null,
        status: 'disconnected',
      });

      toast.success('✅ WhatsApp desconectado com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao deletar:', error);
      toast.error(error.message || 'Erro ao desconectar');
    } finally {
      setIsDeleting(false);
    }
  }, [instance]);

  // ✅ Buscar instância existente ao carregar
  useEffect(() => {
    const loadExistingInstance = async () => {
      try {
        logger.info('Verificando instância existente...');

        // ✅ FIX: Usar user do contexto
        if (!user) {
          logger.debug('Usuário não autenticado, pulando verificação');
          return;
        }

        const result = (await supabase
          .from('whatsapp_config')
          .select('*')
          .eq('manager_id', user.id)
          .eq('provider', 'evolution-api')
          .is('deleted_at', null)
          .maybeSingle()) as any;

        const config = result.data;
        const error = result.error;

        logger.debug('Resultado da busca no banco', {
          hasConfig: !!config,
          configStatus: config?.status,
          hasError: !!error,
          errorMessage: error?.message,
          configData: config,
        });

        if (error) {
          logger.error('Erro ao buscar config', { error: error.message });
          return;
        }

        // ✅ Aceitar tanto 'authorized' quanto 'connected'
        if (
          config &&
          (config.status === 'authorized' || config.status === 'connected')
        ) {
          logger.info('Instância existente encontrada e AUTORIZADA', {
            instanceName: config.evolution_instance_name,
            status: config.status,
          });

          setInstance({
            instanceName: config.evolution_instance_name,
            instanceToken: config.evolution_instance_token,
          });
          setStatus('authorized');
          logger.stateTransition('disconnected', 'authorized');
        } else if (config && config.status === 'pending') {
          logger.warn('Instância pending antiga encontrada, limpando...', {
            instanceName: config.evolution_instance_name,
          });

          // Deletar instância pending antiga
          await fetch(
            `${EVOLUTION_URL}/instance/delete/${config.evolution_instance_name}`,
            {
              method: 'DELETE',
              headers: { apikey: EVOLUTION_API_KEY },
            }
          ).catch(() => {});

          await supabase.from('whatsapp_config').delete().eq('id', config.id);

          logger.info('Instância pending deletada');
        } else {
          logger.debug('Nenhuma instância existente', { hasConfig: !!config });
        }
      } catch (error: any) {
        logger.error('Erro ao carregar instância existente', {
          error: error.message,
        });
      }
    };

    loadExistingInstance();

    // ✅ RECARREGAR quando voltar para a página
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        logger.info('🔄 Aba ficou visível, recarregando instância...');
        loadExistingInstance();
      }
    };

    // ✅ LISTENER: Pausar polling quando aba ficar oculta
    const handleVisibilityChangeLegacy = () => {
      if (document.hidden) {
        logger.info('🔻 Aba oculta - Polling pausado (economiza CPU)');
      } else {
        logger.info('🔺 Aba visível - Polling retomado');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChangeLegacy);

    // ✅ CLEANUP COMPLETO ao desmontar
    return () => {
      logger.info('🧹 Limpando hook Evolution (componente desmontado)');

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChangeLegacy
      );

      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
        logger.debug('Polling de monitoramento parado');
      }

      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
        logger.debug('Timer de cleanup removido');
      }

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        logger.debug('Countdown parado');
      }
    };
  }, [user]); // ✅ Adicionar user como dependência para recarregar quando mudar

  return {
    instance,
    qrCode,
    status,
    timeRemaining,
    isCreating,
    isDeleting,
    createInstance,
    deleteInstance,
  };
};
