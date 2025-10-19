import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KanbanColumn } from '@/components/crm/kanban-column';
import { LeadCardEnhanced } from '@/components/crm/lead-card-enhanced';
import { AddLeadModal } from '@/components/crm/add-lead-modal';
import { LeadDetailsModal } from '@/components/crm/lead-details-modal';
import { CallLeadModal } from '@/components/crm/call-lead-modal';
import { EmailLeadModal } from '@/components/crm/email-lead-modal';
import { ScheduleVisitModal } from '@/components/crm/schedule-visit-modal';
import { ReassignLeadModal } from '@/components/crm/reassign-lead-modal';
// ✅ COMPONENTES KANBAN NECESSÁRIOS
import { KanbanAlerts } from '@/components/crm/kanban-alerts';
import { KanbanBottlenecks } from '@/components/crm/kanban-bottlenecks';
import { KanbanCorretorRanking } from '@/components/crm/kanban-corretor-ranking';
import { KanbanExtendedMetrics } from '@/components/crm/kanban-extended-metrics';
import { KanbanSummary } from '@/components/crm/kanban-summary';
import { useLeads, type Lead } from '@/hooks/use-leads';
import { useKanbanMetrics } from '@/hooks/use-kanban-metrics';
import { useUnifiedRoles } from '@/hooks/use-unified-roles';
import { useProfiles } from '@/hooks/use-profiles';
import { useToast } from '@/hooks/use-toast';
// ✅ IMPORTAÇÕES PADRONIZADAS
import {
  StandardPageLayout,
  StandardHeader,
  StandardMetricCard,
  StandardGrid,
  useStandardLayout,
  LAYOUT_CONFIG,
  STANDARD_ANIMATIONS,
} from '@/components/layout/standard-layout';
import {
  Sparkles,
  UserCheck,
  Calendar,
  FileText,
  XCircle,
  TrendingUp,
  LayoutGrid,
  Plus,
  RefreshCw,
  Users,
  Activity,
  Target,
  Trophy,
  Filter,
  Search,
  Settings,
} from 'lucide-react';

// ✅ COLUNAS PADRONIZADAS COM CORES CONSISTENTES
const COLUMNS = [
  {
    id: 'novo',
    title: 'Novo',
    icon: Sparkles,
    color: 'primary',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'contatado',
    title: 'Contatado',
    icon: UserCheck,
    color: 'warning',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    id: 'interessado',
    title: 'Interessado',
    icon: UserCheck,
    color: 'info',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
  {
    id: 'visita_agendada',
    title: 'Visita Agendada',
    icon: Calendar,
    color: 'success',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    id: 'proposta',
    title: 'Proposta',
    icon: FileText,
    color: 'purple',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
  },
  {
    id: 'perdido',
    title: 'Perdido',
    icon: XCircle,
    color: 'danger',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
  },
];

const KanbanEnhanced = React.memo(function KanbanEnhanced() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, updateLead, loading, refetch } = useLeads();
  const { isGerente } = useUnifiedRoles();
  const { profiles } = useProfiles();

  // Hook personalizado para métricas do Kanban
  const { metrics, getFilteredLeads, getColumnStats } = useKanbanMetrics(
    leads || []
  );

  // ✅ ESTADOS PADRONIZADOS
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

  // ✅ HANDLER DE REFRESH PADRONIZADO
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: '✅ Kanban Atualizado',
        description: 'Dados atualizados com sucesso!',
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
  // ✅ MEMOIZAÇÃO: Calcular leads por coluna apenas quando necessário
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

  // ✅ MEMOIZAÇÃO: Buscar nome do corretor apenas quando necessário
  const getCorretorName = useCallback(
    (corretorId?: string) => {
      if (!corretorId) return undefined;
      const profile = profiles.find(p => p.id === corretorId);
      return profile?.full_name || profile?.email;
    },
    [profiles]
  );

  // ✅ HEADER PADRONIZADO
  const headerActions = (
    <>
      <Button
        onClick={handleAddLead}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Lead
      </Button>
      <Button
        onClick={handleRefresh}
        variant="outline"
        disabled={isRefreshing}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
      >
        {isRefreshing ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Atualizar
      </Button>
    </>
  );

  // ✅ LOADING STATE PADRONIZADO
  if (loading) {
    return (
      <StandardPageLayout
        header={
          <StandardHeader
            title="Quadro Kanban"
            description="Gerencie seus leads com visualização em colunas"
            icon={<LayoutGrid className="h-6 w-6 text-white" />}
            actions={headerActions}
            gradient="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
          />
        }
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      header={
        <StandardHeader
          title="Quadro Kanban"
          description="Gerencie seus leads com visualização em colunas"
          icon={<LayoutGrid className="h-6 w-6 text-white" />}
          actions={headerActions}
          gradient="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
        />
      }
    >
      <div className='space-y-8'>

        {/* ✅ FASE 1.4: Alertas Críticos */}
        <KanbanAlerts leads={filteredLeads} />

        {/* ✅ MÉTRICAS PADRONIZADAS */}
        {/* ✅ MÉTRICAS PRINCIPAIS - SEM ANIMAÇÕES */}
        <div className="mb-8">
          <StandardGrid columns="4">
            <StandardMetricCard
              title="Total de Leads"
              value={metrics?.totalLeads || 0}
              icon={Users}
              color="primary"
            />
            <StandardMetricCard
              title="Em Andamento"
              value={metrics?.emAndamento || 0}
              icon={Activity}
              color="warning"
            />
            <StandardMetricCard
              title="Taxa de Conversão"
              value={`${metrics?.taxaConversao || 0}%`}
              icon={Target}
              color="success"
            />
            <StandardMetricCard
              title="Leads Fechados"
              value={metrics?.leadsFechados || 0}
              icon={Trophy}
              color="info"
            />
          </StandardGrid>
        </div>

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

        {/* ✅ QUADRO KANBAN COM ANIMAÇÕES */}
        {/* ✅ PIPELINE PRINCIPAL - SEM ANIMAÇÕES */}
        <div className="mb-8">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* ✅ GRID RESPONSIVO OTIMIZADO PARA MOBILE/TABLET */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide'>
              {COLUMNS.map((column, index) => (
                <div key={column.id} className="min-w-[280px] md:min-w-0">
                  <KanbanColumn
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
                </div>
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
    </StandardPageLayout>
  );
});

export default KanbanEnhanced;
