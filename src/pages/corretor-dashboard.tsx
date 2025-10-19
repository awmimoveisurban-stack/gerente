import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/layout/app-layout';
import { MetricCard } from '@/components/crm/metric-card';
import { StatusBadge, type LeadStatus } from '@/components/crm/status-badge';
import { AddLeadModal } from '@/components/crm/add-lead-modal';
import { ScheduleVisitModal } from '@/components/crm/schedule-visit-modal';
import { FollowUpModal } from '@/components/crm/follow-up-modal';
import { TaskModal } from '@/components/crm/task-modal';
import { DashboardMetrics } from '@/components/crm/dashboard-metrics';
import { WeeklyPerformance } from '@/components/crm/weekly-performance';
import { QuickActions } from '@/components/crm/quick-actions';
import { useLeads, type Lead } from '@/hooks/use-leads';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Plus,
  Calendar,
  Phone,
  Eye,
  CheckSquare,
  LayoutGrid,
  ArrowRight,
  List,
  BarChart3,
  Search,
  MessageSquare,
  Clock,
  Award,
  Star,
  Zap,
  Heart,
  Activity,
  UserPlus,
  Building2,
  FileText,
  Send,
} from 'lucide-react';

export default function CorretorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Hook para buscar leads do Supabase
  const { leads, loading } = useLeads();

  // Hook personalizado para métricas da dashboard
  const { metrics, getWeeklyMetrics, getPerformanceMetrics } =
    useDashboardMetrics(leads);

  // Estados dos modais - TODOS os hooks devem estar no topo
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Handlers para modais - useCallback para otimização
  const handleAddLead = useCallback(() => {
    setShowAddLeadModal(true);
  }, []);

  const handleScheduleVisit = useCallback(() => {
    setShowScheduleModal(true);
  }, []);

  const handleFollowUp = useCallback(() => {
    setShowFollowUpModal(true);
  }, []);

  const handleCreateTask = useCallback(() => {
    setShowTaskModal(true);
  }, []);

  // Handlers para ações - useCallback para otimização
  const handleViewLeads = useCallback(() => {
    navigate('/leads');
    toast({
      title: 'Navegando para Leads',
      description: 'Redirecionando para a página de leads',
    });
  }, [navigate, toast]);

  const handleViewKanban = useCallback(() => {
    navigate('/kanban');
    toast({
      title: 'Navegando para Kanban',
      description: 'Redirecionando para o quadro Kanban',
    });
  }, [navigate, toast]);

  const handleViewReports = useCallback(() => {
    navigate('/relatorios');
    toast({
      title: 'Navegando para Relatórios',
      description: 'Redirecionando para a página de relatórios',
    });
  }, [navigate, toast]);

  const handleViewAnalytics = useCallback(() => {
    navigate('/relatorios');
    toast({
      title: 'Navegando para Analytics',
      description: 'Redirecionando para a página de analytics',
    });
  }, [navigate, toast]);

  const handleMakeCall = useCallback(() => {
    toast({
      title: 'Funcionalidade em Desenvolvimento',
      description: 'A funcionalidade de chamadas será implementada em breve',
    });
  }, [toast]);

  const handleSendMessage = useCallback(() => {
    navigate('/green-api-whatsapp');
    toast({
      title: 'Navegando para WhatsApp',
      description: 'Redirecionando para o painel do WhatsApp',
    });
  }, [navigate, toast]);

  const handleSendProposal = useCallback(() => {
    toast({
      title: 'Funcionalidade em Desenvolvimento',
      description: 'A funcionalidade de propostas será implementada em breve',
    });
  }, [toast]);

  // Handlers para ações de leads - useCallback para otimização
  const handleViewDetails = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    // Aqui você pode abrir um modal de detalhes se necessário
  }, []);

  const handleEditLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    // Aqui você pode abrir um modal de edição se necessário
  }, []);

  const handleCallLead = useCallback(
    (lead: Lead) => {
      setSelectedLead(lead);
      // Aqui você pode implementar a funcionalidade de chamada
      toast({
        title: 'Funcionalidade em Desenvolvimento',
        description: `Ligação para ${lead.nome} será implementada em breve`,
      });
    },
    [toast]
  );

  const handleEmailLead = useCallback(
    (lead: Lead) => {
      setSelectedLead(lead);
      // Aqui você pode implementar a funcionalidade de email
      toast({
        title: 'Funcionalidade em Desenvolvimento',
        description: `Email para ${lead.nome} será implementado em breve`,
      });
    },
    [toast]
  );

  const handleScheduleVisitLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowScheduleModal(true);
  }, []);

  // Leads recentes (últimos 5) - useMemo para otimização
  const leadsRecentes = useMemo(() => {
    return leads
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [leads]);

  // Métricas semanais e de performance - useMemo para otimização
  const weeklyMetrics = useMemo(() => getWeeklyMetrics(), [getWeeklyMetrics]);
  const performanceMetrics = useMemo(
    () => getPerformanceMetrics(),
    [getPerformanceMetrics]
  );

  // Função auxiliar para obter status badge - useCallback para otimização
  const getStatusBadgeStatus = useCallback((status: string): LeadStatus => {
    switch (status.toLowerCase()) {
      case 'novo':
        return 'Novo';
      case 'contatado':
        return 'Em Atendimento';
      case 'interessado':
        return 'Em Atendimento';
      case 'visita_agendada':
        return 'Visita';
      case 'proposta':
        return 'Proposta';
      case 'fechado':
        return 'Fechado';
      case 'perdido':
        return 'Perdido';
      default:
        return 'Novo';
    }
  }, []);

  // Loading state - DEPOIS de todos os hooks
  if (loading) {
    return (
      <AppLayout>
        <div className='space-y-6'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4'></div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='h-32 bg-gray-200 dark:bg-gray-700 rounded-lg'
                ></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='space-y-6 h-full flex flex-col p-4 md:p-6'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-blue-200/50 dark:border-gray-700/50'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3'>
                <div className='p-2 bg-blue-500 rounded-xl'>
                  <BarChart3 className='h-5 w-5 md:h-6 md:w-6 text-white' />
                </div>
                Dashboard de Performance
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                🚀 Acompanhe suas métricas pessoais e gerencie seus leads de
                forma eficiente
              </p>
            </div>
            <div className='flex gap-3 w-full md:w-auto'>
              <Button
                variant='outline'
                onClick={handleViewLeads}
                className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20'
                aria-label='Ver todos os leads'
                title='Ver todos os leads'
              >
                <Users className='mr-2 h-4 w-4' />
                Todos os Leads
              </Button>
              <Button
                variant='outline'
                onClick={handleViewKanban}
                className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-950/20'
                aria-label='Ver quadro Kanban'
                title='Ver quadro Kanban'
              >
                <LayoutGrid className='mr-2 h-4 w-4' />
                Kanban
              </Button>
              <Button
                onClick={handleAddLead}
                className='bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
                aria-label='Adicionar novo lead'
                title='Adicionar novo lead'
              >
                <Plus className='mr-2 h-4 w-4' />
                Novo Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <DashboardMetrics metrics={metrics} />

        {/* Performance Semanal e Ranking */}
        <WeeklyPerformance
          weeklyMetrics={weeklyMetrics}
          performanceMetrics={performanceMetrics}
        />


        {/* Ações Rápidas */}
        <QuickActions
          onAddLead={handleAddLead}
          onViewKanban={handleViewKanban}
          onViewReports={handleViewReports}
          onViewAllLeads={handleViewLeads}
          onScheduleVisit={handleScheduleVisit}
          onMakeCall={handleMakeCall}
          onSendMessage={handleSendMessage}
          onCreateTask={handleCreateTask}
          onSendProposal={handleSendProposal}
          onViewAnalytics={handleViewAnalytics}
        />

        {/* Modais */}
        <AddLeadModal
          open={showAddLeadModal}
          onOpenChange={setShowAddLeadModal}
        />

        <ScheduleVisitModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          lead={selectedLead}
        />

        <FollowUpModal
          open={showFollowUpModal}
          onOpenChange={setShowFollowUpModal}
        />

        <TaskModal open={showTaskModal} onOpenChange={setShowTaskModal} />
      </div>
    </AppLayout>
  );
}
