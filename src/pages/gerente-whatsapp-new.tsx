import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type WhatsAppStatus = 'disconnected' | 'connecting' | 'connected';

interface WhatsAppState {
  status: WhatsAppStatus;
  qrCode: string | null;
  error: string | null;
}

export default function GerenteWhatsAppNewPage() {
  const { toast } = useToast();
  
  // Estado único e simples
  const [whatsapp, setWhatsapp] = useState<WhatsAppState>({
    status: 'disconnected',
    qrCode: null,
    error: null
  });

  // Função única para conectar WhatsApp
  const connectWhatsApp = async () => {
    console.log('🚀 Starting WhatsApp connection...');
    setWhatsapp({ status: 'connecting', qrCode: null, error: null });
    
    try {
      toast({
        title: "Conectando...",
        description: "Criando instância e obtendo QR Code",
      });

      const result = await supabase.functions.invoke('whatsapp-simple', {
        body: { action: 'connect' }
      });

      console.log('WhatsApp connection result:', result);

      if (result.error) {
        console.error('WhatsApp connection error:', result.error);
        throw new Error(result.error.message || 'Erro ao conectar WhatsApp');
      }

      if (result.data?.qrcode) {
        console.log('✅ QR Code received successfully');
        setWhatsapp({ status: 'connected', qrCode: result.data.qrcode, error: null });
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp",
        });
      } else {
        throw new Error('QR Code não foi recebido');
      }
    } catch (error: any) {
      console.error('❌ WhatsApp connection failed:', error);
      setWhatsapp({ status: 'disconnected', qrCode: null, error: error.message });
      
      toast({
        title: "Erro",
        description: error.message || "Falha ao conectar WhatsApp",
        variant: "destructive"
      });
    }
  };

  // Função para desconectar WhatsApp
  const disconnectWhatsApp = async () => {
    console.log('🚪 Disconnecting WhatsApp...');
    setWhatsapp(prev => ({ ...prev, status: 'connecting', error: null }));
    
    try {
      const result = await supabase.functions.invoke('whatsapp-simple', {
        body: { action: 'disconnect' }
      });

      if (result.error) {
        throw new Error(result.error.message || 'Erro ao desconectar WhatsApp');
      }

      setWhatsapp({ status: 'disconnected', qrCode: null, error: null });
      
      toast({
        title: "Desconectado",
        description: "WhatsApp foi desconectado com sucesso",
      });
    } catch (error: any) {
      console.error('❌ WhatsApp disconnect failed:', error);
      setWhatsapp(prev => ({ ...prev, status: 'disconnected', error: error.message }));
      
      toast({
        title: "Erro",
        description: error.message || "Falha ao desconectar WhatsApp",
        variant: "destructive"
      });
    }
  };

  // Função para testar Edge Function
  const testEdgeFunction = async () => {
    console.log('🧪 Testing Edge Function...');
    
    try {
      const result = await supabase.functions.invoke('whatsapp-simple', {
        body: { action: 'test' }
      });

      if (result.error) {
        toast({
          title: "❌ Edge Function Error",
          description: result.error.message || "Edge Function não está funcionando",
          variant: "destructive"
        });
      } else if (result.data?.success) {
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

  // Função para obter status
  const getStatus = async () => {
    console.log('📊 Getting WhatsApp status...');
    
    try {
      const result = await supabase.functions.invoke('whatsapp-simple', {
        body: { action: 'status' }
      });

      if (result.error) {
        console.error('Status check error:', result.error);
        return;
      }

      if (result.data?.success) {
        const status = result.data.status as WhatsAppStatus;
        const qrCode = result.data.qrcode || null;
        
        setWhatsapp(prev => ({
          ...prev,
          status: status,
          qrCode: qrCode
        }));
        
        console.log('✅ Status updated:', { status, hasQRCode: !!qrCode });
      }
    } catch (error: any) {
      console.error('❌ Status check failed:', error);
    }
  };

  // WebSocket listener para atualizações em tempo real
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
            setWhatsapp(prev => ({
              ...prev,
              status: 'connected',
              qrCode: null,
              error: null
            }));
            
            toast({
              title: "Conectado!",
              description: "WhatsApp foi conectado com sucesso",
            });
          } else if (newStatus === 'desconectado') {
            console.log('❌ Status changed to disconnected');
            setWhatsapp(prev => ({
              ...prev,
              status: 'disconnected',
              qrCode: null,
              error: null
            }));
            
            toast({
              title: "Desconectado",
              description: "WhatsApp foi desconectado",
            });
          } else if (newStatus === 'aguardando_qr') {
            console.log('⏳ Status changed to waiting QR');
            setWhatsapp(prev => ({
              ...prev,
              status: 'connected',
              error: null
            }));
            
            // Se há QR code no payload, atualizar
            if (payload.new?.qrcode) {
              setWhatsapp(prev => ({ ...prev, qrCode: payload.new.qrcode }));
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

    // Carregar status inicial
    getStatus();

    return () => {
      console.log('🛑 Removing WhatsApp status listener');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Renderizar status
  const renderStatus = () => {
    switch (whatsapp.status) {
      case 'connected':
        return (
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-green-600">WhatsApp Conectado</h3>
            <p className="text-gray-600">WhatsApp está funcionando perfeitamente!</p>
            
            {whatsapp.qrCode && (
              <div className="flex justify-center">
                <img 
                  src={whatsapp.qrCode} 
                  alt="QR Code WhatsApp"
                  className="border-2 border-gray-300 rounded-lg max-w-xs"
                />
              </div>
            )}
            
            <Button 
              onClick={disconnectWhatsApp}
              disabled={whatsapp.status === 'connecting'}
              variant="destructive"
            >
              {whatsapp.status === 'connecting' ? "Desconectando..." : "Desconectar WhatsApp"}
            </Button>
          </div>
        );
      
      case 'connecting':
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl">⏳</div>
            <h3 className="text-2xl font-bold text-blue-600">Conectando...</h3>
            <p className="text-gray-600">Aguarde enquanto configuramos o WhatsApp</p>
          </div>
        );
      
      default: // disconnected
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl">📱</div>
            <h3 className="text-2xl font-bold text-gray-600">WhatsApp Desconectado</h3>
            <p className="text-gray-600">Conecte seu WhatsApp para começar a usar</p>
            <Button 
              onClick={connectWhatsApp}
              disabled={whatsapp.status === 'connecting'}
              className="w-full"
            >
              {whatsapp.status === 'connecting' ? "Conectando..." : "Conectar WhatsApp"}
            </Button>
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
          whatsapp.status === 'connected' ? 'default' :
          whatsapp.status === 'connecting' ? 'secondary' : 'outline'
        }>
          {whatsapp.status === 'connected' ? 'Conectado' :
           whatsapp.status === 'connecting' ? 'Conectando' : 'Desconectado'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status da Conexão</CardTitle>
          <CardDescription>
            {whatsapp.status === 'connected' ? 'WhatsApp está conectado e funcionando' :
             whatsapp.status === 'connecting' ? 'Conectando WhatsApp...' :
             'WhatsApp não está conectado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {whatsapp.error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{whatsapp.error}</AlertDescription>
            </Alert>
          )}
          
          {renderStatus()}
        </CardContent>
      </Card>

      {/* Debug Info */}
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
                Status: {whatsapp.status}<br/>
                QR Code: {whatsapp.qrCode ? 'Presente' : 'Ausente'}<br/>
                Erro: {whatsapp.error || 'Nenhum'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Funções:</h4>
              <p className="text-sm text-gray-600">
                Edge Function: whatsapp-simple<br/>
                Ações: connect, status, disconnect, test<br/>
                WebSocket: Ativo
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => console.log('Current state:', whatsapp)}
              variant="outline"
              size="sm"
            >
              🧪 Log Estado
            </Button>
            <Button 
              onClick={() => setWhatsapp({
                status: 'disconnected',
                qrCode: null,
                error: null
              })}
              variant="outline"
              size="sm"
            >
              🔄 Reset Estado
            </Button>
            <Button 
              onClick={testEdgeFunction}
              variant="outline"
              size="sm"
            >
              🔍 Test Edge Function
            </Button>
            <Button 
              onClick={getStatus}
              variant="outline"
              size="sm"
            >
              📊 Get Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





