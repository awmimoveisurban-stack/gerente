import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { AppLayout } from '@/components/layout/app-layout';
import { KanbanColumn } from '@/components/crm/kanban-column';
import { LeadCardEnhanced } from '@/components/crm/lead-card-enhanced';
import { AddLeadModal } from '@/components/crm/add-lead-modal';
import { LeadDetailsModal } from '@/components/crm/lead-details-modal';
import { CallLeadModal } from '@/components/crm/call-lead-modal';
import { EmailLeadModal } from '@/components/crm/email-lead-modal';
import { ScheduleVisitModal } from '@/components/crm/schedule-visit-modal';
import { ReassignLeadModal } from '@/components/crm/reassign-lead-modal';
import { KanbanMetrics } from '@/components/crm/kanban-metrics';
import { KanbanSummary } from '@/components/crm/kanban-summary';
import { KanbanHeader } from '@/components/crm/kanban-header';
import { KanbanLoading } from '@/components/crm/kanban-loading';
import { KanbanAlerts } from '@/components/crm/kanban-alerts';
import { KanbanBottlenecks } from '@/components/crm/kanban-bottlenecks';
import { KanbanCorretorRanking } from '@/components/crm/kanban-corretor-ranking';
import { KanbanExtendedMetrics } from '@/components/crm/kanban-extended-metrics';
import { useLeads, type Lead } from '@/hooks/use-leads';
import { useKanbanMetrics } from '@/hooks/use-kanban-metrics';
import { useUnifiedRoles } from '@/hooks/use-unified-roles';
import { useProfiles } from '@/hooks/use-profiles';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  UserCheck,
  Calendar,
  FileText,
  XCircle,
  TrendingUp,
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'novo',
    title: 'Novo',
    icon: Sparkles,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'contatado',
    title: 'Contatado',
    icon: UserCheck,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    id: 'interessado',
    title: 'Interessado',
    icon: UserCheck,
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
  {
    id: 'visita_agendada',
    title: 'Visita Agendada',
    icon: Calendar,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    id: 'proposta',
    title: 'Proposta',
    icon: FileText,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
  },
  {
    id: 'perdido',
    title: 'Perdido',
    icon: XCircle,
    color: 'bg-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
  },
];

