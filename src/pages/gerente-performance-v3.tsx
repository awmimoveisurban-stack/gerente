import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useCorretorPerformanceReal } from '@/hooks/use-corretor-performance-real';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Star,
  Eye,
  ArrowRight,
  ChevronRight,
  Bell,
  Filter,
  Search,
  MoreHorizontal,
  Building2,
  UserCheck,
} from 'lucide-react';

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

export default function GerentePerformance() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ✅ USAR HOOK PADRONIZADO
  const { isRefreshing, handleRefresh } = useStandardLayout();
  
  // Estados
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Hook para dados reais de performance
  const {
    performances,
    metrics,
    alerts,
    loading,
    refetch,
  } = useCorretorPerformanceReal();

  const handleRefreshData = () => handleRefresh(refetch, toast);

  const handleExportCSV = () => {
    const csvContent = [
      ['Corretor', 'Email', 'Total Leads', 'Leads Ativos', 'Convertidos', 'Taxa Conversão', 'Score Qualidade', 'Valor Vendido', 'Ticket Médio'],
      ...performances.map(p => [
        p.corretor_nome,
        p.corretor_email,
        p.total_leads,
        p.leads_ativos,
        p.leads_convertidos,
        `${p.taxa_conversao.toFixed(1)}%`,
        p.score_qualidade,
        `R$ ${p.valor_vendido.toLocaleString()}`,
        `R$ ${p.ticket_medio.toLocaleString()}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `performance-equipe-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '✅ Relatório Exportado',
      description: 'Dados de performance exportados com sucesso!',
    });
  };

  const handleViewCorretorDetails = (corretorId: string) => {
    navigate(`/corretor-details/${corretorId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return STANDARD_COLORS.success;
    if (score >= 60) return STANDARD_COLORS.info;
    if (score >= 40) return STANDARD_COLORS.warning;
    return STANDARD_COLORS.danger;
  };

  if (loading) {
    return (
      <StandardPageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Carregando dados de performance...</span>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  // ✅ HEADER PADRONIZADO
  const headerActions = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefreshData}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExportCSV}>
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const headerBadges = [
    {
      icon: <Users className="h-3 w-3" />,
      text: `${metrics?.totalCorretores || 0} corretores`,
    },
    {
      icon: <Target className="h-3 w-3" />,
      text: `${metrics?.taxaMediaConversao?.toFixed(1) || '0.0'}% conversão`,
    },
    {
      icon: <DollarSign className="h-3 w-3" />,
      text: `R$ ${metrics?.valorTotalVendido?.toLocaleString() || '0'}`,
    },
  ];

  return (
    <ManagerRoute>
      <StandardPageLayout
        header={
          <StandardHeader
            title="Performance da Equipe"
            description="📊 Acompanhe o desempenho dos corretores em tempo real"
            icon={<Trophy className="h-6 w-6 text-white" />}
            badges={headerBadges}
            actions={headerActions}
          />
        }
      >
        {/* ✅ MÉTRICAS PADRONIZADAS */}
        {metrics && (
          <StandardGrid columns="4">
            <StandardMetricCard
              title="Total de Corretores"
              value={metrics.totalCorretores}
              icon={<Users className="h-6 w-6 text-white" />}
              color={STANDARD_COLORS.info}
            />
            <StandardMetricCard
              title="Taxa Média de Conversão"
              value={`${metrics.taxaMediaConversao.toFixed(1)}%`}
              icon={<Target className="h-6 w-6 text-white" />}
              color={STANDARD_COLORS.success}
            />
            <StandardMetricCard
              title="Valor Total Vendido"
              value={`R$ ${metrics.valorTotalVendido.toLocaleString()}`}
              icon={<DollarSign className="h-6 w-6 text-white" />}
              color={STANDARD_COLORS.purple}
            />
            <StandardMetricCard
              title="Tempo Médio de Resposta"
              value={`${metrics.tempoMedioResposta}h`}
              icon={<Clock className="h-6 w-6 text-white" />}
              color={STANDARD_COLORS.orange}
            />
          </StandardGrid>
        )}

        {/* ✅ RANKING DE CORRETORES */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking de Performance
              </CardTitle>
              <CardDescription>
                Classificação dos corretores por desempenho geral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performances.map((performance, index) => (
                  <motion.div
                    key={performance.corretor_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {performance.corretor_nome}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {performance.corretor_email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Leads</p>
                        <p className="font-semibold">{performance.total_leads}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Conversão</p>
                        <p className="font-semibold">{performance.taxa_conversao.toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
                        <Badge 
                          variant="outline" 
                          style={{ 
                            backgroundColor: getScoreColor(performance.score_qualidade) + '20',
                            color: getScoreColor(performance.score_qualidade),
                            borderColor: getScoreColor(performance.score_qualidade)
                          }}
                        >
                          {performance.score_qualidade}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Valor</p>
                        <p className="font-semibold text-green-600">
                          R$ {performance.valor_vendido.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCorretorDetails(performance.corretor_id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ ALERTAS E INSIGHTS */}
        {alerts.length > 0 && (
          <motion.div
            initial={STANDARD_ANIMATIONS.pageInitial}
            animate={STANDARD_ANIMATIONS.pageAnimate}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertas e Insights
                </CardTitle>
                <CardDescription>
                  Ações recomendadas para melhorar a performance da equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        alert.severidade === 'critica' ? 'bg-red-50 border border-red-200' :
                        alert.severidade === 'alta' ? 'bg-orange-50 border border-orange-200' :
                        alert.severidade === 'media' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <AlertTriangle className={`h-5 w-5 ${
                        alert.severidade === 'critica' ? 'text-red-600' :
                        alert.severidade === 'alta' ? 'text-orange-600' :
                        alert.severidade === 'media' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{alert.corretor_nome}</p>
                        <p className="text-sm text-muted-foreground">{alert.mensagem}</p>
                      </div>
                      <Badge variant={
                        alert.severidade === 'critica' ? 'destructive' :
                        alert.severidade === 'alta' ? 'destructive' :
                        alert.severidade === 'media' ? 'secondary' :
                        'default'
                      }>
                        {alert.severidade.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </StandardPageLayout>
    </ManagerRoute>
  );
}
