import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Settings,
  BarChart3,
  Phone,
  Send,
  Users,
  Activity,
  TrendingUp,
  Shield,
  Clock,
  Zap
} from 'lucide-react';

type WhatsAppState = 'desconectado' | 'aguardando_qr' | 'conectado';

interface WhatsAppMetrics {
  totalMensagens: number;
  mensagensHoje: number;
  mensagensSemana: number;
  taxaResposta: number;
  tempoMedioResposta: number;
  leadsAtivos: number;
  statusConexao: WhatsAppState;
}

export default function GerenteWhatsAppPageFixed() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Usar hook WhatsApp com fallback
  let hookResult;
  try {
    hookResult = useWhatsApp();
  } catch (error) {
    console.warn('Hook WhatsApp falhou, usando fallback:', error);
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
  
  const { config, loading, connecting, error, connect, disconnect, checkStatus, refreshConfig } = hookResult;
  
  // Estados locais para UI com fallback
  const [localError, setLocalError] = useState<string | null>(null);
  const [forceStatus, setForceStatus] = useState<WhatsAppState | null>(null);

  // Determinar status atual - sempre mostrar botão se não há config
  const currentStatus = forceStatus || config?.status || 'desconectado';
  const hasConfig = config !== null;

  // Métricas simuladas - useMemo para otimização
  const metrics: WhatsAppMetrics = useMemo(() => ({
    totalMensagens: 1247,
    mensagensHoje: 43,
    mensagensSemana: 298,
    taxaResposta: 87.5,
    tempoMedioResposta: 2.3,
    leadsAtivos: 156,
    statusConexao: currentStatus
  }), [currentStatus]);

  // Função para limpar QR Code
  const cleanQRCode = useCallback((qrCode: string): string => {
    return qrCode.replace(/data:image\/[^;]+;base64,/, '');
  }, []);

  // Função para conectar WhatsApp
  const conectarWhatsApp = useCallback(async () => {
    try {
      setLocalError(null);
      setForceStatus('aguardando_qr');
      
      if (connect && typeof connect === 'function') {
        await connect();
      } else {
        // Simulação local
        toast({
          title: "Simulando Conexão",
          description: "Esta é uma simulação - configure Evolution API para funcionamento real",
        });
        setTimeout(() => {
          setForceStatus('conectado');
        }, 3000);
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erro desconhecido');
      setForceStatus('desconectado');
    }
  }, [connect, toast]);

  // Função para desconectar WhatsApp
  const desconectarWhatsApp = useCallback(async () => {
    try {
      setLocalError(null);
      setForceStatus('desconectado');
      
      if (disconnect && typeof disconnect === 'function') {
        await disconnect();
      } else {
        // Simulação local
        toast({
          title: "Simulando Desconexão",
          description: "Desconexão simulada",
        });
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }, [disconnect, toast]);

  // Função para verificar status
  const verificarStatus = useCallback(async () => {
    try {
      setLocalError(null);
      
      if (checkStatus && typeof checkStatus === 'function') {
        await checkStatus();
      } else {
        // Simulação local
        toast({
          title: "Verificando Status",
          description: "Verificação simulada",
        });
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }, [checkStatus, toast]);

  // Handlers para navegação - useCallback para otimização
  const handleViewReports = useCallback(() => {
    navigate('/gerente-relatorios');
    toast({
      title: "Navegando para Relatórios",
      description: "Redirecionando para a página de relatórios",
    });
  }, [navigate, toast]);

  const handleViewLeads = useCallback(() => {
    navigate('/todos-leads');
    toast({
      title: "Navegando para Leads",
      description: "Redirecionando para a página de leads",
    });
  }, [navigate, toast]);

  const handleRefresh = useCallback(async () => {
    try {
      setLocalError(null);
      if (refreshConfig && typeof refreshConfig === 'function') {
        await refreshConfig();
      }
      toast({
        title: "Configuração Atualizada",
        description: "Dados do WhatsApp atualizados com sucesso",
      });
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erro ao atualizar');
    }
  }, [refreshConfig, toast]);

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
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'desconectado':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  }, []);

  // Determinar se deve mostrar QR Code
  const shouldShowQR = currentStatus === 'aguardando_qr' && (config?.qrcode || forceStatus === 'aguardando_qr');

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
            {hasConfig ? (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Integração Evolution API ativa</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2 text-sm text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>Modo simulação - configure Evolution API</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white border-gray-300"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button
              onClick={handleViewReports}
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white border-gray-300"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <Button
              onClick={handleViewLeads}
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white border-gray-300"
              title="Ver leads"
            >
              <Users className="mr-2 h-4 w-4" />
              Leads
            </Button>
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
            {/* QR Code */}
            {shouldShowQR && (
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
                      src={config?.qrcode?.startsWith('data:') ? config.qrcode : 
                           config?.qrcode ? `data:image/png;base64,${config.qrcode}` :
                           'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='}
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
                  {currentStatus === 'conectado' ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : currentStatus === 'aguardando_qr' ? (
                    <Clock className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <WifiOff className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {currentStatus === 'conectado' ? 'WhatsApp Conectado' :
                   currentStatus === 'aguardando_qr' ? 'Aguardando Conexão' :
                   'WhatsApp Desconectado'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {currentStatus === 'conectado' ? 'Sua conta WhatsApp Business está conectada e funcionando normalmente.' :
                   currentStatus === 'aguardando_qr' ? 'Escaneie o QR Code com seu WhatsApp para estabelecer a conexão.' :
                   'Conecte sua conta WhatsApp Business para começar a enviar mensagens.'}
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                {/* SEMPRE MOSTRAR BOTÃO CONECTAR SE DESCONECTADO */}
                {currentStatus === 'desconectado' && (
                  <Button 
                    onClick={conectarWhatsApp}
                    disabled={connecting || loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {connecting ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wifi className="mr-2 h-4 w-4" />
                    )}
                    Conectar WhatsApp
                  </Button>
                )}
                
                {/* MOSTRAR BOTÃO DESCONECTAR SE CONECTADO */}
                {currentStatus === 'conectado' && (
                  <Button 
                    onClick={desconectarWhatsApp}
                    variant="outline"
                    disabled={connecting}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                  >
                    {connecting ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <WifiOff className="mr-2 h-4 w-4" />
                    )}
                    Desconectar
                  </Button>
                )}
                
                {/* MOSTRAR BOTÃO VERIFICAR SE AGUARDANDO QR */}
                {currentStatus === 'aguardando_qr' && (
                  <Button 
                    onClick={verificarStatus}
                    variant="outline"
                    disabled={connecting}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                  >
                    {connecting ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Verificar Status
                  </Button>
                )}
              </div>

              {/* Mostrar erro se existir */}
              {(error || localError) && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error || localError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">📱 Mensagens Hoje</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{metrics.mensagensHoje}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                +{Math.round(metrics.mensagensHoje * 0.12)}% vs ontem
              </p>
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
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{metrics.taxaResposta}%</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +{Math.round(metrics.taxaResposta * 0.05)}% vs semana passada
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">👥 Leads Ativos</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{metrics.leadsAtivos}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                +{Math.round(metrics.leadsAtivos * 0.08)}% vs mês passado
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">💬 Total Mensagens</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">{metrics.totalMensagens.toLocaleString()}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                +{Math.round(metrics.totalMensagens * 0.15)}% vs mês passado
              </p>
            </div>
            <div className="p-3 bg-amber-500 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}