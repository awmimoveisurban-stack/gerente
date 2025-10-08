import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  QrCode, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

export default function GerenteWhatsAppSimplePage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<'desconectado' | 'aguardando_qr' | 'conectado'>('desconectado');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  const handleConnect = async () => {
    setLoading(true);
    toast({
      title: "Conectando WhatsApp",
      description: "Iniciando conexão...",
    });
    
    // Simular processo de conexão
    setTimeout(() => {
      setStatus('aguardando_qr');
      setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
      setLoading(false);
      toast({
        title: "QR Code Gerado",
        description: "Escaneie o QR Code com seu WhatsApp",
      });
    }, 2000);
  };
  
  const handleDisconnect = () => {
    setStatus('desconectado');
    setQrCode(null);
    toast({
      title: "WhatsApp Desconectado",
      description: "Conexão encerrada com sucesso",
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'aguardando_qr':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'desconectado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conectado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'aguardando_qr':
        return <QrCode className="h-4 w-4 text-yellow-500" />;
      case 'desconectado':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-green-200/50 dark:border-gray-700/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-xl">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              WhatsApp Business
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              📱 Gerencie a integração WhatsApp Business e acompanhe as métricas de comunicação
            </p>
          </div>
        </div>
      </div>

      {/* Status da Conexão */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
                <div className="p-1.5 bg-green-500 rounded-lg">
                  <Wifi className="h-4 w-4 text-white" />
                </div>
                Status da Conexão
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400 mt-1">
                🔗 Status atual da integração WhatsApp Business
              </CardDescription>
            </div>
            <Badge variant="outline" className={getStatusColor(status)}>
              {getStatusIcon(status)}
              <span className="ml-2">
                {status === 'conectado' ? 'Conectado' :
                 status === 'aguardando_qr' ? 'Aguardando QR' :
                 'Desconectado'}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code */}
            {status === 'aguardando_qr' && qrCode && (
              <div className="space-y-4">
                <div className="text-center">
                  <QrCode className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">QR Code para Conexão</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Escaneie este código com seu WhatsApp para conectar
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    <img 
                      src={qrCode}
                      alt="QR Code WhatsApp"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Controles de Conexão */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-4">
                  {status === 'conectado' ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : status === 'aguardando_qr' ? (
                    <QrCode className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <WifiOff className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {status === 'conectado' ? 'WhatsApp Conectado' :
                   status === 'aguardando_qr' ? 'Aguardando Conexão' :
                   'WhatsApp Desconectado'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {status === 'conectado' ? 'Sua conta WhatsApp Business está conectada e funcionando normalmente.' :
                   status === 'aguardando_qr' ? 'Escaneie o QR Code com seu WhatsApp para estabelecer a conexão.' :
                   'Conecte sua conta WhatsApp Business para começar a enviar mensagens.'}
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                {status === 'desconectado' && (
                  <Button 
                    onClick={handleConnect}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wifi className="mr-2 h-4 w-4" />
                    )}
                    Conectar WhatsApp
                  </Button>
                )}
                
                {status === 'conectado' && (
                  <Button 
                    onClick={handleDisconnect}
                    variant="outline"
                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                  >
                    <WifiOff className="mr-2 h-4 w-4" />
                    Desconectar
                  </Button>
                )}
                
                {status === 'aguardando_qr' && (
                  <Button 
                    onClick={() => setStatus('conectado')}
                    variant="outline"
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Simular Conexão
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Simples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">📱 Mensagens Hoje</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">43</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 p-6 rounded-2xl border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">📈 Taxa de Resposta</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">87%</p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





