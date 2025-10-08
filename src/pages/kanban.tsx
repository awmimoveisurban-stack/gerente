import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AppLayout } from "@/components/layout/app-layout";
import { KanbanColumn } from "@/components/crm/kanban-column";
import { LeadCard } from "@/components/crm/lead-card";
import { AddLeadModal } from "@/components/crm/add-lead-modal";
import { LeadDetailsModal } from "@/components/crm/lead-details-modal";
import { CallLeadModal } from "@/components/crm/call-lead-modal";
import { EmailLeadModal } from "@/components/crm/email-lead-modal";
import { ScheduleVisitModal } from "@/components/crm/schedule-visit-modal";
import { KanbanMetrics } from "@/components/crm/kanban-metrics";
import { KanbanSummary } from "@/components/crm/kanban-summary";
import { KanbanHeader } from "@/components/crm/kanban-header";
import { KanbanLoading } from "@/components/crm/kanban-loading";
import { useLeadsStable as useLeads, type Lead } from "@/hooks/use-leads-stable";
import { useKanbanMetrics } from "@/hooks/use-kanban-metrics";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  UserCheck, 
  Calendar, 
  FileText, 
  XCircle,
  TrendingUp
} from "lucide-react";

const COLUMNS = [
  { id: 'novo', title: 'Novo', icon: Sparkles, color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/20' },
  { id: 'contatado', title: 'Contatado', icon: UserCheck, color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950/20' },
  { id: 'interessado', title: 'Interessado', icon: UserCheck, color: 'bg-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950/20' },
  { id: 'visita_agendada', title: 'Visita Agendada', icon: Calendar, color: 'bg-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950/20' },
  { id: 'proposta', title: 'Proposta', icon: FileText, color: 'bg-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950/20' },
  { id: 'perdido', title: 'Perdido', icon: XCircle, color: 'bg-red-500', bgColor: 'bg-red-50 dark:bg-red-950/20' },
];

export default function Kanban() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, updateLead, loading } = useLeads();
  
  // Hook personalizado para métricas do Kanban
  const { metrics, getFilteredLeads, getColumnStats } = useKanbanMetrics(leads);
  
  // Estados dos modais - TODOS os hooks devem estar no topo
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [cardSize, setCardSize] = useState<'default' | 'compact' | 'mini'>('compact');

  // Sensors para drag and drop - useMemo para otimização
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handlers para modais - useCallback para otimização
  const handleAddLead = useCallback(() => {
    setShowAddLeadModal(true);
  }, []);

  const handleViewDetails = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
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

  // Handlers para navegação - useCallback para otimização
  const handleViewReports = useCallback(() => {
    navigate('/relatorios');
    toast({
      title: "Navegando para Relatórios",
      description: "Redirecionando para a página de relatórios",
    });
  }, [navigate, toast]);

  const handleViewAllLeads = useCallback(() => {
    navigate('/leads');
    toast({
      title: "Navegando para Leads",
      description: "Redirecionando para a página de leads",
    });
  }, [navigate, toast]);

  const handleRefresh = useCallback(() => {
    toast({
      title: "Dados Atualizados",
      description: "As informações do Kanban foram atualizadas",
    });
  }, [toast]);

  // Handlers para drag and drop - useCallback para otimização
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    setActiveLead(lead || null);
  }, [leads]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const leadId = active.id as string;
    const newStatus = over.id as string;
    
    // Encontrar o lead
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    // Verificar se o status mudou
    if (lead.status === newStatus) return;
    
    // Atualizar o lead
    updateLead(leadId, { status: newStatus });
    
    toast({
      title: "Lead Atualizado",
      description: `${lead.nome} movido para ${COLUMNS.find(c => c.id === newStatus)?.title}`,
    });
  }, [leads, updateLead, toast]);

  // Leads filtrados - useMemo para otimização
  const filteredLeads = useMemo(() => {
    return getFilteredLeads(searchTerm);
  }, [getFilteredLeads, searchTerm]);

  // Estatísticas das colunas - useMemo para otimização
  const columnStats = useMemo(() => {
    return getColumnStats();
  }, [getColumnStats]);

  // Leads por coluna - useMemo para otimização
  const leadsByColumn = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = filteredLeads.filter(lead => lead.status === column.id);
      return acc;
    }, {} as Record<string, Lead[]>);
  }, [filteredLeads]);

  // Loading state - DEPOIS de todos os hooks
  if (loading) {
    return (
      <AppLayout>
        <KanbanLoading />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <KanbanHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddLead={handleAddLead}
          onViewReports={handleViewReports}
          onViewAllLeads={handleViewAllLeads}
          onRefresh={handleRefresh}
          totalLeads={metrics.totalLeads}
          cardSize={cardSize}
          onCardSizeChange={setCardSize}
        />

        {/* Métricas Principais */}
        <KanbanMetrics metrics={metrics} />

        {/* Resumo das Colunas */}
        <KanbanSummary 
          columnStats={columnStats}
          totalLeads={metrics.totalLeads}
        />

        {/* Quadro Kanban */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                icon={column.icon}
                color={column.color}
                bgColor={column.bgColor}
                leads={leadsByColumn[column.id] || []}
                onViewDetails={handleViewDetails}
                onCall={handleCallLead}
                onEmail={handleEmailLead}
                onScheduleVisit={handleScheduleVisit}
                cardSize={cardSize}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeLead ? (
              <div className="opacity-50">
                <LeadCard
                  lead={activeLead}
                  onViewDetails={() => {}}
                  onCall={() => {}}
                  onEmail={() => {}}
                  onScheduleVisit={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

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
      </div>
    </AppLayout>
  );
}