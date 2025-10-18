import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Activity,
  Settings,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionDirect } from '@/hooks/use-evolution-direct';
import { useWhatsAppStatus } from '@/hooks/use-whatsapp-status';
import { useEvolutionPollingDireto } from '@/hooks/use-evolution-polling-direto';

// ✅ IMPORTAÇÕES PADRONIZADAS
import {
  StandardPageLayout,
  StandardHeader,
  StandardMetricCard,
  StandardGrid,
  useStandardLayout,
  STANDARD_COLORS,
  LAYOUT_CONFIG,
  STANDARD_ANIMATIONS,
} from '@/components/layout/standard-layout';
import { ManagerRoute } from '@/components/layout/auth-middleware';

export default function EvolutionWhatsAppAuto() {
  const { toast } = useToast();
  
  // ✅ USAR HOOK PADRONIZADO
  const { isRefreshing, handleRefresh } = useStandardLayout();
  
  // ✅ Hooks reais do sistema
  const { createInstance, deleteInstance, isCreating, isDeleting, qrCode, timeRemaining } = useEvolutionDirect();
  const { whatsappStatus, isLoading, refreshStatus } = useWhatsAppStatus();
  
  // ✅ Ativar polling quando conectado
  useEvolutionPollingDireto(whatsappStatus.status === 'authorized');
  
  // Estados locais para UI
  const [showQR, setShowQR] = useState(false);

  const handleRefreshData = () => handleRefresh(refreshStatus, toast);

  const handleConnect = useCallback(async () => {
    try {
      await createInstance();
      setShowQR(true);
      toast({
        title: '✅ Instância criada com sucesso!',
        description: 'Escaneie o QR Code para conectar o WhatsApp',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao criar instância',
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
        title: '✅ WhatsApp desconectado com sucesso!',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao desconectar',
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
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Conectado</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Conectando</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800"><PhoneOff className="h-3 w-3 mr-1" />Desconectado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" />Desconhecido</Badge>;
    }
  };

  const getStatusColor = () => {
    switch (whatsappStatus.status) {
      case 'authorized':
        return STANDARD_COLORS.success;
      case 'connecting':
        return STANDARD_COLORS.warning;
      case 'disconnected':
        return STANDARD_COLORS.danger;
      default:
        return STANDARD_COLORS.info;
    }
  };

  // ✅ HEADER PADRONIZADO
  const headerActions = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefreshData}
        disabled={isRefreshing || isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
      {whatsappStatus.status === 'authorized' ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDisconnect}
          disabled={isDeleting}
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          {isDeleting ? 'Desconectando...' : 'Desconectar'}
        </Button>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isCreating}
          size="sm"
        >
          <Phone className="h-4 w-4 mr-2" />
          {isCreating ? 'Conectando...' : 'Conectar'}
        </Button>
      )}
    </>
  );

  const headerBadges = [
    {
      icon: <MessageSquare className="h-3 w-3" />,
      text: whatsappStatus.status === 'authorized' ? 'WhatsApp Online' : 'WhatsApp Offline',
    },
    {
      icon: <Activity className="h-3 w-3" />,
      text: whatsappStatus.isOnline ? 'Ativo' : 'Inativo',
    },
    {
      icon: <Shield className="h-3 w-3" />,
      text: 'Sistema Seguro',
    },
  ];

  if (isLoading) {
    return (
      <StandardPageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Carregando status do WhatsApp...</span>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <ManagerRoute>
      <StandardPageLayout
        header={
          <StandardHeader
            title="WhatsApp Business"
            description="📱 Integração automática com WhatsApp para captura de leads"
            icon={<MessageSquare className="h-6 w-6 text-white" />}
            badges={headerBadges}
            actions={headerActions}
            gradient="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
          />
        }
      >
        {/* ✅ STATUS E MÉTRICAS */}
        <StandardGrid columns="3">
          <StandardMetricCard
            title="Status da Conexão"
            value={whatsappStatus.status === 'authorized' ? 'Conectado' : 'Desconectado'}
            icon={<Phone className="h-6 w-6 text-white" />}
            color={getStatusColor()}
          />
          <StandardMetricCard
            title="Instância"
            value={whatsappStatus.instanceName || 'N/A'}
            icon={<Smartphone className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.info}
          />
          <StandardMetricCard
            title="Tempo Online"
            value={whatsappStatus.isOnline ? 'Ativo' : 'Inativo'}
            icon={<Activity className="h-6 w-6 text-white" />}
            color={whatsappStatus.isOnline ? STANDARD_COLORS.success : STANDARD_COLORS.danger}
          />
        </StandardGrid>

        {/* ✅ QR CODE E CONEXÃO */}
        {showQR && qrCode && (
          <motion.div
            initial={STANDARD_ANIMATIONS.pageInitial}
            animate={STANDARD_ANIMATIONS.pageAnimate}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-green-500" />
                  QR Code para Conexão
                </CardTitle>
                <CardDescription>
                  Escaneie o QR Code com seu WhatsApp para conectar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white rounded-lg shadow-md">
                    <img 
                      src={qrCode} 
                      alt="QR Code WhatsApp" 
                      className="w-64 h-64"
                    />
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Abra o WhatsApp no seu celular, vá em Configurações → Aparelhos conectados → Conectar um aparelho e escaneie este QR Code.
                    </AlertDescription>
                  </Alert>
                  {timeRemaining > 0 && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      QR Code expira em {timeRemaining}s
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ✅ INFORMAÇÕES DO SISTEMA */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Informações do Sistema
              </CardTitle>
              <CardDescription>
                Detalhes sobre a integração WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">Status Atual:</span>
                    {getStatusBadge()}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">Instância:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {whatsappStatus.instanceName || 'Não configurada'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">Conexão:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {whatsappStatus.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Captura Automática:</strong> Quando conectado, o sistema captura automaticamente mensagens do WhatsApp e cria leads.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Segurança:</strong> Todas as mensagens são processadas de forma segura e os dados são protegidos.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ INSTRUÇÕES */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Como Usar
              </CardTitle>
              <CardDescription>
                Instruções para configurar e usar o WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">1. Conectar</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clique em "Conectar" e escaneie o QR Code com seu WhatsApp
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">2. Receber Mensagens</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    O sistema captura automaticamente mensagens recebidas
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">3. Leads Criados</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mensagens são convertidas em leads automaticamente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </StandardPageLayout>
    </ManagerRoute>
  );
}
