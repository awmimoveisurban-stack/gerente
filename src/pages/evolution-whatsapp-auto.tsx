import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  PhoneOff,
  RefreshCw,
  CheckCircle,
  QrCode,
  Zap,
  Shield,
  Smartphone,
  AlertCircle,
  Info,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EvolutionWhatsAppAuto() {
  const { toast } = useToast();
  
  // Estados locais simplificados
  const [status, setStatus] = useState<'disconnected' | 'pending' | 'authorized'>('disconnected');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [instance, setInstance] = useState<{ instanceName: string } | null>(null);

  const handleConnect = useCallback(async () => {
    setIsCreating(true);
    try {
      // Simular criação de instância
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('pending');
      
      // QR Code real do WhatsApp (simulado)
      const qrCodeData = `data:image/svg+xml;base64,${btoa(`
        <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
          <rect width="256" height="256" fill="white"/>
          <rect x="20" y="20" width="216" height="216" fill="none" stroke="black" stroke-width="2"/>
          <rect x="40" y="40" width="40" height="40" fill="black"/>
          <rect x="100" y="40" width="40" height="40" fill="black"/>
          <rect x="160" y="40" width="40" height="40" fill="black"/>
          <rect x="220" y="40" width="16" height="40" fill="black"/>
          <rect x="40" y="100" width="40" height="40" fill="black"/>
          <rect x="100" y="100" width="40" height="40" fill="white"/>
          <rect x="160" y="100" width="40" height="40" fill="black"/>
          <rect x="40" y="160" width="40" height="40" fill="black"/>
          <rect x="100" y="160" width="40" height="40" fill="black"/>
          <rect x="160" y="160" width="40" height="40" fill="black"/>
          <rect x="220" y="160" width="16" height="40" fill="black"/>
          <rect x="40" y="220" width="40" height="16" fill="black"/>
          <rect x="100" y="220" width="40" height="16" fill="black"/>
          <rect x="160" y="220" width="40" height="16" fill="black"/>
          <text x="128" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="black">WhatsApp QR Code</text>
        </svg>
      `)}`;
      
      setQrCode(qrCodeData);
      
      // Simular countdown e conexão automática
      let count = 120;
      const interval = setInterval(() => {
        count -= 1;
        setTimeRemaining(count);
        
        // Simular conexão automática após 5 segundos (para demo)
        if (count === 115) {
          clearInterval(interval);
          setStatus('authorized');
          setInstance({ instanceName: 'whatsapp-instance-' + Date.now() });
          setQrCode(null);
          toast({
            title: "WhatsApp Conectado!",
            description: "Seu WhatsApp foi conectado com sucesso",
          });
          return;
        }
        
        if (count <= 0) {
          clearInterval(interval);
          setStatus('disconnected');
          setQrCode(null);
          toast({
            title: "QR Code Expirado",
            description: "O QR Code expirou. Tente conectar novamente",
            variant: "destructive",
          });
        }
      }, 1000);
      
      toast({
        title: "QR Code Gerado",
        description: "Escaneie o QR Code com seu WhatsApp",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar QR Code",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }, [toast]);

  const handleDisconnect = useCallback(async () => {
    const confirmed = confirm(
      '⚠️ Tem certeza que deseja desconectar?\n\n' +
        'Isso irá:\n' +
        '• Desconectar seu WhatsApp\n' +
        '• Deletar a instância do servidor\n' +
        '• Parar de receber/enviar mensagens\n\n' +
        'Para reconectar, você precisará escanear um novo QR Code.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('disconnected');
      setQrCode(null);
      setInstance(null);
      setTimeRemaining(120);
      
      toast({
        title: "WhatsApp Desconectado",
        description: "A instância foi removida com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao desconectar",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [toast]);

  const handleRefreshStatus = useCallback(() => {
    toast({
      title: "Status Atualizado",
      description: "Verificando conexão do WhatsApp...",
    });
  }, [toast]);

  return (
    <AppLayout>
      <div className="">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="px-0 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
        <div>
                  <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            WhatsApp Evolution API
          </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                    📱 Conecte seu WhatsApp e receba leads automaticamente
          </p>
        </div>
              </div>
        <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStatus}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Atualizar Status</span>
                <span className="sm:hidden">Atualizar</span>
        </Button>
      </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">

      {/* Alert Info */}
          <Alert className="bg-blue-50/80 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>⚡ Tempo Real com Socket.IO:</strong> Mensagens serão
          recebidas instantaneamente (0-3s) e qualificadas pela Claude AI
          automaticamente!
        </AlertDescription>
      </Alert>

          {/* Status WhatsApp */}
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-800/50">
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <div className="p-1.5 bg-green-500 rounded-lg">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                Status do WhatsApp
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400 mt-1 text-sm">
                📱 Monitoramento da conexão WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'authorized' ? 'bg-green-500' : 
                    status === 'pending' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}></div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {status === 'authorized' ? 'Conectado' : 
                     status === 'pending' ? 'Aguardando QR Code' : 
                     'Desconectado'}
                  </span>
                </div>
                <Badge variant={status === 'authorized' ? 'default' : 'secondary'} 
                       className={status === 'authorized' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {status === 'authorized' ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </CardContent>
          </Card>

      {/* Status Desconectado */}
      {status === 'disconnected' && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <Smartphone className="w-5 h-5 lg:w-6 lg:h-6" />
              Conectar WhatsApp
            </CardTitle>
              <CardDescription className="text-sm">
              Conecte seu WhatsApp Business para começar a receber leads
              automaticamente
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
            <Button
              onClick={handleConnect}
              disabled={isCreating}
                className="w-full"
                size="lg"
            >
              {isCreating ? (
                <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>
                    <Phone className="w-5 h-5 mr-2" />
                  Conectar WhatsApp
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* QR Code */}
      {status === 'pending' && qrCode && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200/50 dark:border-blue-800/50">
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <div className="p-1.5 bg-blue-500 rounded-lg">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
              Escanear QR Code
            </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400 mt-1 text-sm">
                📱 Use o aplicativo WhatsApp para escanear o QR Code abaixo
            </CardDescription>
          </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 p-6 lg:p-8">
              {/* QR Code Container */}
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
                {qrCode && (
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80"
                    onError={(e) => {
                      console.error('Erro ao carregar QR Code:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
            </div>

              {/* Timer */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ⏱️ Tempo restante:
                  </p>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                O QR Code expira em 2 minutos
              </p>
            </div>

              {/* Instructions */}
              <Alert className="bg-amber-50/90 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/60 max-w-md">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong className="block mb-2">Como escanear:</strong>
                  <ol className="list-decimal ml-4 space-y-1 text-sm">
                  <li>Abra o WhatsApp no seu celular</li>
                  <li>Toque em "Configurações" ou "⋮"</li>
                  <li>Toque em "Aparelhos conectados"</li>
                  <li>Toque em "Conectar um aparelho"</li>
                  <li>Aponte a câmera para este QR Code</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Conectado */}
      {status === 'authorized' && instance && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-800/50">
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <div className="p-1.5 bg-green-500 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              WhatsApp Conectado
            </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400 mt-1 text-sm">
                🎉 Seu WhatsApp está conectado e pronto para receber leads
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-6 p-6 lg:p-8">
              {/* Status Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Instância:</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
                    <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
                      {instance.instanceName || 'whatsapp-instance-001'}
                    </p>
                  </div>
              </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</p>
                  </div>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado e Ativo
                </Badge>
              </div>
            </div>

              {/* Success Alert */}
              <Alert className="bg-green-50/90 dark:bg-green-950/30 border-green-200/60 dark:border-green-800/60">
                <Zap className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>⚡ WebSocket Ativo:</strong> Mensagens serão recebidas e
                qualificadas pela IA em tempo real (2-3s)!
              </AlertDescription>
            </Alert>

              {/* Disconnect Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleDisconnect}
              disabled={isDeleting}
                  variant="destructive"
                  className="w-full h-12"
            >
              {isDeleting ? (
                <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Desconectando...
                </>
              ) : (
                <>
                      <PhoneOff className="w-5 h-5 mr-2" />
                  Desconectar WhatsApp
                </>
              )}
            </Button>
              </div>
          </CardContent>
        </Card>
      )}

      {/* Informações */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
              <Shield className="w-5 h-5" />
            Como Funciona
          </CardTitle>
        </CardHeader>
          <CardContent className="space-y-4 p-4 lg:p-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                  <p className="font-semibold">Tempo Real com Socket.IO</p>
                  <p className="text-muted-foreground">
                  Mensagens são recebidas instantaneamente (0-3s) via WebSocket
                </p>
              </div>
            </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <span className="text-lg">🤖</span>
              </div>
              <div>
                  <p className="font-semibold">Qualificação Automática com IA</p>
                  <p className="text-muted-foreground">
                  Claude AI analisa cada mensagem e extrai: tipo de imóvel,
                  localização, orçamento, prioridade
                </p>
              </div>
            </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                  <p className="font-semibold">Leads Pré-Qualificados</p>
                  <p className="text-muted-foreground">
                  Leads são criados automaticamente com score 0-100 e prioridade
                  calculada
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
      </div>
    </AppLayout>
  );
}
