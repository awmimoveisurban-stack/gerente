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
  Activity,
  Award,
  Star,
  Zap,
  Clock,
  MessageSquare,
  ArrowRight,
  FileText,
  Send,
  UserPlus,
  Eye,
  Phone,
  Mail,
  Building2
} from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";

export default function Relatorios() {
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

  // Métricas específicas para corretor
  const totalLeads = leads.length;
  const leadsAtivos = leads.filter(lead => !["fechado", "perdido"].includes(lead.status.toLowerCase())).length;
  const leadsFechados = leads.filter(lead => lead.status.toLowerCase() === "fechado").length;
  const leadsNovos = leads.filter(lead => lead.status.toLowerCase() === "novo").length;
  const leadsInteressados = leads.filter(lead => lead.status.toLowerCase() === "interessado").length;
  const leadsVisitas = leads.filter(lead => lead.status.toLowerCase() === "visita_agendada").length;
  const leadsPropostas = leads.filter(lead => lead.status.toLowerCase() === "proposta").length;
  
  // Calcular meta mensal (exemplo: 20 leads por mês)
  const metaMensal = 20;
  const progressoMeta = totalLeads > 0 ? Math.min((totalLeads / metaMensal) * 100, 100) : 0;
  
  // Valor total dos leads ativos
  const valorTotalPipeline = leads.filter(lead => !["fechado", "perdido"].includes(lead.status.toLowerCase())).reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0);
  
  // Ticket médio
  const ticketMedio = stats.fechado > 0 ? valorTotalVendas / stats.fechado : 0;

  const exportarRelatorio = () => {
    try {
      // Gerar CSV formatado
      let csv = '📊 RELATÓRIO DO CORRETOR - SUPABASE DEALS\n\n';
      csv += `Data de Geração: ${new Date().toLocaleString('pt-BR')}\n`;
      csv += `Período: Últimos ${periodo} dias\n\n`;
      
      // Métricas Principais
      csv += '=== MINHA PERFORMANCE ===\n';
      csv += `Total de Leads,${totalLeads}\n`;
      csv += `Leads Fechados,${leadsFechados}\n`;
      csv += `Leads Ativos,${leadsAtivos}\n`;
      csv += `Taxa de Conversão,${taxaConversao}%\n`;
      csv += `Valor Total Vendido,R$ ${valorTotalVendas.toLocaleString('pt-BR')}\n`;
      csv += `Ticket Médio,R$ ${ticketMedio.toLocaleString('pt-BR')}\n`;
      csv += `Valor Pipeline,R$ ${valorTotalPipeline.toLocaleString('pt-BR')}\n\n`;
      
      // Meta Mensal
      csv += '=== PERFORMANCE VS META ===\n';
      csv += `Meta Mensal,${metaMensal} leads\n`;
      csv += `Realizado (Período),${leadsPeriodo.length} leads\n`;
      csv += `Progresso Meta,${progressoMeta.toFixed(1)}%\n\n`;
      
      // Leads por Status
      csv += '=== MEUS LEADS POR STATUS ===\n';
      Object.entries(leadsPorStatus).forEach(([status, count]) => {
        csv += `${status},${count}\n`;
      });
      csv += '\n';
      
      // Evolução Mensal
      csv += '=== EVOLUÇÃO MENSAL ===\n';
      Object.entries(leadsPorMes).forEach(([mes, count]) => {
        csv += `${mes},${count}\n`;
      });
      csv += '\n';
      
      // Lista de Leads
      csv += '=== MEUS LEADS DO PERÍODO ===\n';
      csv += 'Nome,Status,Valor,Data\n';
      leadsFiltrados.forEach(lead => {
        csv += `${lead.nome},${lead.status},R$ ${(lead.valor_interesse || 0).toLocaleString('pt-BR')},${new Date(lead.created_at).toLocaleDateString('pt-BR')}\n`;
      });
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-corretor-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório Exportado",
        description: `Relatório CSV dos últimos ${periodo} dias com ${leadsFiltrados.length} leads`,
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    }
  };

  const handleViewLeads = () => {
    navigate('/leads');
    toast({
      title: "Navegando para Leads",
      description: "Redirecionando para a página de leads",
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-blue-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                Meus Relatórios
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                📊 Análise detalhada da sua performance e métricas pessoais
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button 
                variant="outline"
                onClick={handleViewLeads}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
                aria-label="Ver leads"
                title="Ver leads"
              >
                <Users className="mr-2 h-4 w-4" />
                Meus Leads
              </Button>
              <Button 
                variant="outline"
                onClick={handleViewKanban}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-950/20"
                aria-label="Ver quadro Kanban"
                title="Ver quadro Kanban"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Kanban
              </Button>
              <Button 
                onClick={exportarRelatorio}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                aria-label="Exportar relatório"
                title="Exportar relatório"
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
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <Filter className="h-4 w-4 text-white" />
                  </div>
                  Filtros de Relatório
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  📅 Personalize o período e status para análise detalhada
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </CardContent>
        </Card>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">👥 Total de Leads</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{leadsFiltrados.length}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Últimos {periodo} dias
                </p>
                <div className="mt-2">
                  <Progress value={progressoMeta} className="h-2" />
                </div>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
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

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">💰 Valor Total</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  R$ {(valorTotalVendas / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Vendas fechadas
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">📈 Ticket Médio</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                  R$ {ticketMedio.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Por venda fechada
                </p>
              </div>
              <div className="p-3 bg-amber-500 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos e Análises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads por Status */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200/50 dark:border-blue-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  Distribuição por Status
                </CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-400 mt-1">
                  📊 Análise detalhada do pipeline de leads
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(leadsPorStatus).map(([status, quantidade]) => {
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
                    <div key={status} className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${cores[status as keyof typeof cores] || 'from-gray-400 to-gray-600'}`}></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{quantidade}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {totalLeads > 0 ? ((quantidade / totalLeads) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Leads por Mês */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200/50 dark:border-emerald-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500 rounded-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Evolução Temporal
                </CardTitle>
                <CardDescription className="text-emerald-600 dark:text-emerald-400 mt-1">
                  📈 Crescimento de leads nos últimos meses
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(leadsPorMes).slice(-6).map(([mes, quantidade], index) => (
                  <div key={mes} className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{mes}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{quantidade}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">leads</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Executivo e Insights */}
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
                  🏆 Análise geral da sua performance
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Pontos Fortes</h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Taxa de conversão de {taxaConversao}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Pipeline Ativo</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {leadsAtivos} leads em andamento
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                  <Calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">Período</h3>
                  <p className="text-sm text-amber-600 dark:text-amber-300">
                    Últimos {periodo} dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights de Performance */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200/50 dark:border-emerald-800/50">
              <div>
                <CardTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  Insights de Performance
                </CardTitle>
                <CardDescription className="text-emerald-600 dark:text-emerald-400 mt-1">
                  💡 Recomendações para melhorar resultados
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
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Meta Mensal</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {totalLeads} de {metaMensal} leads
                      </p>
                    </div>
                  </div>
                  <Progress value={progressoMeta} className="h-2" />
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200">Pipeline de Valor</h4>
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
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Atividade</h4>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        {leadsInteressados} interessados, {leadsVisitas} visitas agendadas
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