export default function KanbanEnhanced() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, updateLead, loading, refetch } = useLeads();
  const { isGerente } = useUnifiedRoles();
  const { profiles } = useProfiles();

  // Hook personalizado para métricas do Kanban
  const { metrics, getFilteredLeads, getColumnStats } = useKanbanMetrics(
    leads || []
  );

  // Estados dos modais e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCorretorId, setSelectedCorretorId] = useState<string>('todos');
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [cardSize, setCardSize] = useState<'default' | 'compact' | 'mini'>(
    'compact'
  );

  // Sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // ✅ Handlers para modais
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

  const handleReassignLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowReassignModal(true);
  }, []);

  // Handlers para navegação
  const handleViewReports = useCallback(() => {
    navigate('/gerente-relatorios'); // ✅ FIX: Padronizado para hífen
  }, [navigate]);

  const handleViewAllLeads = useCallback(() => {
    navigate('/todos-leads');
  }, [navigate]);

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast({
      title: '✅ Dados Atualizados',
      description: 'As informações do Kanban foram atualizadas',
    });
  }, [refetch, toast]);

  // Handlers para drag and drop
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const lead = leads.find(l => l.id === active.id);
      setActiveLead(lead || null);
    },
    [leads]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveLead(null);

      if (!over || !over.id) {
        return;
      }

      const leadId = active.id as string;
      const newStatus = over.id as string;

      if (!newStatus || newStatus === 'undefined' || newStatus === 'null') {
        return;
      }

      const validStatuses = COLUMNS.map(col => col.id);
      if (!validStatuses.includes(newStatus)) {
        return;
      }

      const lead = leads.find(l => l.id === leadId);
      if (!lead) {
        return;
      }

      if (lead.status === newStatus) {
        return;
      }

      console.log(
        `✅ Atualizando lead ${lead.nome} de ${lead.status} para ${newStatus}`
      );

      updateLead(leadId, { status: newStatus });

      toast({
        title: '✅ Lead Atualizado',
        description: `${lead.nome} movido para ${COLUMNS.find(c => c.id === newStatus)?.title}`,
      });
    },
    [leads, updateLead, toast]
  );

  // ✅ Filtrar leads por busca e corretor
  const filteredLeads = useMemo(() => {
    let result = getFilteredLeads(searchTerm);

    // Filtrar por corretor se não for "todos"
    if (selectedCorretorId && selectedCorretorId !== 'todos') {
      result = result.filter(lead => lead.atribuido_a === selectedCorretorId);
    }

    return result;
  }, [getFilteredLeads, searchTerm, selectedCorretorId]);

  // Estatísticas das colunas
  const columnStats = useMemo(() => {
    return getColumnStats();
  }, [getColumnStats]);

  // Leads por coluna
  const leadsByColumn = useMemo(() => {
    return COLUMNS.reduce(
      (acc, column) => {
        acc[column.id] = filteredLeads.filter(
          lead => lead.status === column.id
        );
        return acc;
      },
      {} as Record<string, Lead[]>
    );
  }, [filteredLeads]);

  // Buscar nome do corretor
  const getCorretorName = useCallback(
    (corretorId?: string) => {
      if (!corretorId) return undefined;
      const profile = profiles.find(p => p.id === corretorId);
      return profile?.full_name || profile?.email;
    },
    [profiles]
  );

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <KanbanLoading />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='space-y-8'>
        {/* Header com Filtros */}
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
          selectedCorretorId={selectedCorretorId}
          onCorretorChange={setSelectedCorretorId}
          profiles={profiles}
        />

        {/* ✅ FASE 1.4: Alertas Críticos */}
        <KanbanAlerts leads={filteredLeads} />

        {/* Métricas Principais */}
        <KanbanMetrics metrics={metrics} />

        {/* ✅ FASE 2.4 & 3.2: Métricas Expandidas + Comparativo Mensal (apenas para gerente) */}
        {isGerente && profiles.length > 0 && (
          <KanbanExtendedMetrics leads={filteredLeads} profiles={profiles} />
        )}

        {/* ✅ FASE 3.1: Ranking de Corretores (apenas para gerente) */}
        {isGerente && profiles.length > 0 && (
          <KanbanCorretorRanking leads={leads} profiles={profiles} />
        )}

        {/* ✅ FASE 2.1: Painel de Gargalos (apenas para gerente) */}
        {isGerente && <KanbanBottlenecks leads={filteredLeads} />}

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
          {/* Em mobile, use rolagem horizontal com snap para colunas */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6 md:[overflow:visible] [overflow-x:auto] [scroll-snap-type:x_mandatory] [-ms-overflow-style:none] [scrollbar-width:none]'>
            {/* esconder scrollbar nos navegadores comuns */}
            {/* style via tailwind arbitrary: */}
            {/* cada coluna fará snap no início */}
            {COLUMNS.map(column => (
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
                // ✅ Renderizar LeadCardEnhanced dentro
                renderCard={lead => (
                  <LeadCardEnhanced
                    key={lead.id}
                    lead={lead}
                    onViewDetails={handleViewDetails}
                    onCall={handleCallLead}
                    onEmail={handleEmailLead}
                    onScheduleVisit={handleScheduleVisit}
                    onReassign={isGerente ? handleReassignLead : undefined}
                    corretorName={getCorretorName(lead.atribuido_a)}
                    cardSize={cardSize}
                  />
                )}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeLead ? (
              <div className='opacity-50'>
                <LeadCardEnhanced
                  lead={activeLead}
                  onViewDetails={() => {}}
                  onCall={() => {}}
                  onEmail={() => {}}
                  onScheduleVisit={() => {}}
                  corretorName={getCorretorName(activeLead.atribuido_a)}
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

        {/* ✅ FASE 2.3: Modal de Reatribuição */}
        {isGerente && (
          <ReassignLeadModal
            lead={selectedLead}
            isOpen={showReassignModal}
            onClose={() => setShowReassignModal(false)}
            profiles={profiles}
            onSuccess={handleRefresh}
          />
        )}
      </div>
    </AppLayout>
  );
}
