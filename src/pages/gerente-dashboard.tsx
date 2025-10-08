import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { MetricCard } from "@/components/crm/metric-card";
import { StatusBadge, LeadStatus } from "@/components/crm/status-badge";
import { WhatsAppPanel } from "@/components/crm/whatsapp-panel";
import { InviteCorretorModal } from "@/components/crm/invite-corretor-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Download, 
  UserCheck,
  Building2,
  Calendar,
  BarChart3,
  Eye,
  ArrowRight,
  List,
  Plus,
  UserPlus
} from "lucide-react";

// Mock data - será substituído pelos dados do Supabase
const mockCorretores = [
  {
    id: 1,
    nome: "João Silva",
    totalLeads: 12,
    leadsFechados: 3,
    meta: 15,
    conversao: 25.0
  },
  {
    id: 2,
    nome: "Maria Santos",
    totalLeads: 18,
    leadsFechados: 5,
    meta: 20,
    conversao: 27.8
  },
  {
    id: 3,
    nome: "Pedro Costa",
    totalLeads: 8,
    leadsFechados: 2,
    meta: 12,
    conversao: 25.0
  },
  {
    id: 4,
    nome: "Ana Lima",
    totalLeads: 15,
    leadsFechados: 6,
    meta: 18,
    conversao: 40.0
  }
];

const mockLeadsRecentes = [
  {
    id: 1,
    nome: "Carlos Oliveira",
    corretor: "João Silva",
    status: "Novo" as LeadStatus,
    valor: "R$ 450.000",
    data: "2024-01-16"
  },
  {
    id: 2,
    nome: "Fernanda Lima",
    corretor: "Maria Santos",
    status: "Proposta" as LeadStatus,
    valor: "R$ 320.000",
    data: "2024-01-16"
  },
  {
    id: 3,
    nome: "Roberto Silva",
    corretor: "Ana Lima",
    status: "Fechado" as LeadStatus,
    valor: "R$ 280.000",
    data: "2024-01-15"
  }
];

export default function GerenteDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const totalLeads = mockCorretores.reduce((acc, corretor) => acc + corretor.totalLeads, 0);
  const totalFechados = mockCorretores.reduce((acc, corretor) => acc + corretor.leadsFechados, 0);
  const totalCorretores = mockCorretores.length;
  const conversaoGeral = totalLeads > 0 ? ((totalFechados / totalLeads) * 100).toFixed(1) : "0";

  const handleExportReport = async () => {
    setLoading(true);
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Relatório Exportado",
        description: "Relatório gerencial exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageTeam = () => {
    navigate('/gerente/equipe');
    toast({
      title: "Navegando para Equipe",
      description: "Redirecionando para gestão da equipe",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col p-4 md:p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-purple-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-xl">
                  <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                Dashboard Gerencial
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                📊 Visão completa do desempenho da equipe e vendas
            </p>
          </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button 
                variant="outline" 
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-950/20"
                onClick={handleExportReport}
                disabled={loading}
                aria-label="Exportar relatório gerencial"
                title="Exportar relatório gerencial"
              >
                <Download className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Exportando...' : 'Exportar Relatório'}
            </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleManageTeam}
                aria-label="Gerenciar equipe de corretores"
                title="Gerenciar equipe de corretores"
              >
              <UserCheck className="mr-2 h-4 w-4" />
              Gerenciar Equipe
            </Button>
            
            <Button
              onClick={() => setInviteModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              aria-label="Convidar novo corretor"
              title="Convidar novo corretor"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar Corretor
            </Button>
            </div>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">👥 Total de Leads</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{totalLeads}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  +15% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 p-6 rounded-2xl border border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">✅ Leads Fechados</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{totalFechados}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  +8.3% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">📈 Taxa de Conversão</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{conversaoGeral}%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Média da equipe
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">🏢 Corretores Ativos</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">{totalCorretores}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Na equipe
                </p>
              </div>
              <div className="p-3 bg-amber-500 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  Performance da Equipe
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  📊 Desempenho individual dos corretores este mês
            </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">👤 Corretor</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">📈 Leads Totais</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">✅ Fechados</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">🎯 Meta</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">📊 Progresso</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">💯 Conversão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCorretores.map((corretor) => {
                  const progressoMeta = (corretor.totalLeads / corretor.meta) * 100;
                  return (
                      <TableRow key={corretor.id} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                              {corretor.nome.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{corretor.nome}</span>
                          </div>
                        </TableCell>
                      <TableCell>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{corretor.totalLeads}</span>
                      </TableCell>
                      <TableCell>
                          <span className="text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-lg">
                            {corretor.leadsFechados}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600 dark:text-gray-400">{corretor.meta}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Progress value={progressoMeta} className="w-20 h-2" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[3rem]">
                              {progressoMeta.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                          <span className={`font-semibold px-3 py-1 rounded-lg ${
                            corretor.conversao >= 30 ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/20' : 
                            corretor.conversao >= 20 ? 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/20' : 
                            'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20'
                        }`}>
                          {corretor.conversao.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Recent High-Value Leads */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-b border-blue-200/50 dark:border-blue-800/50">
              <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <div className="p-1.5 bg-blue-500 rounded-lg">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                Leads Recentes
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                📋 Últimas movimentações da equipe
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockLeadsRecentes.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-md transition-all duration-200">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {lead.nome.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">{lead.nome}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {lead.corretor} • <span className="font-medium text-green-600 dark:text-green-400">{lead.valor}</span>
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <StatusBadge status={lead.status} />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        📅 {new Date(lead.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border-b border-emerald-200/50 dark:border-emerald-800/50">
              <CardTitle className="text-lg font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                Estatísticas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">📈 Leads Novos (Hoje)</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">8</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">📅 Visitas Agendadas</span>
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">12</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">📋 Propostas Pendentes</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">5</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>

              <div className="pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">💰 Faturamento Previsto</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">R$ 1.2M</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Configuration Panel */}
          <WhatsAppPanel />
        </div>
      </div>
      
      {/* Modal de Convite */}
      <InviteCorretorModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen} 
      />
    </AppLayout>
  );
}