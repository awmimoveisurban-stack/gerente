import { useState, useCallback, useEffect } from 'react';
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
import { useEvolutionDirect } from '@/hooks/use-evolution-direct';
import { useWhatsAppStatus } from '@/hooks/use-whatsapp-status';
import { useEvolutionPollingDireto } from '@/hooks/use-evolution-polling-direto';

export default function EvolutionWhatsAppAuto() {
  const { toast } = useToast();
  
  // ✅ Hooks reais do sistema
  const { createInstance, deleteInstance, isCreating, isDeleting, qrCode, timeRemaining } = useEvolutionDirect();
  const { whatsappStatus, isLoading, refreshStatus } = useWhatsAppStatus();
  
  // ✅ Ativar polling quando conectado
  useEvolutionPollingDireto(whatsappStatus.status === 'authorized');
  
  // Estados locais para UI
  const [showQR, setShowQR] = useState(false);

  // ✅ DEBUG: Log do status atual
  console.log('🔍 DEBUG WhatsApp Status:', {
    status: whatsappStatus.status,
    isOnline: whatsappStatus.isOnline,
    instanceName: whatsappStatus.instanceName,
    isLoading,
  });

  const handleConnect = useCallback(async () => {
    try {
      await createInstance();
      setShowQR(true);
      toast({
        title: 'Instância criada com sucesso!',
        description: 'Escaneie o QR Code para conectar o WhatsApp',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar instância',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  }, [createInstance, toast]);

  const handleDisconnect = useCallback(async () => {
    try {
      await deleteInstance();
      setShowQR(false);
      toast({
        title: 'WhatsApp desconectado com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro ao desconectar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  }, [deleteInstance, toast]);

  // Mostrar QR quando disponível
  useEffect(() => {
    if (qrCode) {
      setShowQR(true);
    }
  }, [qrCode]);

  // Esconder QR quando conectado
  useEffect(() => {
    if (whatsappStatus.status === 'authorized') {
      setShowQR(false);
    }
  }, [whatsappStatus.status]);

  const getStatusBadge = () => {
    switch (whatsappStatus.status) {
      case 'authorized':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700">✅ Conectado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700">⏳ Aguardando</Badge>;
      case 'disconnected':
      default:
        return <Badge variant="secondary" className="border-gray-300 dark:border-gray-700">❌ Desconectado</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (whatsappStatus.status) {
      case 'authorized':
        return <CheckCircle className="h-6 w-6 text-green-600 animate-pulse" />;
      case 'pending':
        return <RefreshCw className="h-6 w-6 text-yellow-600 animate-spin" />;
      case 'disconnected':
      default:
        return <PhoneOff className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              WhatsApp Business
          </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Conecte seu WhatsApp e receba leads automaticamente
          </p>
        </div>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>

      {/* Alert Info */}
          <Alert className="bg-blue-50/80 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>⚡ Tempo Real:</strong> Mensagens serão
          recebidas instantaneamente (0-3s) e qualificadas pela Claude AI
          automaticamente!
        </AlertDescription>
      </Alert>

        {/* Status Card */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200/50 dark:border-blue-800/50">
            <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Status da Conexão
              </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Gerencie sua conexão com o WhatsApp Business
              </CardDescription>
            </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Status Info */}
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                whatsappStatus.status === 'authorized' 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <p className={`font-semibold ${
                      whatsappStatus.status === 'authorized' 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {whatsappStatus.status === 'authorized' ? '✅ WhatsApp Conectado' : 
                       whatsappStatus.status === 'pending' ? '⏳ Aguardando Conexão' : 
                       '❌ WhatsApp Desconectado'}
                    </p>
                    <p className={`text-sm ${
                      whatsappStatus.status === 'authorized' 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {whatsappStatus.status === 'authorized' ? '🎉 WhatsApp está ativo e recebendo mensagens automaticamente!' :
                       whatsappStatus.status === 'pending' ? '📱 Escaneie o QR Code para conectar' :
                       '🔌 Clique em conectar para iniciar a integração'}
                    </p>
                    {whatsappStatus.status === 'authorized' && whatsappStatus.instanceName && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Instância: {whatsappStatus.instanceName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshStatus}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>

              {/* QR Code Section */}
              {showQR && qrCode && (
                <div className="text-center space-y-4">
                  <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 inline-block">
                    <img 
                      src={qrCode} 
                      alt="QR Code WhatsApp" 
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Escaneie o QR Code com seu WhatsApp
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Abra o WhatsApp no seu celular e escaneie este código
                    </p>
                    {timeRemaining > 0 && (
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        QR Code expira em: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              )}

                     {/* Action Buttons */}
                     <div className="space-y-4">
                
                {whatsappStatus.status === 'authorized' ? (
                  // ✅ WHATSAPP CONECTADO - Mostrar botão desconectar destacado
                  <div className="text-center space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                        🎉 WhatsApp está conectado e funcionando!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                        Suas mensagens estão sendo recebidas e qualificadas automaticamente pela IA.
                      </p>
                      <Button
                        onClick={handleDisconnect}
                        disabled={isDeleting}
                        variant="destructive"
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Desconectando...
                          </>
                        ) : (
                          <>
                            <PhoneOff className="h-4 w-4 mr-2" />
                            Desconectar WhatsApp
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // ❌ WHATSAPP DESCONECTADO - Mostrar botão conectar
                  <div className="text-center space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                        {whatsappStatus.status === 'pending' ? '⏳ Aguardando conexão...' : '🔌 WhatsApp desconectado'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {whatsappStatus.status === 'pending' 
                          ? 'Escaneie o QR Code acima para conectar' 
                          : 'Clique no botão abaixo para iniciar a integração'}
                      </p>
                      <Button
                        onClick={handleConnect}
                        disabled={isCreating}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isCreating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <Phone className="h-4 w-4 mr-2" />
                            Conectar WhatsApp
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Success Alert */}
              {whatsappStatus.status === 'authorized' && (
                <Alert className="bg-green-50/90 dark:bg-green-950/30 border-green-200/60 dark:border-green-800/60">
                  <Zap className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>⚡ Sistema Ativo:</strong> Mensagens serão recebidas e
                    qualificadas pela IA em tempo real (2-3s)!
                  </AlertDescription>
                </Alert>
              )}
              </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recursos Ativos
          </CardTitle>
            <CardDescription>
              Funcionalidades disponíveis quando conectado
            </CardDescription>
        </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                    <p className="font-semibold">Tempo Real</p>
                  <p className="text-muted-foreground">
                      Mensagens são recebidas instantaneamente (0-3s) via polling
                </p>
              </div>
            </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">IA Claude</p>
                    <p className="text-muted-foreground">
                      Qualificação automática de leads com análise inteligente
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                    <p className="font-semibold">Integração Completa</p>
                  <p className="text-muted-foreground">
                      Leads são automaticamente salvos no sistema CRM
                </p>
              </div>
            </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                    <AlertCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                    <p className="font-semibold">Notificações</p>
                  <p className="text-muted-foreground">
                      Alertas em tempo real para novos leads recebidos
                </p>
                  </div>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}