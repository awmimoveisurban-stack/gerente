import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWhatsApp } from '@/hooks/use-whatsapp';
import { 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  QrCode, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

// Componente de Métricas Dinâmicas
interface WhatsAppMetricsProps {
  currentStatus: string;
}

const WhatsAppMetrics: React.FC<WhatsAppMetricsProps> = ({ currentStatus }) => {
  const [metrics, setMetrics] = useState({
    messagesToday: 0,
    responseRate: 0,
    activeLeads: 0,
    totalMessages: 0,
    loading: true
  });

  // Carregar métricas reais ou usar fallback
  const loadMetrics = useCallback(async () => {
    try {
      setMetrics(prev => ({ ...prev, loading: true }));
      
      // TODO: Implementar chamada real para API de métricas
      // Por enquanto, usar dados simulados baseados no status
      const simulatedData = {
        messagesToday: currentStatus === 'conectado' ? Math.floor(Math.random() * 50) + 20 : 0,
        responseRate: currentStatus === 'conectado' ? Math.floor(Math.random() * 30) + 70 : 0,
        activeLeads: currentStatus === 'conectado' ? Math.floor(Math.random() * 100) + 100 : 0,
        totalMessages: currentStatus === 'conectado' ? Math.floor(Math.random() * 500) + 1000 : 0
      };
      
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMetrics({
        ...simulatedData,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      // Fallback para dados estáticos
      setMetrics({
        messagesToday: currentStatus === 'conectado' ? 43 : 0,
        responseRate: currentStatus === 'conectado' ? 87 : 0,
        activeLeads: currentStatus === 'conectado' ? 156 : 0,
        totalMessages: currentStatus === 'conectado' ? 1247 : 0,
        loading: false
      });
    }
  }, [currentStatus]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const metricsData = [
    {
      title: '📱 Mensagens Hoje',
      value: metrics.loading ? '...' : metrics.messagesToday.toLocaleString(),
      icon: MessageSquare,
      color: 'blue',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30',
      borderColor: 'border-blue-200/50 dark:border-blue-800/50',
      textColor: 'text-blue-700 dark:text-blue-300',
      valueColor: 'text-blue-900 dark:text-blue-100',
      iconBg: 'bg-blue-500'
    },
    {
      title: '📈 Taxa de Resposta',
      value: metrics.loading ? '...' : `${metrics.responseRate}%`,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30',
      borderColor: 'border-green-200/50 dark:border-green-800/50',
      textColor: 'text-green-700 dark:text-green-300',
      valueColor: 'text-green-900 dark:text-green-100',
      iconBg: 'bg-green-500'
    },
    {
      title: '👥 Leads Ativos',
      value: metrics.loading ? '...' : metrics.activeLeads.toLocaleString(),
      icon: Users,
      color: 'purple',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30',
      borderColor: 'border-purple-200/50 dark:border-purple-800/50',
      textColor: 'text-purple-700 dark:text-purple-300',
      valueColor: 'text-purple-900 dark:text-purple-100',
      iconBg: 'bg-purple-500'
    },
    {
      title: '💬 Total Mensagens',
      value: metrics.loading ? '...' : metrics.totalMessages.toLocaleString(),
      icon: Clock,
      color: 'amber',
      bgColor: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30',
      borderColor: 'border-amber-200/50 dark:border-amber-800/50',
      textColor: 'text-amber-700 dark:text-amber-300',
      valueColor: 'text-amber-900 dark:text-amber-100',
      iconBg: 'bg-amber-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {metricsData.map((metric, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-br ${metric.bgColor} p-6 rounded-2xl border ${metric.borderColor} ${
            metrics.loading ? 'animate-pulse' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${metric.textColor}`}>
                {metric.title}
              </p>
              <p className={`text-3xl font-bold ${metric.valueColor} mt-1`}>
                {metric.value}
              </p>
              {metrics.loading && (
                <div className="w-16 h-2 bg-gray-200 rounded mt-2 animate-pulse"></div>
              )}
            </div>
            <div className={`p-3 ${metric.iconBg} rounded-xl`}>
              <metric.icon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function GerenteWhatsAppFinalPage() {
  const { toast } = useToast();
  
  // Usar hook WhatsApp com fallback
  let hookResult;
  try {
    hookResult = useWhatsApp();
  } catch (error) {
    console.warn('Hook WhatsApp falhou, usando simulação:', error);
    hookResult = {
      config: null,
      loading: false,
      connecting: false,
      error: null,
      connect: async () => {},
      disconnect: async () => {},
      checkStatus: async () => {},
      refreshConfig: async () => {}
    };
  }
  
  const { config, loading, connecting, error, connect, disconnect, checkStatus } = hookResult;
  
  // Estado para armazenar o nome da instância atual
  const [currentInstanceName, setCurrentInstanceName] = useState<string>('Usuario-carregando...');
  const [instanceNameLoading, setInstanceNameLoading] = useState<boolean>(true);
  
  // Estados locais como fallback
  const [localStatus, setLocalStatus] = useState<'desconectado' | 'aguardando_qr' | 'conectado'>('desconectado');
  const [localQrCode, setLocalQrCode] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Determinar status atual - usar hook se disponível, senão usar local
  const currentStatus = config?.status || localStatus;
  const currentQrCode = config?.qrcode || localQrCode;
  const currentError = error || localError;
  const isLoading = loading || connecting;
  
  // Função para conectar WhatsApp
  const handleConnect = useCallback(async () => {
    try {
      setLocalError(null);
      
      if (connect && typeof connect === 'function') {
        // Usar hook real
        await connect();
      } else {
        // Simulação local
        setLocalStatus('aguardando_qr');
        setLocalQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
        toast({
          title: "QR Code Gerado (Simulação)",
          description: "Esta é uma simulação - configure Evolution API para funcionamento real",
        });
        
        // Simular conexão após 3 segundos
        setTimeout(() => {
          setLocalStatus('conectado');
          toast({
            title: "WhatsApp Conectado (Simulação)",
            description: "Conexão simulada estabelecida",
          });
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLocalError(errorMessage);
      toast({
        title: "Erro na Conexão",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [connect, toast]);
  
  // Função para desconectar WhatsApp
  const handleDisconnect = useCallback(async () => {
    try {
      setLocalError(null);
      
      if (disconnect && typeof disconnect === 'function') {
        // Usar hook real
        await disconnect();
      } else {
        // Simulação local
        setLocalStatus('desconectado');
        setLocalQrCode(null);
        toast({
          title: "WhatsApp Desconectado (Simulação)",
          description: "Conexão simulada encerrada",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLocalError(errorMessage);
      toast({
        title: "Erro ao Desconectar",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [disconnect, toast]);
  
  // Função para verificar status
  const handleCheckStatus = useCallback(async () => {
    try {
      setLocalError(null);
      
      if (checkStatus && typeof checkStatus === 'function') {
        // Usar hook real
        await checkStatus();
      } else {
        // Simulação local
        toast({
          title: "Verificando Status (Simulação)",
          description: `Status atual: ${currentStatus}`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLocalError(errorMessage);
      toast({
        title: "Erro ao Verificar Status",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [checkStatus, toast, currentStatus]);
  
  // Funções auxiliares para status
  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  const getStatusIcon = useCallback((status: string) => {
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
  }, []);

  // Função para obter nome da instância atual
  const getCurrentInstanceName = useCallback(async () => {
    try {
      // Usar supabase client já disponível via hook
      const { supabase } = await import('@/integrations/supabase/client');
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
      console.error('Error getting instance name:', error);
      return 'Usuario-error'; // Fallback
    }
  }, []);

  // Carregar nome da instância na inicialização
  useEffect(() => {
    getCurrentInstanceName().then(name => {
      setCurrentInstanceName(name);
      setInstanceNameLoading(false);
      console.log('🔧 Current instance name:', name);
    }).catch(error => {
      console.error('Erro ao carregar nome da instância:', error);
      setCurrentInstanceName('Usuario-erro');
      setInstanceNameLoading(false);
    });
  }, [getCurrentInstanceName]);

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
            {config ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Integração Evolution API ativa</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2 text-sm text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>Modo simulação - configure Evolution API para funcionamento real</span>
              </div>
            )}
            
            {/* Mostrar nome da instância atual */}
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <QrCode className="h-4 w-4" />
                <span className="font-medium">Instância WhatsApp:</span>
                {instanceNameLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-xs text-blue-600">Carregando...</span>
                  </div>
                ) : (
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">
                    {currentInstanceName}
                  </code>
                )}
              </div>
            </div>
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
            <Badge 
              variant="outline"
              className={getStatusColor(currentStatus)}
            >
              {getStatusIcon(currentStatus)}
              <span className="ml-2">
                {currentStatus === 'conectado' ? 'Conectado' :
                 currentStatus === 'aguardando_qr' ? 'Aguardando QR' :
                 'Desconectado'}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code - SEMPRE VISÍVEL quando disponível */}
            {currentQrCode && (
              <div className="space-y-4">
                <div className="text-center">
                  <QrCode className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">QR Code para Conexão</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentStatus === 'aguardando_qr' ? 
                      'Escaneie este código com seu WhatsApp para conectar' :
                      'QR Code disponível - mantenha escaneado se necessário'
                    }
                  </p>
                  {currentStatus === 'aguardando_qr' && (
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        ⏰ Este QR Code expira em alguns minutos. Se expirar, clique em "Conectar WhatsApp" novamente.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    <img 
                      src={currentQrCode.startsWith('data:') ? currentQrCode : `data:image/png;base64,${currentQrCode}`}
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
                <div className={`p-3 rounded-full w-fit mx-auto mb-4 ${
                  currentStatus === 'conectado' ? 'bg-green-100 dark:bg-green-900/30 animate-pulse' :
                  currentStatus === 'aguardando_qr' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {currentStatus === 'conectado' ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : currentStatus === 'aguardando_qr' ? (
                    <QrCode className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <WifiOff className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  currentStatus === 'conectado' ? 'text-green-600 dark:text-green-400' :
                  currentStatus === 'aguardando_qr' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {currentStatus === 'conectado' ? '✅ WhatsApp Conectado' :
                   currentStatus === 'aguardando_qr' ? '⏳ Aguardando Conexão' :
                   '❌ WhatsApp Desconectado'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {currentStatus === 'conectado' ? '🎉 Sua conta WhatsApp Business está conectada e funcionando normalmente! Você pode enviar mensagens.' :
                   currentStatus === 'aguardando_qr' ? '📱 Escaneie o QR Code com seu WhatsApp para estabelecer a conexão.' :
                   '🔌 Conecte sua conta WhatsApp Business para começar a enviar mensagens.'}
                </p>
                
                {/* Indicador de status em tempo real */}
                {currentStatus === 'conectado' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-800 font-medium">
                        Conectado e funcionando
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* BOTÕES INTELIGENTES - ADAPTADOS AO STATUS ATUAL */}
              <div className="flex gap-3 justify-center flex-wrap">
                {/* Botão Conectar - DESABILITADO quando já conectado */}
                <Button 
                  onClick={handleConnect}
                  disabled={isLoading || currentStatus === 'conectado'}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title={currentStatus === 'conectado' ? 'WhatsApp já está conectado' : 'Conectar WhatsApp'}
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wifi className="mr-2 h-4 w-4" />
                  )}
                  {currentStatus === 'conectado' ? 'Conectado' : 'Conectar WhatsApp'}
                </Button>
                
                {/* Botão Desconectar - VISÍVEL apenas quando conectado */}
                {currentStatus === 'conectado' && (
                  <Button 
                    onClick={handleDisconnect}
                    variant="outline"
                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                  >
                    <WifiOff className="mr-2 h-4 w-4" />
                    Desconectar
                  </Button>
                )}
                
                {/* Botão Verificar Status - SEMPRE DISPONÍVEL */}
                <Button 
                  onClick={handleCheckStatus}
                  variant="outline"
                  className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                  title="Verifica status local e na Evolution API"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verificar Status
                </Button>
                
                {/* Botão Sincronizar - VISÍVEL quando conectado */}
                {currentStatus === 'conectado' && (
                  <Button 
                    onClick={handleCheckStatus}
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    title="Sincroniza com Evolution API para detectar mudanças"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sincronizar
                  </Button>
                )}
              </div>

              {/* Mostrar erro se existir */}
              {currentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-800 text-sm font-medium mb-1">Erro na conexão WhatsApp</p>
                      <p className="text-red-700 text-xs">{currentError}</p>
                      {currentError.includes('401') && (
                        <p className="text-red-600 text-xs mt-1">
                          💡 Dica: Verifique se você está logado corretamente
                        </p>
                      )}
                      {currentError.includes('500') && (
                        <p className="text-red-600 text-xs mt-1">
                          💡 Dica: Erro interno do servidor. Tente novamente em alguns minutos
                        </p>
                      )}
                      {currentError.includes('network') || currentError.includes('fetch') && (
                        <p className="text-red-600 text-xs mt-1">
                          💡 Dica: Verifique sua conexão com a internet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Dinâmicas */}
      <WhatsAppMetrics currentStatus={currentStatus} />
    </div>
  );
}





