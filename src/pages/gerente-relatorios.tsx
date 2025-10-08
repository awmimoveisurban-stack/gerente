import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
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
  Settings
} from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";

export default function GerenteRelatorios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, getLeadsStats, getLeadsByPeriod } = useLeads();
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

  const exportarRelatorio = () => {
    const dados = {
      tipo: "Relatório Gerencial",
      periodo: `${periodo} dias`,
      totalLeads: leadsFiltrados.length,
      leadsPorStatus,
      valorTotalVendas,
      taxaConversao,
      leadsPorMes,
      leadsAtivos,
      tempoMedioVenda,
      metaMensal,
      performanceMeta,
      metricasGerenciais: {
        valorTotalPipeline,
        ticketMedio,
        leadsNovos,
        leadsInteressados,
        leadsVisitas,
        leadsPropostas,
        leadsFechados,
        progressoMeta: `${progressoMeta.toFixed(1)}%`
      }
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-gerencial-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório Gerencial Exportado",
      description: `Relatório dos últimos ${periodo} dias exportado com sucesso`,
    });
  };

  const handleViewTodosLeads = () => {
    navigate('/todos-leads');
    toast({
      title: "Navegando para Todos os Leads",
      description: "Redirecionando para a página de gestão de leads",
    });
  };

  const handleViewEquipe = () => {
    navigate('/gerente/equipe');
    toast({
      title: "Navegando para Equipe",
      description: "Redirecionando para a página de gestão da equipe",
    });
  };

  const handleViewKanban = () => {
    navigate('/kanban');
    toast({
      title: "Navegando para Kanban",
      description: "Redirecionando para o quadro Kanban",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-violet-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-violet-500 rounded-xl">
                  <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                Relatórios Gerenciais
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                📊 Visão estratégica completa da performance da equipe e operações
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button 
                variant="outline"
                onClick={handleViewTodosLeads}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
                aria-label="Ver todos os leads"
                title="Ver todos os leads"
              >
                <Users className="mr-2 h-4 w-4" />
                Todos os Leads
              </Button>
              <Button 
                variant="outline"
                onClick={handleViewEquipe}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-950/20"
                aria-label="Ver gestão da equipe"
                title="Ver gestão da equipe"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Equipe
              </Button>
              <Button 
                variant="outline"
                onClick={handleViewKanban}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                aria-label="Ver quadro Kanban"
                title="Ver quadro Kanban"
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Kanban
              </Button>
              <Button 
                onClick={exportarRelatorio}
                className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                aria-label="Exportar relatório gerencial"
                title="Exportar relatório gerencial"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-violet-500 rounded-lg">
                    <Filter className="h-4 w-4 text-white" />
                  </div>
                  Filtros Gerenciais
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  📊 Configure os parâmetros para análise estratégica detalhada
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período de Análise
                </label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">📅 Últimos 7 dias</SelectItem>
                    <SelectItem value="30">📅 Últimos 30 dias</SelectItem>
                    <SelectItem value="90">📅 Últimos 90 dias</SelectItem>
                    <SelectItem value="365">📅 Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Status dos Leads
                </label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">🎯 Todos os Status</SelectItem>
                    <SelectItem value="novo">🆕 Novo</SelectItem>
                    <SelectItem value="contatado">📞 Contatado</SelectItem>
                    <SelectItem value="interessado">⭐ Interessado</SelectItem>
                    <SelectItem value="visita_agendada">🏠 Visita Agendada</SelectItem>
                    <SelectItem value="proposta">📋 Proposta</SelectItem>
                    <SelectItem value="fechado">✅ Fechado</SelectItem>
                    <SelectItem value="perdido">❌ Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Tipo de Relatório
                </label>
                <Select defaultValue="completo">
                  <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completo">📊 Relatório Completo</SelectItem>
                    <SelectItem value="vendas">💰 Apenas Vendas</SelectItem>
                    <SelectItem value="leads">👥 Apenas Leads</SelectItem>
                    <SelectItem value="performance">🎯 Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/30 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">👥 Total de Leads</p>
                <p className="text-3xl font-bold text-violet-900 dark:text-violet-100 mt-1">{leadsFiltrados.length}</p>
                <p className="text-xs text-violet-600 dark:text-violet-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                  {performanceMeta}% da meta mensal
                </p>
                <div className="mt-2">
                  <Progress value={progressoMeta} className="h-2" />
                </div>
              </div>
              <div className="p-3 bg-violet-500 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">🎯 Taxa de Conversão</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{taxaConversao}%</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  {stats.fechado} fechados de {stats.total} leads
                </p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-xl">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">💰 Receita Total</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  R$ {(valorTotalVendas / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Vendas fechadas
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">🚀 Leads Ativos</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">{leadsAtivos}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Em processo de venda
                </p>
              </div>
              <div className="p-3 bg-amber-500 rounded-xl">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Gerenciais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200/50 dark:border-blue-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  Performance da Equipe
                </CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-400 mt-1">
                  🏢 Métricas de produtividade e resultados
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-800 dark:text-blue-200">Meta Mensal</span>
                    <span className="font-bold text-lg text-blue-900 dark:text-blue-100">{performanceMeta}%</span>
                  </div>
                  <Progress value={progressoMeta} className="h-2" />
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-50 dark:from-emerald-950/20 dark:to-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-200">Tempo Médio de Venda</span>
                    <span className="font-bold text-lg text-emerald-900 dark:text-emerald-100">{tempoMedioVenda} dias</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-800 dark:text-purple-200">Leads por Mês</span>
                    <span className="font-bold text-lg text-purple-900 dark:text-purple-100">{leadsPeriodo.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
                  <div className="p-1.5 bg-green-500 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  Status do WhatsApp
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-400 mt-1">
                  💬 Integração e comunicação automatizada
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-800 dark:text-green-200">Status</span>
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                      ✅ Conectado
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-800 dark:text-blue-200">Mensagens Enviadas</span>
                    <span className="font-bold text-lg text-blue-900 dark:text-blue-100">1,234</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-800 dark:text-purple-200">Taxa de Resposta</span>
                    <span className="font-bold text-lg text-purple-900 dark:text-purple-100">85%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-200/50 dark:border-amber-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  Tendências
                </CardTitle>
                <CardDescription className="text-amber-600 dark:text-amber-400 mt-1">
                  📈 Análise de crescimento e performance
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-800 dark:text-green-200">Crescimento</span>
                    <span className="font-bold text-lg text-green-600">+12%</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-800 dark:text-blue-200">Vendas vs Meta</span>
                    <span className="font-bold text-lg text-blue-600">108%</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-800 dark:text-amber-200">Satisfação</span>
                    <span className="font-bold text-lg text-amber-600">4.8/5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Detalhados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads por Status */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-b border-violet-200/50 dark:border-violet-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-violet-800 dark:text-violet-200 flex items-center gap-2">
                  <div className="p-1.5 bg-violet-500 rounded-lg">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  Distribuição por Status
                </CardTitle>
                <CardDescription className="text-violet-600 dark:text-violet-400 mt-1">
                  📊 Análise detalhada do pipeline de vendas
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(leadsPorStatus).map(([status, quantidade]) => {
                  const porcentagem = leads.length > 0 ? ((quantidade / leads.length) * 100).toFixed(1) : '0';
                  const cores = {
                    novo: "from-blue-400 to-blue-600",
                    contatado: "from-purple-400 to-purple-600",
                    interessado: "from-emerald-400 to-emerald-600",
                    visita_agendada: "from-orange-400 to-orange-600",
                    proposta: "from-amber-400 to-amber-600",
                    fechado: "from-green-400 to-green-600",
                    perdido: "from-red-400 to-red-600"
                  };
                  
                  return (
                    <div key={status} className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${cores[status as keyof typeof cores] || 'from-gray-400 to-gray-600'}`}></div>
                          <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{status.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg text-gray-900 dark:text-white">{quantidade}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{porcentagem}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${cores[status as keyof typeof cores] || 'from-gray-400 to-gray-600'}`}
                          style={{ width: `${porcentagem}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Mensal */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200/50 dark:border-emerald-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500 rounded-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Performance Mensal
                </CardTitle>
                <CardDescription className="text-emerald-600 dark:text-emerald-400 mt-1">
                  📈 Evolução dos leads nos últimos meses
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(leadsPorMes).slice(-6).map(([mes, quantidade], index) => {
                  const porcentagem = Math.max(...Object.values(leadsPorMes)) > 0 
                    ? ((quantidade / Math.max(...Object.values(leadsPorMes))) * 100).toFixed(1) 
                    : '0';
                  
                  return (
                    <div key={mes} className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{mes}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg text-gray-900 dark:text-white">{quantidade}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{porcentagem}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                          style={{ width: `${porcentagem}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Executivo e Insights Estratégicos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo Executivo */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-purple-200/50 dark:border-purple-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500 rounded-lg">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  Resumo Executivo
                </CardTitle>
                <CardDescription className="text-purple-600 dark:text-purple-400 mt-1">
                  🏆 Análise estratégica para tomada de decisões
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Crescimento</h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    +12% vs período anterior
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Meta</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {performanceMeta}% da meta mensal
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">Receita</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    R$ {(valorTotalVendas / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                  <Activity className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">Atividade</h3>
                  <p className="text-sm text-amber-600 dark:text-amber-300">
                    {leadsAtivos} leads ativos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights Estratégicos */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200/50 dark:border-emerald-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  Insights Estratégicos
                </CardTitle>
                <CardDescription className="text-emerald-600 dark:text-emerald-400 mt-1">
                  💡 Recomendações para otimização de resultados
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {progressoMeta.toFixed(0)}%
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Meta da Equipe</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {leadsPeriodo.length} de {metaMensal} leads
                      </p>
                    </div>
                  </div>
                  <Progress value={progressoMeta} className="h-2" />
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">Pipeline Total</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        R$ {(valorTotalPipeline / 1000000).toFixed(1)}M em potencial
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Performance Geral</h4>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        {leadsInteressados} interessados, {leadsVisitas} visitas, {leadsPropostas} propostas
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-6 w-6 text-amber-600" />
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200">Tempo Médio</h4>
                      <p className="text-sm text-amber-600 dark:text-amber-300">
                        {tempoMedioVenda} dias para fechamento
                      </p>
                    </div>
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
