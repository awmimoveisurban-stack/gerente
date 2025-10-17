import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCorretorPerformance } from '@/hooks/use-corretor-performance';
import {
  exportToCSV,
  printPerformanceReport,
  exportToExcel,
} from '@/utils/export-performance-report';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  RefreshCw,
  Download,
  Award,
  Zap,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Users,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  Activity,
  FileText,
  Printer,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';

export default function GerentePerformance() {
  const navigate = useNavigate();
  const { performances, ranking, alerts, loading, forceUpdateStats, refetch } =
    useCorretorPerformance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ DADOS MOCK PARA DEMONSTRAÇÃO (quando não há dados reais)
  const mockPerformances = [
    {
      user_id: '1',
      email: 'joao@imobiliaria.com',
      corretor_nome: 'João Silva',
      total_leads: 45,
      leads_ativos: 12,
      leads_convertidos: 18,
      leads_perdidos: 15,
      taxa_conversao: 85,
      tempo_medio_primeira_resposta: 12,
      score_qualidade: 92,
      leads_sem_resposta: 0,
      valor_total_vendido: 2500000,
      ticket_medio: 138888,
      stats_atualizadas_em: new Date().toISOString(),
    },
    {
      user_id: '2',
      email: 'maria@imobiliaria.com',
      corretor_nome: 'Maria Santos',
      total_leads: 38,
      leads_ativos: 8,
      leads_convertidos: 15,
      leads_perdidos: 15,
      taxa_conversao: 78,
      tempo_medio_primeira_resposta: 18,
      score_qualidade: 88,
      leads_sem_resposta: 1,
      valor_total_vendido: 1800000,
      ticket_medio: 120000,
      stats_atualizadas_em: new Date().toISOString(),
    },
    {
      user_id: '3',
      email: 'carlos@imobiliaria.com',
      corretor_nome: 'Carlos Oliveira',
      total_leads: 32,
      leads_ativos: 6,
      leads_convertidos: 10,
      leads_perdidos: 16,
      taxa_conversao: 62,
      tempo_medio_primeira_resposta: 45,
      score_qualidade: 75,
      leads_sem_resposta: 3,
      valor_total_vendido: 1200000,
      ticket_medio: 120000,
      stats_atualizadas_em: new Date().toISOString(),
    },
    {
      user_id: '4',
      email: 'ana@imobiliaria.com',
      corretor_nome: 'Ana Costa',
      total_leads: 28,
      leads_ativos: 4,
      leads_convertidos: 8,
      leads_perdidos: 16,
      taxa_conversao: 50,
      tempo_medio_primeira_resposta: 90,
      score_qualidade: 65,
      leads_sem_resposta: 5,
      valor_total_vendido: 800000,
      ticket_medio: 100000,
      stats_atualizadas_em: new Date().toISOString(),
    },
  ];

  const mockAlerts = [
    {
      id: '1',
      tipo: 'lead_sem_resposta' as const,
      severidade: 'alta' as const,
      corretor_id: '4',
      corretor_nome: 'Ana Costa',
      mensagem: '5 lead(s) sem resposta há mais de 24h',
      valor: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      tipo: 'tempo_resposta_alto' as const,
      severidade: 'media' as const,
      corretor_id: '3',
      corretor_nome: 'Carlos Oliveira',
      mensagem: 'Tempo médio de resposta: 45min',
      valor: 45,
      created_at: new Date().toISOString(),
    },
  ];

  // Usar dados mock se não há dados reais
  const displayPerformances =
    performances.length > 0 ? performances : mockPerformances;
  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleForceUpdate = async () => {
    setIsRefreshing(true);
    await forceUpdateStats();
    setIsRefreshing(false);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'print') => {
    try {
      switch (format) {
        case 'csv':
          exportToCSV(performances, 'relatorio_performance');
          toast.success('Relatório exportado para CSV!');
          break;
        case 'excel':
          const success = await exportToExcel(
            performances,
            'relatorio_performance'
          );
          if (success) {
            toast.success('Relatório exportado para Excel!');
          } else {
            toast.info('Exportado como CSV (fallback)');
          }
          break;
        case 'print':
          printPerformanceReport(performances);
          toast.success('Abrindo visualização de impressão...');
          break;
      }
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  // Função para obter cor do score
  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  // Função para obter cor da conversão
  const getConversaoColor = (taxa: number) => {
    if (taxa >= 80) return 'text-green-600';
    if (taxa >= 70) return 'text-green-500';
    if (taxa >= 60) return 'text-yellow-500';
    if (taxa >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  // Função para formatar tempo
  const formatarTempo = (minutos: number | null) => {
    if (!minutos) return 'N/A';
    if (minutos < 60) return `${Math.round(minutos)}min`;
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  // Função para obter cor do tempo de resposta
  const getTempoColor = (minutos: number | null) => {
    if (!minutos) return 'text-gray-400';
    if (minutos <= 15) return 'text-green-600';
    if (minutos <= 30) return 'text-green-500';
    if (minutos <= 60) return 'text-yellow-500';
    if (minutos <= 120) return 'text-orange-500';
    return 'text-red-500';
  };

  // Função para obter severidade do alerta
  const getSeveridadeStyle = (severidade: string) => {
    switch (severidade) {
      case 'critica':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'alta':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'media':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  // Função para obter ícone do alerta
  const getAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'lead_sem_resposta':
        return <MessageSquare className='h-4 w-4' />;
      case 'lead_quente_parado':
        return <AlertTriangle className='h-4 w-4' />;
      case 'baixa_conversao':
        return <TrendingDown className='h-4 w-4' />;
      case 'tempo_resposta_alto':
        return <Clock className='h-4 w-4' />;
      default:
        return <AlertTriangle className='h-4 w-4' />;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <RefreshCw className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
            <p className='text-gray-600'>Carregando performance...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3'>
              <Trophy className='h-6 w-6 sm:h-8 sm:w-8 text-yellow-500' />
              Performance da Equipe
            </h1>
            <p className='text-sm sm:text-base text-gray-600 mt-1'>
              Monitore o desempenho de cada corretor em tempo real
              {performances.length === 0 && (
                <span className='ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded'>
                  📊 Dados de demonstração
                </span>
              )}
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
            <Button
              variant='outline'
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Atualizar
            </Button>
            <Button
              variant='outline'
              onClick={handleForceUpdate}
              disabled={isRefreshing}
            >
              <Activity className='h-4 w-4 mr-2' />
              Recalcular Stats
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline'>
                  <Download className='h-4 w-4 mr-2' />
                  Exportar
                  <ChevronDown className='h-4 w-4 ml-2' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className='h-4 w-4 mr-2' />
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className='h-4 w-4 mr-2' />
                  Exportar Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('print')}>
                  <Printer className='h-4 w-4 mr-2' />
                  Imprimir / PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Alertas Críticos */}
        {displayAlerts.length > 0 && (
          <Card className='border-red-300 bg-red-50'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-red-800'>
                <AlertTriangle className='h-5 w-5' />
                Alertas Críticos ({displayAlerts.length})
              </CardTitle>
              <CardDescription>
                Situações que requerem atenção imediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {displayAlerts.slice(0, 5).map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getSeveridadeStyle(alert.severidade)} flex items-start justify-between`}
                  >
                    <div className='flex items-start gap-3 flex-1'>
                      {getAlertaIcon(alert.tipo)}
                      <div className='flex-1'>
                        <p className='font-semibold'>{alert.corretor_nome}</p>
                        <p className='text-sm'>{alert.mensagem}</p>
                        {alert.lead_nome && (
                          <p className='text-xs mt-1'>
                            Lead: {alert.lead_nome}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant='outline' className='ml-2'>
                      {alert.severidade.toUpperCase()}
                    </Badge>
                  </div>
                ))}
                {displayAlerts.length > 5 && (
                  <Button variant='link' className='w-full'>
                    Ver todos os {displayAlerts.length} alertas
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking de Corretores */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Award className='h-5 w-5 text-yellow-500' />
              Ranking de Corretores
            </CardTitle>
            <CardDescription>
              Ordenado por Score de Qualidade e Taxa de Conversão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {(() => {
                // Calcular ranking com dados mock se necessário
                const mockRanking = displayPerformances.map((perf, index) => {
                  const badges = [];
                  if (index === 0) badges.push('🏆 Líder');
                  else if (index === 1) badges.push('🥈 Vice-líder');
                  else if (index === 2) badges.push('🥉 Top 3');

                  if (perf.taxa_conversao >= 80)
                    badges.push('🎯 Melhor Conversão');
                  if (perf.valor_total_vendido > 2000000)
                    badges.push('💰 Top Vendas');
                  if (perf.tempo_medio_primeira_resposta <= 15)
                    badges.push('⚡ Mais Rápido');

                  const score = perf.score_qualidade || 0;
                  if (score >= 90) badges.push('⭐ Excelente');
                  else if (score >= 80) badges.push('✨ Ótimo');
                  else if (score >= 70) badges.push('👍 Bom');

                  return {
                    posicao: index + 1,
                    corretor: perf,
                    badges,
                  };
                });

                return mockRanking;
              })().map(item => {
                const corretor = item.corretor;
                const score = corretor.score_qualidade || 0;

                return (
                  <div
                    key={corretor.user_id}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      item.posicao === 1
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400'
                        : item.posicao === 2
                          ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400'
                          : item.posicao === 3
                            ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-400'
                            : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center gap-3'>
                        {/* Posição */}
                        <div
                          className={`text-3xl font-bold ${
                            item.posicao === 1
                              ? 'text-yellow-600'
                              : item.posicao === 2
                                ? 'text-gray-600'
                                : item.posicao === 3
                                  ? 'text-orange-600'
                                  : 'text-gray-400'
                          }`}
                        >
                          #{item.posicao}
                        </div>

                        {/* Nome e Email */}
                        <div>
                          <h3 className='text-lg font-bold text-gray-900'>
                            {corretor.corretor_nome}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {corretor.email}
                          </p>
                        </div>
                      </div>

                      {/* Score de Qualidade */}
                      <div className='text-right'>
                        <div
                          className={`text-4xl font-bold ${getScoreColor(score)}`}
                        >
                          {score}
                        </div>
                        <p className='text-xs text-gray-500 uppercase tracking-wide'>
                          Score
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    {item.badges.length > 0 && (
                      <div className='flex flex-wrap gap-2 mb-3'>
                        {item.badges.map((badge, idx) => (
                          <Badge
                            key={idx}
                            variant='outline'
                            className='bg-white/50 border-gray-300'
                          >
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Métricas */}
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 text-sm'>
                      {/* Total Leads */}
                      <div className='bg-white/70 p-2 rounded'>
                        <div className='flex items-center gap-1 text-gray-600 mb-1'>
                          <Users className='h-3 w-3' />
                          <span className='text-xs'>Total</span>
                        </div>
                        <div className='text-lg font-bold text-gray-900'>
                          {corretor.total_leads}
                        </div>
                      </div>

                      {/* Taxa de Conversão */}
                      <div className='bg-white/70 p-2 rounded'>
                        <div className='flex items-center gap-1 text-gray-600 mb-1'>
                          <Target className='h-3 w-3' />
                          <span className='text-xs'>Conversão</span>
                        </div>
                        <div
                          className={`text-lg font-bold ${getConversaoColor(corretor.taxa_conversao)}`}
                        >
                          {corretor.taxa_conversao}%
                        </div>
                      </div>

                      {/* Tempo de Resposta */}
                      <div className='bg-white/70 p-2 rounded'>
                        <div className='flex items-center gap-1 text-gray-600 mb-1'>
                          <Clock className='h-3 w-3' />
                          <span className='text-xs'>Resposta</span>
                        </div>
                        <div
                          className={`text-lg font-bold ${getTempoColor(corretor.tempo_medio_primeira_resposta)}`}
                        >
                          {formatarTempo(
                            corretor.tempo_medio_primeira_resposta
                          )}
                        </div>
                      </div>

                      {/* Leads Ativos */}
                      <div className='bg-white/70 p-2 rounded'>
                        <div className='flex items-center gap-1 text-gray-600 mb-1'>
                          <Activity className='h-3 w-3' />
                          <span className='text-xs'>Ativos</span>
                        </div>
                        <div className='text-lg font-bold text-blue-600'>
                          {corretor.leads_ativos}
                        </div>
                      </div>

                      {/* Valor Vendido */}
                      <div className='bg-white/70 p-2 rounded'>
                        <div className='flex items-center gap-1 text-gray-600 mb-1'>
                          <DollarSign className='h-3 w-3' />
                          <span className='text-xs'>Vendido</span>
                        </div>
                        <div className='text-lg font-bold text-green-600'>
                          {corretor.valor_total_vendido > 0
                            ? `R$ ${(corretor.valor_total_vendido / 1000).toFixed(0)}k`
                            : 'R$ 0'}
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso (Taxa de Conversão) */}
                    <div className='mt-3'>
                      <div className='flex justify-between text-xs text-gray-600 mb-1'>
                        <span>Taxa de Conversão</span>
                        <span>
                          {corretor.taxa_conversao}% de {corretor.total_leads}{' '}
                          leads
                        </span>
                      </div>
                      <Progress
                        value={corretor.taxa_conversao}
                        className='h-2'
                      />
                    </div>

                    {/* Alertas do Corretor */}
                    {corretor.leads_sem_resposta &&
                      corretor.leads_sem_resposta > 0 && (
                        <div className='mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800 flex items-center gap-2'>
                          <AlertTriangle className='h-4 w-4' />
                          {corretor.leads_sem_resposta} lead(s) sem resposta há
                          mais de 24h
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Gerais */}
        <div className='grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Melhor Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayPerformances.length > 0 && (
                <>
                  <div className='text-2xl font-bold text-green-600'>
                    {Math.max(
                      ...displayPerformances.map(p => p.taxa_conversao)
                    )}
                    %
                  </div>
                  <p className='text-xs text-gray-600 mt-1'>
                    {
                      displayPerformances.find(
                        p =>
                          p.taxa_conversao ===
                          Math.max(
                            ...displayPerformances.map(p => p.taxa_conversao)
                          )
                      )?.corretor_nome
                    }
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Mais Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayPerformances.length > 0 &&
                (() => {
                  const comResposta = displayPerformances.filter(
                    p => p.tempo_medio_primeira_resposta
                  );
                  const maisRapido =
                    comResposta.length > 0
                      ? comResposta.reduce((min, p) =>
                          p.tempo_medio_primeira_resposta! <
                          (min.tempo_medio_primeira_resposta || Infinity)
                            ? p
                            : min
                        )
                      : null;
                  return maisRapido ? (
                    <>
                      <div className='text-2xl font-bold text-blue-600'>
                        {formatarTempo(
                          maisRapido.tempo_medio_primeira_resposta
                        )}
                      </div>
                      <p className='text-xs text-gray-600 mt-1'>
                        {maisRapido.corretor_nome}
                      </p>
                    </>
                  ) : (
                    <div className='text-sm text-gray-400'>N/A</div>
                  );
                })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Top Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayPerformances.length > 0 &&
                (() => {
                  const topVendedor = displayPerformances.reduce(
                    (max, p) =>
                      p.valor_total_vendido > max.valor_total_vendido ? p : max,
                    displayPerformances[0]
                  );
                  return (
                    <>
                      <div className='text-2xl font-bold text-green-600'>
                        R$ {(topVendedor.valor_total_vendido / 1000).toFixed(0)}
                        k
                      </div>
                      <p className='text-xs text-gray-600 mt-1'>
                        {topVendedor.corretor_nome}
                      </p>
                    </>
                  );
                })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Total de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${displayAlerts.length > 0 ? 'text-red-600' : 'text-gray-400'}`}
              >
                {displayAlerts.length}
              </div>
              <p className='text-xs text-gray-600 mt-1'>
                {displayAlerts.filter(a => a.severidade === 'critica').length}{' '}
                críticos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
