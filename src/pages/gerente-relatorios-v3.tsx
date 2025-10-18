import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  Calendar,
  Download,
  Filter,
  Building2,
  MessageSquare,
  Activity,
  Award,
  Star,
  Zap,
  Clock,
  ArrowRight,
  FileText,
  Send,
  UserPlus,
  Eye,
  Phone,
  Mail,
  LayoutGrid,
  Settings,
  RefreshCw,
} from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";

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

export default function GerenteRelatorios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, getLeadsStats, getLeadsByPeriod, refetch } = useLeads();
  
  // ✅ USAR HOOK PADRONIZADO
  const { isRefreshing, handleRefresh } = useStandardLayout();
  
  const [periodo, setPeriodo] = useState<string>("30");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");

  const stats = getLeadsStats();
  const leadsPeriodo = getLeadsByPeriod(parseInt(periodo));
  
  const leadsFiltrados = statusFiltro === "todos" 
    ? leadsPeriodo 
    : leadsPeriodo.filter(lead => lead.status === statusFiltro);

  const leadsPorMes = leads.reduce((acc, lead) => {
    const mes = new Date(lead.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leadsPorStatus = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const valorTotalVendas = leads
    .filter(lead => lead.status === 'fechado')
    .reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0);

  const taxaConversao = leads.length > 0 
    ? ((stats.fechado / stats.total) * 100).toFixed(1)
    : '0';

  // Métricas específicas do gerente
  const leadsAtivos = stats.interessado + stats.visita_agendada + stats.proposta;
  const tempoMedioVenda = 45; // dias (simulado)
  const metaMensal = 50; // leads (simulado)
  const performanceMeta = ((leadsPeriodo.length / metaMensal) * 100).toFixed(1);
  
  // Métricas adicionais para gerente
  const totalLeads = leads.length;
  const leadsFechados = leads.filter(lead => lead.status.toLowerCase() === "fechado").length;
  const leadsNovos = leads.filter(lead => lead.status.toLowerCase() === "novo").length;
  const leadsInteressados = leads.filter(lead => lead.status.toLowerCase() === "interessado").length;
  const leadsVisitas = leads.filter(lead => lead.status.toLowerCase() === "visita_agendada").length;
  const leadsPropostas = leads.filter(lead => lead.status.toLowerCase() === "proposta").length;
  
  // Valor total dos leads ativos (pipeline)
  const valorTotalPipeline = leads.filter(lead => !["fechado", "perdido"].includes(lead.status.toLowerCase())).reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0);
  
  // Ticket médio
  const ticketMedio = stats.fechado > 0 ? valorTotalVendas / stats.fechado : 0;
  
  // Progresso da meta
  const progressoMeta = leadsPeriodo.length > 0 ? Math.min((leadsPeriodo.length / metaMensal) * 100, 100) : 0;

  const handleRefreshData = () => handleRefresh(refetch, toast);

  const exportarRelatorio = () => {
    try {
      // Gerar CSV formatado
      let csv = '📊 RELATÓRIO GERENCIAL - SUPABASE DEALS\n\n';
      csv += `Data de Geração: ${new Date().toLocaleString('pt-BR')}\n`;
      csv += `Período: Últimos ${periodo} dias\n\n`;
      
      csv += '📈 MÉTRICAS GERAIS\n';
      csv += `Total de Leads: ${totalLeads}\n`;
      csv += `Leads Fechados: ${leadsFechados}\n`;
      csv += `Taxa de Conversão: ${taxaConversao}%\n`;
      csv += `Valor Total Vendido: R$ ${(valorTotalVendas || 0).toLocaleString()}\n`;
      csv += `Ticket Médio: R$ ${(ticketMedio || 0).toLocaleString()}\n\n`;
      
      csv += '📊 DISTRIBUIÇÃO POR STATUS\n';
      Object.entries(leadsPorStatus).forEach(([status, count]) => {
        csv += `${status}: ${count}\n`;
      });
      
      csv += '\n📅 DISTRIBUIÇÃO POR MÊS\n';
      Object.entries(leadsPorMes).forEach(([mes, count]) => {
        csv += `${mes}: ${count}\n`;
      });
      
      csv += '\n🎯 PERFORMANCE\n';
      csv += `Meta Mensal: ${metaMensal} leads\n`;
      csv += `Performance: ${performanceMeta}%\n`;
      csv += `Tempo Médio de Venda: ${tempoMedioVenda} dias\n`;
      
      // Criar e baixar arquivo
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-gerencial-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: '✅ Relatório Exportado',
        description: 'Relatório gerencial exportado com sucesso!',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao Exportar',
        description: 'Não foi possível exportar o relatório',
        variant: 'destructive',
      });
    }
  };

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
      <Button onClick={exportarRelatorio} size="sm">
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    </>
  );

  const headerBadges = [
    {
      icon: <BarChart3 className="h-3 w-3" />,
      text: `${totalLeads} leads totais`,
    },
    {
      icon: <Target className="h-3 w-3" />,
      text: `${taxaConversao}% conversão`,
    },
    {
      icon: <DollarSign className="h-3 w-3" />,
      text: `R$ ${(valorTotalVendas || 0).toLocaleString()}`,
    },
  ];

  return (
    <ManagerRoute>
      <StandardPageLayout
        header={
          <StandardHeader
            title="Relatórios Gerenciais"
            description="📊 Análise completa de performance e métricas da equipe"
            icon={<BarChart3 className="h-6 w-6 text-white" />}
            badges={headerBadges}
            actions={headerActions}
          />
        }
      >
        {/* ✅ MÉTRICAS PRINCIPAIS PADRONIZADAS */}
        <StandardGrid columns="4">
          <StandardMetricCard
            title="Total de Leads"
            value={totalLeads}
            icon={Users}
            color="info"
          />
          <StandardMetricCard
            title="Leads Fechados"
            value={leadsFechados}
            icon={Target}
            color="success"
          />
          <StandardMetricCard
            title="Taxa de Conversão"
            value={`${taxaConversao}%`}
            icon={TrendingUp}
            color="purple"
          />
          <StandardMetricCard
            title="Valor Vendido"
            value={`R$ ${(valorTotalVendas || 0).toLocaleString()}`}
            icon={DollarSign}
            color="orange"
          />
        </StandardGrid>

        {/* ✅ FILTROS E PERÍODO */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                Filtros e Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 90 dias</SelectItem>
                      <SelectItem value="365">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="interessado">Interessado</SelectItem>
                      <SelectItem value="visita_agendada">Visita Agendada</SelectItem>
                      <SelectItem value="proposta">Proposta</SelectItem>
                      <SelectItem value="fechado">Fechado</SelectItem>
                      <SelectItem value="perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={exportarRelatorio} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ MÉTRICAS DETALHADAS */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Métricas Detalhadas
              </CardTitle>
              <CardDescription>
                Análise detalhada do pipeline de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Leads Novos</h3>
                  <p className="text-2xl font-bold text-blue-600">{leadsNovos}</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold">Interessados</h3>
                  <p className="text-2xl font-bold text-yellow-600">{leadsInteressados}</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Visitas</h3>
                  <p className="text-2xl font-bold text-purple-600">{leadsVisitas}</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold">Propostas</h3>
                  <p className="text-2xl font-bold text-orange-600">{leadsPropostas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ PERFORMANCE E METAS */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Performance e Metas
              </CardTitle>
              <CardDescription>
                Acompanhamento de metas e performance da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Meta Mensal de Leads</span>
                    <span className="text-sm text-gray-600">{leadsPeriodo.length} / {metaMensal}</span>
                  </div>
                  <Progress value={progressoMeta} className="h-2" />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{performanceMeta}% da meta</span>
                    <span className="text-xs text-gray-500">{metaMensal - leadsPeriodo.length} restantes</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Tempo Médio</h3>
                    <p className="text-2xl font-bold text-blue-600">{tempoMedioVenda} dias</p>
                    <p className="text-xs text-gray-500">Para fechar venda</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Ticket Médio</h3>
                    <p className="text-2xl font-bold text-green-600">R$ {(ticketMedio || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Por venda</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Pipeline</h3>
                    <p className="text-2xl font-bold text-purple-600">R$ {(valorTotalPipeline || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Em negociação</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </StandardPageLayout>
    </ManagerRoute>
  );
}
