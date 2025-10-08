import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { useSearch } from "@/contexts/search-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/crm/status-badge";
import { 
  Plus, 
  LayoutGrid,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Clock,
  MessageSquare,
  BarChart3,
  Star,
  Zap,
  Activity,
  Award,
  Download,
  FileText,
  Send,
  UserPlus,
  Eye, 
  Phone,
  Mail,
  Calendar,
  Edit,
  AlertTriangle
} from "lucide-react";
import { LeadDetailsModal } from "@/components/crm/lead-details-modal";
import { EditLeadModal } from "@/components/crm/edit-lead-modal";
import { CallLeadModal } from "@/components/crm/call-lead-modal";
import { EmailLeadModal } from "@/components/crm/email-lead-modal";
import { ScheduleVisitModal } from "@/components/crm/schedule-visit-modal";
import { AddLeadModal } from "@/components/crm/add-lead-modal";
import { LeadsFilters } from "@/components/crm/leads-filters";
import { LeadsTable } from "@/components/crm/leads-table";
import { EmptyLeadsState } from "@/components/crm/empty-leads-state";
import { LeadsLoadingSkeleton } from "@/components/crm/leads-loading-skeleton";
import { useLeads, type Lead } from "@/hooks/use-leads";
import { useLeadsDebug } from "@/hooks/use-leads-debug";
import { useLeadsFilters } from "@/hooks/use-leads-filters";
import { useToast } from "@/hooks/use-toast";

