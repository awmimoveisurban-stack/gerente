import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWhatsApp } from '@/hooks/use-whatsapp';

type WhatsAppState = 'desconectado' | 'aguardando_qr' | 'conectado';

export default function GerenteWhatsAppPage() {
  const { toast } = useToast();
  const { config, loading } = useWhatsApp();
  
  // Estados unificados e simplificados
  const [whatsappState, setWhatsappState] = useState<{
    status: WhatsAppState;
    qrCode: string | null;
    loading: boolean;
    error: string | null;
  }>({
    status: 'desconectado',
    qrCode: null,
    loading: false,
    error: null
  });

  // Função para limpar QR Code
  const cleanQRCode = (qrCode: string): string => {
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
    const cleanBase64 = base64Data.replace(/data:image\/png;base64,/g, '');
    return `data:image/png;base64,${cleanBase64}`;
  };

  // 🚀 FUNÇÃO UNIFICADA DE CONEXÃO - Uma única operação que faz tudo
  const connectWhatsApp = async () => {
    try {
      console.log('🚀 Starting WhatsApp connection...');
      setWhatsappState(prev => ({ ...prev, loading: true, error: null }));
      
      toast({
        title: "Conectando...",
        description: "Criando instância e obtendo QR Code",
      });

      // Uma única chamada que faz tudo: verifica, cria se necessário, conecta e obtém QR Code
      const response = await supabase.functions.invoke('whatsapp-connect', {
        body: {
          action: 'connect',
          instanceName: 'empresa-whatsapp'
        }
      });

      console.log('WhatsApp connection response:', response);

      if (response.error) {
        console.error('WhatsApp connection error:', response.error);
        throw new Error(response.error.message || 'Erro ao conectar WhatsApp');
      }

      if (response.data?.qrcode) {
        console.log('✅ QR Code received successfully');
        const cleanedQR = cleanQRCode(response.data.qrcode);
        
        setWhatsappState(prev => ({
          ...prev,
          status: 'aguardando_qr',
          qrCode: cleanedQR,
          loading: false
        }));

        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp",
        });
      } else {
        throw new Error('QR Code não foi gerado');
      }
    } catch (error: any) {
      console.error('❌ WhatsApp connection failed:', error);
      setWhatsappState(prev => ({
        ...prev,
        status: 'desconectado',
        qrCode: null,
        loading: false,
        error: error.message
      }));
      
      toast({
        title: "Erro",
        description: error.message || "Falha ao conectar WhatsApp",
        variant: "destructive"
      });
    }
  };

  // Função para testar Edge Function básica
  const testEdgeFunction = async () => {
    try {
      console.log('🧪 Testing Edge Function...');
      
      const response = await supabase.functions.invoke('whatsapp-connect', {
        body: {
          action: 'test',
          instanceName: 'empresa-whatsapp'
        }
      });

      console.log('Edge Function test response:', response);

      if (response.error) {
        toast({
          title: "❌ Edge Function Error",
          description: response.error.message || "Edge Function não está funcionando",
          variant: "destructive"
        });
      } else if (response.data?.success) {
        toast({
          title: "✅ Edge Function OK",
          description: "Edge Function está funcionando perfeitamente",
        });
      } else {
        toast({
          title: "⚠️ Edge Function Warning",
          description: "Edge Function respondeu, mas com formato inesperado",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('❌ Edge Function test failed:', error);
      toast({
        title: "❌ Edge Function Test Failed",
        description: error.message || "Erro ao testar Edge Function",
        variant: "destructive"
      });
    }
  };

  // Função para desconectar
  const disconnectWhatsApp = async () => {
    try {
      console.log('🚪 Disconnecting WhatsApp...');
      setWhatsappState(prev => ({ ...prev, loading: true }));
      
      const response = await supabase.functions.invoke('whatsapp-connect', {
        body: {
          action: 'disconnect',
          instanceName: 'empresa-whatsapp'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao desconectar WhatsApp');
      }

      setWhatsappState(prev => ({
        ...prev,
        status: 'desconectado',
        qrCode: null,
        loading: false
      }));

      toast({
        title: "Desconectado",
        description: "WhatsApp foi desconectado com sucesso",
      });
    } catch (error: any) {
      console.error('❌ WhatsApp disconnect failed:', error);
      setWhatsappState(prev => ({ ...prev, loading: false, error: error.message }));
      
      toast({
        title: "Erro",
        description: error.message || "Falha ao desconectar WhatsApp",
        variant: "destructive"
      });
    }
  };

  // WebSocket/SSE listener para atualizações em tempo real
  useEffect(() => {
    console.log('🔄 Setting up WhatsApp status listener...');
    
    const channel = supabase
      .channel('whatsapp-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_config',
          filter: 'instance_name=eq.empresa-whatsapp'
        },
        (payload) => {
          console.log('🔄 WhatsApp status update received:', payload);
          
          const newStatus = payload.new?.status;
          
          if (newStatus === 'conectado') {
            console.log('✅ Status changed to connected');
            setWhatsappState(prev => ({
              ...prev,
              status: 'conectado',
              qrCode: null,
              error: null
            }));
            
            toast({
              title: "Conectado!",
              description: "WhatsApp foi conectado com sucesso",
            });
          } else if (newStatus === 'desconectado') {
            console.log('❌ Status changed to disconnected');
            setWhatsappState(prev => ({
              ...prev,
              status: 'desconectado',
              qrCode: null,
              error: null
            }));
            
            toast({
              title: "Desconectado",
              description: "WhatsApp foi desconectado",
            });
          } else if (newStatus === 'aguardando_qr') {
            console.log('⏳ Status changed to waiting QR');
            setWhatsappState(prev => ({
              ...prev,
              status: 'aguardando_qr',
              error: null
            }));
            
            // Se há QR code no payload, atualizar
            if (payload.new?.qrcode) {
              const cleanedQR = cleanQRCode(payload.new.qrcode);
              setWhatsappState(prev => ({ ...prev, qrCode: cleanedQR }));
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to WhatsApp status updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to WhatsApp status updates');
        }
      });

    return () => {
      console.log('🛑 Removing WhatsApp status listener');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Sincronizar com estado do banco de dados
  useEffect(() => {
    if (config) {
      const dbStatus = config.status as WhatsAppState;
      setWhatsappState(prev => ({
        ...prev,
        status: dbStatus,
        qrCode: config.qrcode ? cleanQRCode(config.qrcode) : null
      }));
    }
  }, [config]);

  // Renderizar status
  const renderStatus = () => {
    switch (whatsappState.status) {
      case 'conectado':
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl">✅</div>
            <h3 className="text-2xl font-bold text-green-600">WhatsApp Conectado</h3>
            <p className="text-gray-600">WhatsApp está funcionando perfeitamente!</p>
            <Button 
              onClick={disconnectWhatsApp}
              disabled={whatsappState.loading}
              variant="destructive"
            >
              {whatsappState.loading ? "Desconectando..." : "Desconectar WhatsApp"}
            </Button>
          </div>
        );
      
      case 'aguardando_qr':
        return (
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-blue-600">Aguardando Conexão</h3>
            <p className="text-gray-600">Escaneie o QR Code com seu WhatsApp</p>
            
            {whatsappState.qrCode && (
              <div className="flex justify-center">
                <img 
                  src={whatsappState.qrCode} 
                  alt="QR Code WhatsApp"
                  className="border-2 border-gray-300 rounded-lg max-w-xs"
                />
              </div>
            )}
            
            <Button 
              onClick={disconnectWhatsApp}
              disabled={whatsappState.loading}
              variant="outline"
            >
              Cancelar Conexão
            </Button>
          </div>
        );
      
      default: // desconectado
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl">📱</div>
            <h3 className="text-2xl font-bold text-gray-600">WhatsApp Desconectado</h3>
            <p className="text-gray-600">Conecte seu WhatsApp para começar a usar</p>
            <div className="space-y-2">
              <Button 
                onClick={connectWhatsApp}
                disabled={whatsappState.loading}
                className="w-full"
              >
                {whatsappState.loading ? "Conectando..." : "Conectar WhatsApp"}
              </Button>
              <Button 
                onClick={testEdgeFunction}
                variant="outline"
                className="w-full"
              >
                🧪 Test Edge Function
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Business</h1>
          <p className="text-gray-600">Gerencie a conexão do WhatsApp Business</p>
        </div>
        
        <Badge variant={
          whatsappState.status === 'conectado' ? 'default' :
          whatsappState.status === 'aguardando_qr' ? 'secondary' : 'outline'
        }>
          {whatsappState.status === 'conectado' ? 'Conectado' :
           whatsappState.status === 'aguardando_qr' ? 'Aguardando QR' : 'Desconectado'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
          <CardDescription>
            {whatsappState.status === 'conectado' ? 'WhatsApp está conectado e funcionando' :
             whatsappState.status === 'aguardando_qr' ? 'Aguardando escaneamento do QR Code' :
             'WhatsApp não está conectado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {whatsappState.error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{whatsappState.error}</AlertDescription>
            </Alert>
          )}
          
          {renderStatus()}
        </CardContent>
      </Card>

      {/* Debug Info - Sempre visível para diagnóstico */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug Info</CardTitle>
          <CardDescription>Informações para diagnóstico e debugging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Estado Atual:</h4>
              <p className="text-sm text-gray-600">
                Status: {whatsappState.status}<br/>
                Loading: {whatsappState.loading ? 'Sim' : 'Não'}<br/>
                QR Code: {whatsappState.qrCode ? 'Presente' : 'Ausente'}<br/>
                Erro: {whatsappState.error || 'Nenhum'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Banco de Dados:</h4>
              <p className="text-sm text-gray-600">
                Config: {config ? 'Carregado' : 'Carregando...'}<br/>
                DB Status: {config?.status || 'N/A'}<br/>
                Instance: {config?.instance_name || 'N/A'}<br/>
                Updated: {config?.updated_at ? new Date(config.updated_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => console.log('Current state:', whatsappState)}
              variant="outline"
              size="sm"
            >
              🧪 Log Estado
            </Button>
            <Button 
              onClick={() => setWhatsappState({
                status: 'desconectado',
                qrCode: null,
                loading: false,
                error: null
              })}
              variant="outline"
              size="sm"
            >
              🔄 Reset Estado
            </Button>
            <Button 
              onClick={() => setWhatsappState(prev => ({
                ...prev,
                status: 'conectado',
                qrCode: null
              }))}
              variant="outline"
              size="sm"
            >
              🔧 Force Conectado
            </Button>
            <Button 
              onClick={testEdgeFunction}
              variant="outline"
              size="sm"
            >
              🔍 Test Edge Function
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}