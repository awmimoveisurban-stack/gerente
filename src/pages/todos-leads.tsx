import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TodosLeadsHeader } from "@/components/crm/todos-leads-header";
import { TodosLeadsMetrics } from "@/components/crm/todos-leads-metrics";
import { TodosLeadsFilters } from "@/components/crm/todos-leads-filters";
import { useLeads, type Lead } from "@/hooks/use-leads";
import { useLeadsDebug } from "@/hooks/use-leads-debug";
import { useTodosLeadsMetrics } from "@/hooks/use-todos-leads-metrics";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Phone, 
  Mail, 
  MessageSquare,
  Calendar,
  TrendingUp,
  Target,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Send,
  Building2,
  Award,
  Activity,
  DollarSign,
  AlertTriangle
} from "lucide-react";

export default function TodosLeads() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, loading, error } = useLeadsDebug();
  
  // Hook personalizado para métricas
  const { metrics, getStatusCount, getCorretorCount, getFilteredLeads } = useTodosLeadsMetrics(leads);
  
  // Estados dos filtros - TODOS os hooks devem estar no topo
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [corretorFilter, setCorretorFilter] = useState("todos");

  // Leads filtrados - useMemo para otimização
  const filteredLeads = useMemo(() => {
    return getFilteredLeads(searchTerm, statusFilter, corretorFilter);
  }, [getFilteredLeads, searchTerm, statusFilter, corretorFilter]);

  // Handlers para ações - useCallback para otimização
  const handleExportLeads = useCallback(() => {
    const dados = filteredLeads.map(lead => ({
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email,
      status: lead.status,
      corretor: lead.corretor || 'Sem corretor',
      valor_interesse: lead.valor_interesse,
      imovel_interesse: lead.imovel_interesse,
      data_entrada: lead.data_entrada,
      ultima_interacao: lead.ultima_interacao
    }));

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-leads-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportação Concluída",
      description: `${dados.length} leads exportados com sucesso`,
    });
  }, [filteredLeads, toast]);

  const handleViewReports = useCallback(() => {
    navigate('/gerente-relatorios');
    toast({
      title: "Navegando para Relatórios",
      description: "Redirecionando para a página de relatórios",
    });
  }, [navigate, toast]);

  const handleAddLead = useCallback(() => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: "A funcionalidade de adicionar leads será implementada em breve",
    });
  }, [toast]);

  const handleRefresh = useCallback(() => {
    toast({
      title: "Dados Atualizados",
      description: "As informações dos leads foram atualizadas",
    });
  }, [toast]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("todos");
    setCorretorFilter("todos");
    toast({
      title: "Filtros Resetados",
      description: "Todos os filtros foram removidos.",
    });
  }, [toast]);

  // Handlers para ações de leads
  const handleViewDetails = useCallback((lead: Lead) => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: `Detalhes do lead ${lead.nome} serão implementados em breve`,
    });
  }, [toast]);

  const handleEditLead = useCallback((lead: Lead) => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: `Edição do lead ${lead.nome} será implementada em breve`,
    });
  }, [toast]);

  const handleCallLead = useCallback((lead: Lead) => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: `Ligação para ${lead.nome} será implementada em breve`,
    });
  }, [toast]);

  const handleEmailLead = useCallback((lead: Lead) => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: `Email para ${lead.nome} será implementado em breve`,
    });
  }, [toast]);

  const handleScheduleVisit = useCallback((lead: Lead) => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: `Agendamento de visita para ${lead.nome} será implementado em breve`,
    });
  }, [toast]);

  // Lista de corretores únicos - useMemo para otimização
  const corretores = useMemo(() => {
    const corretoresSet = new Set<string>();
    leads.forEach(lead => {
      if (lead.corretor) {
        corretoresSet.add(lead.corretor);
      }
    });
    return Array.from(corretoresSet).sort();
  }, [leads]);

  // Função auxiliar para obter status badge
  const getStatusBadgeStatus = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'novo': return 'Novo';
      case 'contatado': return 'Em Atendimento';
      case 'interessado': return 'Em Atendimento';
      case 'visita_agendada': return 'Visita';
      case 'proposta': return 'Proposta';
      case 'fechado': return 'Fechado';
      case 'perdido': return 'Perdido';
      default: return 'Novo';
    }
  }, []);

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6 p-4 md:p-6">
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Erro ao Carregar Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Recarregar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Loading state - DEPOIS de todos os hooks
  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-4 md:p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <TodosLeadsHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onExportLeads={handleExportLeads}
          onViewReports={handleViewReports}
          onAddLead={handleAddLead}
          onRefresh={handleRefresh}
          totalLeads={metrics.totalLeads}
        />

        {/* Métricas Principais */}
        <TodosLeadsMetrics metrics={metrics} />

        {/* Filtros */}
        <TodosLeadsFilters
          statusFilter={statusFilter}
          corretorFilter={corretorFilter}
          onStatusChange={setStatusFilter}
          onCorretorChange={setCorretorFilter}
          onResetFilters={handleResetFilters}
          getStatusCount={getStatusCount}
          getCorretorCount={getCorretorCount}
          corretores={corretores}
        />

        {/* Tabela de Leads */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200/50 dark:border-emerald-800/50">
            <div>
              <CardTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Todos os Leads ({filteredLeads.length})
              </CardTitle>
              <CardDescription className="text-emerald-600 dark:text-emerald-400 mt-1">
                📋 Lista completa de todos os leads da equipe
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">👤 Cliente</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">👨‍💼 Corretor</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">📞 Contato</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">🏠 Interesse</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">💰 Valor</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">📊 Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">📅 Última Interação</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">⚡ Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                            {lead.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{lead.nome}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{lead.email || "Sem email"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {lead.corretor ? lead.corretor.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {lead.corretor || "Sem corretor"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{lead.telefone || "Sem telefone"}</span>
                          </div>
                          {lead.email && (
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">WhatsApp disponível</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[180px] truncate bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          {lead.imovel_interesse || "Não especificado"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {lead.valor_interesse ? `R$ ${lead.valor_interesse.toLocaleString('pt-BR')}` : "Não informado"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`${
                            lead.status === 'novo' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            lead.status === 'contatado' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            lead.status === 'interessado' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            lead.status === 'visita_agendada' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            lead.status === 'proposta' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            lead.status === 'fechado' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {getStatusBadgeStatus(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {lead.ultima_interacao 
                              ? new Date(lead.ultima_interacao).toLocaleDateString('pt-BR')
                              : new Date(lead.data_entrada).toLocaleDateString('pt-BR')
                            }
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {lead.ultima_interacao 
                              ? new Date(lead.ultima_interacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                              : "Primeiro contato"
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-blue-50 dark:hover:bg-blue-950/20" 
                            title="Ver detalhes" 
                            onClick={() => handleViewDetails(lead)}
                            aria-label={`Ver detalhes do lead ${lead.nome}`}
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-green-50 dark:hover:bg-green-950/20" 
                            title="Ligar" 
                            onClick={() => handleCallLead(lead)}
                            aria-label={`Ligar para ${lead.nome}`}
                          >
                            <Phone className="h-4 w-4 text-green-500" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label={`Mais opções para ${lead.nome}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                              <DropdownMenuItem onClick={() => handleEditLead(lead)} className="hover:bg-blue-50 dark:hover:bg-blue-950/20">
                                <Edit className="mr-2 h-4 w-4 text-blue-500" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEmailLead(lead)} className="hover:bg-green-50 dark:hover:bg-green-950/20">
                                <Mail className="mr-2 h-4 w-4 text-green-500" />
                                Enviar Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleScheduleVisit(lead)} className="hover:bg-purple-50 dark:hover:bg-purple-950/20">
                                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                                Agendar Visita
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}