export default function Leads() {
  const { toast } = useToast();
  const { leads, loading, error } = useLeadsDebug();
  const { searchTerm: globalSearchTerm, setSearchTerm: setGlobalSearchTerm } = useSearch();
  const location = useLocation();
  
  // Estados dos modais
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  
  // Handle global search from header
  useEffect(() => {
    if (location.state?.searchTerm) {
      setGlobalSearchTerm(location.state.searchTerm);
    }
  }, [location.state, setGlobalSearchTerm]);

  // Handlers para modais
  const handleAddLead = useCallback(() => {
    setShowAddLeadModal(true);
  }, []);

  const handleViewDetails = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  }, []);

  const handleEditLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  }, []);

  const handleCallLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowCallModal(true);
  }, []);

  const handleEmailLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowEmailModal(true);
  }, []);

  const handleScheduleVisit = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowVisitModal(true);
  }, []);

  // Hook personalizado para filtros
  const {
    filters,
    setSearchTerm,
    setStatusFilter,
    resetFilters,
    filteredLeads,
    handleExportLeads,
    handleViewKanban,
    handleAddLead: handleAddLeadFromHook,
    getStatusCount
  } = useLeadsFilters(leads, handleAddLead);

  // Sync global search with local filters
  useEffect(() => {
    if (globalSearchTerm !== filters.searchTerm) {
      setSearchTerm(globalSearchTerm);
    }
  }, [globalSearchTerm, filters.searchTerm, setSearchTerm]);
  
  // Métricas calculadas com memoização
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const leadsAtivos = leads.filter(lead => !["fechado", "perdido"].includes(lead.status.toLowerCase())).length;
    const leadsFechados = leads.filter(lead => lead.status.toLowerCase() === "fechado").length;
    const valorTotalLeads = leads.filter(lead => !["fechado", "perdido"].includes(lead.status.toLowerCase())).reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0);
    
    // Meta mensal para corretor
    const metaMensal = 20;
    const progressoMeta = totalLeads > 0 ? Math.min((totalLeads / metaMensal) * 100, 100) : 0;
    
    return {
      totalLeads,
      leadsAtivos,
      leadsFechados,
      valorTotalLeads,
      metaMensal,
      progressoMeta
    };
  }, [leads]);

  // Todos os hooks devem estar antes de qualquer return condicional
  const handleCloseModals = useCallback(() => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowCallModal(false);
    setShowEmailModal(false);
    setShowVisitModal(false);
    setShowAddLeadModal(false);
    setSelectedLead(null);
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
        <LeadsLoadingSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-blue-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                Meus Leads
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                📋 Gerencie todos os seus leads e oportunidades de venda
            </p>
          </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button 
                variant="outline"
                onClick={() => handleExportLeads(filteredLeads)}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
                aria-label="Exportar leads"
                title="Exportar leads"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            <Button 
              variant="outline"
                onClick={handleViewKanban}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-950/20"
                aria-label="Ver quadro Kanban"
                title="Ver quadro Kanban"
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
                Kanban
            </Button>
            <Button 
                onClick={handleAddLead}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                aria-label="Adicionar novo lead"
                title="Adicionar novo lead"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
            </div>
          </div>
        </div>

        {/* Métricas do Corretor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">👥 Total de Leads</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{metrics.totalLeads}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Meta: {metrics.metaMensal} este mês
                </p>
                <div className="mt-2">
                  <Progress value={metrics.progressoMeta} className="h-2" />
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
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">🚀 Leads Ativos</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{metrics.leadsAtivos}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Em processo de venda
                </p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-xl">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">✅ Leads Fechados</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{metrics.leadsFechados}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Vendas concluídas
                </p>
                </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
                        <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">💰 Valor Pipeline</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                  R$ {(metrics.valorTotalLeads / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  {metrics.leadsAtivos} leads ativos
                </p>
              </div>
              <div className="p-3 bg-amber-500 rounded-xl">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
                        </div>
                        </div>
                        </div>

        {/* Filtros */}
        <LeadsFilters
          searchTerm={filters.searchTerm}
          statusFilter={filters.statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onResetFilters={resetFilters}
          getStatusCount={getStatusCount}
        />

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {["novo", "contatado", "interessado", "visita_agendada", "proposta", "fechado"].map((status) => {
            const count = getStatusCount(status);
            const colors = {
              novo: "from-blue-50 to-blue-100 border-blue-200/50",
              contatado: "from-purple-50 to-purple-100 border-purple-200/50",
              interessado: "from-emerald-50 to-emerald-100 border-emerald-200/50",
              visita_agendada: "from-orange-50 to-orange-100 border-orange-200/50",
              proposta: "from-amber-50 to-amber-100 border-amber-200/50",
              fechado: "from-green-50 to-green-100 border-green-200/50"
            };
            
            const getStatusBadgeStatus = (status: string) => {
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
            };
            
            return (
              <Card key={status} className={`bg-gradient-to-br ${colors[status as keyof typeof colors]} dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm border dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer`}>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{count}</div>
                  <StatusBadge status={getStatusBadgeStatus(status)} className="text-xs" />
            </CardContent>
          </Card>
            );
          })}
        </div>

        {/* Conteúdo Principal */}
        {filteredLeads.length === 0 ? (
          <EmptyLeadsState
            hasFilters={filters.searchTerm !== "" || filters.statusFilter !== "todos"}
            onAddLead={handleAddLead}
            onResetFilters={resetFilters}
          />
        ) : (
          <LeadsTable
            leads={filteredLeads}
            onViewDetails={handleViewDetails}
            onEditLead={handleEditLead}
            onCallLead={handleCallLead}
            onEmailLead={handleEmailLead}
            onScheduleVisit={handleScheduleVisit}
          />
        )}
      </div>

      {/* Modais */}
      <AddLeadModal 
        open={showAddLeadModal}
        onOpenChange={setShowAddLeadModal}
      />
      
      <LeadDetailsModal 
        lead={selectedLead}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
      
      <EditLeadModal 
        lead={selectedLead}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={() => {}} // The useLeads hook handles updates automatically via realtime
      />
      
      <CallLeadModal 
        lead={selectedLead}
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
      />
      
      <EmailLeadModal 
        lead={selectedLead}
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
      
      <ScheduleVisitModal 
        lead={selectedLead}
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
      />
    </AppLayout>
  );
}