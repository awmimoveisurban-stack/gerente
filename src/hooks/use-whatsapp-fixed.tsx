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

  // Fetch current WhatsApp config
  const refreshConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('instance_name', 'empresa-whatsapp')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar configuração:', error);
        setError('Erro ao carregar configuração WhatsApp');
        return;
      }

      setConfig(data as WhatsAppConfig);
    } catch (error: any) {
      console.error('❌ Erro ao buscar configuração:', error);
      setError('Erro ao carregar configuração WhatsApp');
    } finally {
      setLoading(false);
    }
  }, []);

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
      
      const response = await supabase.functions.invoke('whatsapp-connect', {
        body: {
          action: 'connect',
          instanceName: 'empresa-whatsapp'
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

      // Clean and validate QR code if present
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
      } else {
        console.warn('⚠️ No QR Code in response');
        toast({
          title: "Aviso",
          description: "QR Code não foi gerado. Verifique os logs.",
          variant: "destructive"
        });
      }

      // Refresh config to get updated status
      await refreshConfig();

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
  }, [refreshConfig, toast, cleanQRCode]);

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
      
      const response = await supabase.functions.invoke('whatsapp-connect', {
        body: {
          action: 'disconnect',
          instanceName: 'empresa-whatsapp'
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
      await refreshConfig();

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
  }, [refreshConfig, toast]);

  // Check WhatsApp status
  const checkStatus = useCallback(async () => {
    try {
      setError(null);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔍 Checking WhatsApp status...');
      
      const response = await supabase.functions.invoke('whatsapp-connect', {
        body: {
          action: 'status',
          instanceName: 'empresa-whatsapp'
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
      
      // Refresh config to get updated status
      await refreshConfig();

    } catch (error: any) {
      console.error('❌ Erro ao verificar status:', error);
      setError(error.message);
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao verificar status",
        variant: "destructive",
      });
    }
  }, [refreshConfig, toast]);

  // Listen for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('whatsapp-config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_config'
        },
        (payload) => {
          console.log('📡 WhatsApp config changed via realtime:', payload);
          // Debounce the refresh to avoid too many calls
          setTimeout(() => {
            refreshConfig();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshConfig]);

  // Initial fetch
  useEffect(() => {
    console.log('🎯 WhatsApp hook initialized, fetching config...');
    refreshConfig();
  }, [refreshConfig]);

  // Auto-check status when config changes to 'aguardando_qr'
  useEffect(() => {
    if (config?.status === 'aguardando_qr') {
      // Set up periodic status check every 10 seconds
      const interval = setInterval(() => {
        checkStatus();
      }, 10000);

      return () => clearInterval(interval);
    }
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





