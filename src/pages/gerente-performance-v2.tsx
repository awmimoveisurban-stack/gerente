import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useCorretorPerformanceReal } from '@/hooks/use-corretor-performance-real';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

// 🎨 PALETA DE CORES OTIMIZADA (igual ao dashboard)
const COLORS = {
  primary: '#6366F1',      // Indigo mais moderno
  success: '#10B981',      // Verde mantido
  warning: '#F59E0B',      // Amarelo mantido
  danger: '#EF4444',       // Vermelho mantido
  info: '#3B82F6',         // Azul mantido
  purple: '#8B5CF6',       // Roxo mantido
  teal: '#14B8A6',         // Teal mantido
  orange: '#F97316',       // Laranja mantido
};


export default function GerentePerformance() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Hook para dados reais de performance
  const {
    performances,
    metrics,
    alerts,
    loading,
    refetch,
  } = useCorretorPerformanceReal();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: '✅ Dados Atualizados',
        description: 'Performance da equipe atualizada com sucesso!',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao Atualizar',
        description: 'Não foi possível atualizar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Corretor', 'Email', 'Total Leads', 'Leads Ativos', 'Convertidos', 'Taxa Conversão', 'Score Qualidade', 'Valor Vendido', 'Ticket Médio'],
      ...performances.map(p => [
        p.corretor_nome,
        p.email,
        p.total_leads,
        p.leads_ativos,
        p.leads_convertidos,
        `${p.taxa_conversao}%`,
        p.score_qualidade,
        `R$ ${p.valor_total_vendido.toLocaleString()}`,
        `R$ ${p.ticket_medio.toLocaleString()}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-equipe-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: '✅ Relatório Exportado',
      description: 'Relatório de performance exportado com sucesso!',
    });
  };

  const getPerformanceBadge = (taxaConversao: number) => {
    if (taxaConversao >= 80) return { text: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (taxaConversao >= 60) return { text: 'Bom', color: 'bg-blue-100 text-blue-800' };
    if (taxaConversao >= 40) return { text: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Precisa Melhorar', color: 'bg-red-100 text-red-800' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.info;
    if (score >= 40) return COLORS.warning;
    return COLORS.danger;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Carregando dados de performance...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance da Equipe</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho dos corretores em tempo real
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
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
          </div>
        </div>

        {/* Métricas Gerais */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Corretores</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalCorretores}</div>
                  <p className="text-xs text-muted-foreground">
                    Equipe ativa
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa Média de Conversão</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.taxaMediaConversao}%</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.totalLeads} leads totais
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total Vendido</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {metrics.valorTotalVendido.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.totalConvertidos} conversões
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.tempoMedioResposta}min</div>
                  <p className="text-xs text-muted-foreground">
                    Primeira resposta
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Ranking de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Ranking de Performance
            </CardTitle>
            <CardDescription>
              Classificação dos corretores por taxa de conversão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performances.map((performance, index) => {
                const badge = getPerformanceBadge(performance.taxa_conversao);
                const scoreColor = getScoreColor(performance.score_qualidade);
                
                return (
                  <motion.div
                    key={performance.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      hoveredCard === performance.user_id 
                        ? 'shadow-lg border-primary' 
                        : 'hover:shadow-md'
                    }`}
                    onMouseEnter={() => setHoveredCard(performance.user_id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{performance.corretor_nome}</h3>
                          <p className="text-sm text-muted-foreground">{performance.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: scoreColor }}>
                            {performance.taxa_conversao}%
                          </div>
                          <p className="text-xs text-muted-foreground">Conversão</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">{performance.total_leads}</div>
                          <p className="text-xs text-muted-foreground">Total Leads</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {performance.leads_convertidos}
                          </div>
                          <p className="text-xs text-muted-foreground">Convertidos</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            R$ {performance.valor_total_vendido.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">Vendas</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={badge.color}>
                            {badge.text}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/gerente-equipe?corretor=${performance.user_id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Score de Qualidade</span>
                        <span className="font-medium">{performance.score_qualidade}/100</span>
                      </div>
                      <Progress 
                        value={performance.score_qualidade} 
                        className="h-2"
                        style={{
                          backgroundColor: `${scoreColor}20`,
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas e Insights
            </CardTitle>
            <CardDescription>
              Pontos de atenção e oportunidades de melhoria
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
              
              {alerts.length === 0 && performances.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>🎉 Excelente! Nenhum alerta crítico encontrado</p>
                  <p className="text-sm">A equipe está performando bem</p>
                </div>
              )}
              
              {performances.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum corretor encontrado</p>
                  <p className="text-sm">Adicione corretores para ver as métricas de performance</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
