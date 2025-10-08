import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppConfig {
  id: string;
  manager_id: string;
  instance_id: string | null;
  instance_name: string;
  qrcode: string | null;
  status: 'pendente' | 'aguardando_qr' | 'conectado' | 'desconectado';
  created_at: string;
  updated_at: string;
}

interface WhatsAppHookReturn {
  config: WhatsAppConfig | null;
  loading: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkStatus: () => Promise<void>;
  refreshConfig: () => Promise<void>;
}

export const useWhatsApp = (): WhatsAppHookReturn => {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Debounce refs to prevent multiple simultaneous calls
  const connectingRef = useRef(false);
  const lastCallTimeRef = useRef(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to clean QR code
  const cleanQRCode = useCallback((qrCode: string): string => {
    if (!qrCode || typeof qrCode !== 'string') return '';
    
    // Remove all data:image/png;base64, prefixes
    let cleanBase64 = qrCode.replace(/^data:image\/png;base64,/, '');
    cleanBase64 = cleanBase64.replace(/data:image\/png;base64,/g, '');
    
    // Ensure it's valid base64
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      throw new Error('Invalid base64 QR code format');
    }
    
    return `data:image/png;base64,${cleanBase64}`;
  }, []);

  // Helper function to generate dynamic instance name
  const generateInstanceName = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'Usuario-default';
      
      // Use email directly for instance name
      const userEmail = user.email;
      if (!userEmail) return 'Usuario-no-email';
      
      // Clean email: replace @ and . with - for Evolution API compatibility
      const cleanEmail = userEmail
        .toLowerCase()
        .replace('@', '-')
        .replace(/\./g, '-')
        .replace(/[^a-z0-9-]/g, '') // Remove special chars except hyphens
        .substring(0, 40); // Limit length for Evolution API
      
      return `Usuario-${cleanEmail}`;
    } catch (error) {
      console.error('Error generating instance name:', error);
      return 'Usuario-error'; // Fallback
    }
  }, []);

  // Fetch current WhatsApp config with retry logic
  const refreshConfig = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000 * (retryCount + 1); // Exponential backoff
    
    try {
      setLoading(true);
      setError(null);
      
      const instanceName = await generateInstanceName();
      console.log('🔧 Using instance name:', instanceName);
      
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('instance_name', instanceName)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar configuração:', error);
        
        // Retry logic for network errors
        if (retryCount < maxRetries && (error.code === 'PGRST301' || error.message?.includes('network'))) {
          console.log(`🔄 Retrying config fetch (${retryCount + 1}/${maxRetries}) in ${retryDelay}ms`);
          setTimeout(() => {
            refreshConfig(retryCount + 1);
          }, retryDelay);
          return;
        }
        
        setError('Erro ao carregar configuração WhatsApp');
        return;
      }

      setConfig(data as WhatsAppConfig);
      console.log('✅ Config loaded successfully');
    } catch (error: any) {
      console.error('❌ Erro ao buscar configuração:', error);
      
      // Retry logic for general errors
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying config fetch (${retryCount + 1}/${maxRetries}) in ${retryDelay}ms`);
        setTimeout(() => {
          refreshConfig(retryCount + 1);
        }, retryDelay);
        return;
      }
      
      setError('Erro ao carregar configuração WhatsApp');
    } finally {
      setLoading(false);
    }
  }, []); // Removidas dependências circulares

  // Connect to WhatsApp and get QR Code
  const connect = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (connectingRef.current) {
      console.log('⚠️ Connection already in progress, skipping...');
      return;
    }

    // Debounce calls (prevent calls within 2 seconds)
    const now = Date.now();
    if (now - lastCallTimeRef.current < 2000) {
      console.log('⚠️ Connection call debounced');
      return;
    }
    lastCallTimeRef.current = now;

    try {
      connectingRef.current = true;
      setConnecting(true);
      setError(null);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🚀 Starting WhatsApp connection...');
      
      const instanceName = await generateInstanceName();
      console.log('🔧 Connecting with instance name:', instanceName);
      
      const response = await supabase.functions.invoke('whatsapp-connect', {
        body: {
          action: 'connect',
          instanceName: instanceName
        }
      });

      console.log('📊 Connection response:', response);

      if (response.error) {
        console.error('❌ Connection error:', response.error);
        throw new Error(response.error.message || 'Erro ao conectar WhatsApp');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Falha na conexão WhatsApp');
      }

      // Check if we have a QR code or if instance is already connected
      if (response.data?.qrcode) {
        try {
          const cleanedQR = cleanQRCode(response.data.qrcode);
          console.log('✅ QR Code received and cleaned');
          
          toast({
            title: "QR Code gerado",
            description: "Escaneie o QR Code com seu WhatsApp",
          });
        } catch (qrError) {
          console.error('❌ QR Code cleaning failed:', qrError);
          toast({
            title: "Aviso",
            description: "QR Code gerado, mas com formato inválido",
            variant: "destructive"
          });
        }
      } else if (response.data?.status === 'conectado') {
        console.log('✅ WhatsApp já está conectado');
        toast({
          title: "WhatsApp Conectado",
          description: "Sua conta WhatsApp já está conectada e funcionando",
        });
      } else if (response.data?.status === 'aguardando_qr') {
        console.log('⏳ Aguardando QR Code...');
        toast({
          title: "Aguardando QR Code",
          description: "A instância está sendo configurada. Verifique o status em alguns segundos.",
        });
      } else {
        console.log('ℹ️ Conexão iniciada, aguardando QR Code...');
        toast({
          title: "Conexão Iniciada",
          description: "A conexão foi iniciada. Verifique o status para obter o QR Code.",
        });
      }

      // Refresh config to get updated status
      setTimeout(() => {
        refreshConfig();
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro ao conectar WhatsApp:', error);
      setError(error.message);
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao conectar WhatsApp",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      connectingRef.current = false;
      setConnecting(false);
    }
  }, [toast]); // Removidas dependências que causam loops

  // Disconnect WhatsApp
  const disconnect = useCallback(async () => {
    try {
      setConnecting(true);
      setError(null);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔌 Disconnecting WhatsApp...');
      
      const instanceName = await generateInstanceName();
      console.log('🔧 Disconnecting instance name:', instanceName);
      
      const response = await supabase.functions.invoke('whatsapp-connect', {
        body: {
          action: 'disconnect',
          instanceName: instanceName
        }
      });

      if (response.error) {
        console.error('❌ Disconnect error:', response.error);
        throw new Error(response.error.message || 'Erro ao desconectar WhatsApp');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Falha ao desconectar WhatsApp');
      }

      console.log('✅ WhatsApp disconnected successfully');
      
      toast({
        title: "Desconectado",
        description: "WhatsApp foi desconectado com sucesso",
      });

      // Refresh config to get updated status
      setTimeout(() => {
        refreshConfig();
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro ao desconectar WhatsApp:', error);
      setError(error.message);
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao desconectar WhatsApp",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [toast]); // Removidas dependências que causam loops

  // Check WhatsApp status with real-time validation
  const checkStatus = useCallback(async () => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced execution
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setError(null);

        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          throw new Error('Usuário não autenticado');
        }

        console.log('🔍 Checking WhatsApp status...');
        
        const instanceName = await generateInstanceName();
        console.log('🔧 Checking status for instance name:', instanceName);
        
        // 1. Verificar status via Edge Function
        const response = await supabase.functions.invoke('whatsapp-connect', {
          body: {
            action: 'status',
            instanceName: instanceName
          }
        });

        if (response.error) {
          console.error('❌ Status check error:', response.error);
          throw new Error(response.error.message || 'Erro ao verificar status');
        }

        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Falha ao verificar status');
        }

        console.log('✅ Status checked successfully:', response.data.status);
        
        // 2. Verificar se a instância realmente existe na Evolution API (apenas se status local é conectado)
        if (response.data?.status === 'conectado') {
          try {
            const evolutionResponse = await fetch(`https://api.urbanautobot.com/instance/fetchInstances`, {
              method: 'GET',
              headers: {
                'apikey': 'cfd9b746ea9e400dc8f4d3e8d57b0180'
              }
            });

            if (evolutionResponse.ok) {
              const evolutionData = await evolutionResponse.json();
              const instanceExists = evolutionData.find((inst: any) => inst.name === instanceName);
              
              if (!instanceExists) {
                console.warn('⚠️ Instance not found in Evolution API, updating status to disconnected');
                
                // Atualizar status local para desconectado
                setConfig(prevConfig => prevConfig ? {
                  ...prevConfig,
                  status: 'desconectado' as const,
                  qrcode: null
                } : null);
                
                toast({
                  title: "Instância Removida",
                  description: "A instância WhatsApp foi removida da Evolution API. Status atualizado automaticamente.",
                  variant: "destructive"
                });
                
                return; // Não fazer refresh da config
              } else {
                console.log('✅ Instance exists in Evolution API:', instanceExists.connectionStatus);
                
                // Verificar se há diferença no status
                if (instanceExists.connectionStatus !== 'open' && response.data?.status === 'conectado') {
                  console.warn('⚠️ Status mismatch detected, updating to disconnected');
                  
                  setConfig(prevConfig => prevConfig ? {
                    ...prevConfig,
                    status: 'desconectado' as const,
                    qrcode: null
                  } : null);
                  
                  toast({
                    title: "Status Atualizado",
                    description: "O status do WhatsApp foi atualizado automaticamente.",
                    variant: "destructive"
                  });
                  
                  return;
                }
              }
            }
          } catch (evolutionError) {
            console.warn('⚠️ Could not verify instance in Evolution API:', evolutionError);
            // Continuar com o processo normal se não conseguir verificar
          }
        }
        
        // Refresh config to get updated status
        setTimeout(() => {
          refreshConfig();
        }, 500);

      } catch (error: any) {
        console.error('❌ Erro ao verificar status:', error);
        setError(error.message);
        
        toast({
          title: "Erro",
          description: error.message || "Erro ao verificar status",
          variant: "destructive",
        });
      }
    }, 300); // 300ms debounce
  }, [toast]); // Removidas dependências que causam loops

  // Listen for real-time updates with improved error handling
  useEffect(() => {
    let channel: any = null;
    let isSetup = false;
    
    const setupRealtimeListener = async () => {
      if (isSetup) return;
      
      try {
        const instanceName = await generateInstanceName();
        console.log('🔧 Setting up realtime listener for:', instanceName);
        
        channel = supabase
          .channel(`whatsapp-config-changes-${instanceName}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'whatsapp_config',
              filter: `instance_name=eq.${instanceName}`
            },
            (payload) => {
              console.log('📡 WhatsApp config changed via realtime for instance:', instanceName, payload);
              // Debounce the refresh to avoid too many calls
              setTimeout(() => {
                refreshConfig();
              }, 500);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Realtime listener subscribed successfully');
              isSetup = true;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Realtime listener subscription failed');
            }
          });

      } catch (error) {
        console.error('❌ Error setting up realtime listener:', error);
      }
    };

    // Setup with retry logic
    const setupWithRetry = () => {
      setupRealtimeListener().catch(() => {
        // Retry after 2 seconds if setup fails
        setTimeout(setupWithRetry, 2000);
      });
    };

    setupWithRetry();

    return () => {
      if (channel) {
        console.log('🔌 Removing realtime listener');
        supabase.removeChannel(channel);
        isSetup = false;
      }
    };
  }, []); // Removida dependência que causa loop

  // Initial fetch - usando setTimeout para evitar problemas de inicialização
  useEffect(() => {
    console.log('🎯 WhatsApp hook initialized, fetching config...');
    const timer = setTimeout(() => {
      refreshConfig();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Executar apenas uma vez na inicialização

  // Verificação automática inicial quando config é carregada
  useEffect(() => {
    if (config && config.status === 'conectado') {
      console.log('🚀 Config carregada com status conectado, verificando sincronização...');
      // Verificar sincronização após 3 segundos da inicialização
      const timer = setTimeout(() => {
        checkStatus();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [config, checkStatus]);

  // Auto-check status when config changes to 'aguardando_qr' or 'conectado'
  useEffect(() => {
    if (config?.status === 'aguardando_qr') {
      // Set up periodic status check every 10 seconds for QR waiting
      const interval = setInterval(() => {
        checkStatus();
      }, 10000);

      return () => clearInterval(interval);
    } else if (config?.status === 'conectado') {
      // Set up periodic validation every 15 seconds for connected status (mais frequente)
      const interval = setInterval(() => {
        console.log('🔄 Verificação automática de status (conectado)...');
        checkStatus();
      }, 15000); // Reduzido para 15 segundos

      return () => clearInterval(interval);
    }
  }, [config?.status, checkStatus]);

  // Verificação automática adicional quando a página ganha foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && config?.status === 'conectado') {
        console.log('👁️ Página ganhou foco, verificando status...');
        // Delay de 2 segundos para evitar chamadas excessivas
        setTimeout(() => {
          checkStatus();
        }, 2000);
      }
    };

    const handleFocus = () => {
      if (config?.status === 'conectado') {
        console.log('🎯 Janela ganhou foco, verificando status...');
        setTimeout(() => {
          checkStatus();
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [config?.status, checkStatus]);

  return {
    config,
    loading,
    connecting,
    error,
    connect,
    disconnect,
    checkStatus,
    refreshConfig
  };
};