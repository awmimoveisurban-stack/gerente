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

export default function GerenteWhatsAppPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config, loading, connecting, error, connect, disconnect, checkStatus, refreshConfig } = useWhatsApp();
  
  // Estados locais para UI
  const [localError, setLocalError] = useState<string | null>(null);

  // Métricas simuladas - useMemo para otimização
  const metrics: WhatsAppMetrics = useMemo(() => ({
    totalMensagens: 1247,
    mensagensHoje: 43,
    mensagensSemana: 298,
    taxaResposta: 87.5,
    tempoMedioResposta: 2.3,
    leadsAtivos: 156,
    statusConexao: config?.status || 'desconectado'
  }), [config?.status]);

  // Função para limpar QR Code
  const cleanQRCode = useCallback((qrCode: string): string => {
    return qrCode.replace(/data:image\/[^;]+;base64,/, '');
  }, []);

  // Função para conectar WhatsApp
  const conectarWhatsApp = useCallback(async () => {
    try {
      setLocalError(null);
      await connect();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }, [connect]);

  // Função para desconectar WhatsApp
  const desconectarWhatsApp = useCallback(async () => {
    try {
      setLocalError(null);
      await disconnect();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }, [disconnect]);

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
      await refreshConfig();
      toast({
        title: "Dados Atualizados",
        description: "As informações do WhatsApp foram atualizadas",
      });
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Erro ao atualizar');
    }
  }, [refreshConfig, toast]);

  // Função para obter cor do status
  const getStatusColor = useCallback((status: WhatsAppState) => {
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

  // Função para obter ícone do status
  const getStatusIcon = useCallback((status: WhatsAppState) => {
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
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MessageSquare className="h-4 w-4" />
                <span>{metrics.totalMensagens} mensagens enviadas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>{metrics.leadsAtivos} leads ativos</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
                aria-label="Atualizar dados"
                title="Atualizar dados"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleViewReports} 
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-950/20"
                aria-label="Ver relatórios"
                title="Ver relatórios"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleViewLeads} 
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
                aria-label="Ver leads"
                title="Ver leads"
              >
                <Users className="mr-2 h-4 w-4" />
                Leads
              </Button>
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
              className={getStatusColor(config?.status || 'desconectado')}
            >
              {getStatusIcon(config?.status || 'desconectado')}
              <span className="ml-2">
                {config?.status === 'conectado' ? 'Conectado' :
                 config?.status === 'aguardando_qr' ? 'Aguardando QR' :
                 'Desconectado'}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code */}
            {config?.status === 'aguardando_qr' && config?.qrcode && (
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
                      src={config.qrcode.startsWith('data:') ? config.qrcode : `data:image/png;base64,${config.qrcode}`}
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
                  {config?.status === 'conectado' ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : config?.status === 'aguardando_qr' ? (
                    <Clock className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <WifiOff className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {config?.status === 'conectado' ? 'WhatsApp Conectado' :
                   config?.status === 'aguardando_qr' ? 'Aguardando Conexão' :
                   'WhatsApp Desconectado'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {config?.status === 'conectado' ? 'Sua conta WhatsApp Business está conectada e funcionando normalmente.' :
                   config?.status === 'aguardando_qr' ? 'Escaneie o QR Code com seu WhatsApp para estabelecer a conexão.' :
                   'Conecte sua conta WhatsApp Business para começar a enviar mensagens.'}
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                {(!config || config.status === 'desconectado') && (
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
                
                {config?.status === 'conectado' && (
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
                
                {config?.status === 'aguardando_qr' && (
                  <Button 
                    onClick={checkStatus}
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

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Mensagens Hoje */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">📱 Mensagens Hoje</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{metrics.mensagensHoje}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {metrics.mensagensSemana} esta semana
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <Send className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Taxa de Resposta */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">📈 Taxa de Resposta</p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{metrics.taxaResposta}%</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Tempo médio: {metrics.tempoMedioResposta}h
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${metrics.taxaResposta}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-emerald-500 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Leads Ativos */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">👥 Leads Ativos</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{metrics.leadsAtivos}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Conversas ativas
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Total de Mensagens */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">💬 Total de Mensagens</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">{metrics.totalMensagens}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Desde o início
              </p>
            </div>
            <div className="p-3 bg-amber-500 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Configurações Avançadas */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-gray-500 rounded-lg">
                <Settings className="h-4 w-4 text-white" />
              </div>
              Configurações Avançadas
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              ⚙️ Gerencie configurações avançadas da integração WhatsApp
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="font-medium">Segurança</span>
              <span className="text-xs text-gray-500">Configurar autenticação</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-950/20"
            >
              <MessageSquare className="h-6 w-6 text-green-500" />
              <span className="font-medium">Templates</span>
              <span className="text-xs text-gray-500">Gerenciar mensagens</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-950/20"
            >
              <Zap className="h-6 w-6 text-purple-500" />
              <span className="font-medium">Automação</span>
              <span className="text-xs text-gray-500">Configurar respostas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}