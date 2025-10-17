import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { ManagerRoute } from '@/components/layout/auth-middleware';
import { useEvolutionPollingDireto } from '@/hooks/use-evolution-polling-direto';
import { useAutoAssignLeads } from '@/hooks/use-auto-assign-leads';
import { useCorretores } from '@/hooks/use-corretores';
import { LeadsNaoDirecionados } from '@/components/crm/leads-nao-direcionados';
import { MonitorLigacoes } from '@/components/crm/monitor-ligacoes';
import { LeadDetailsModal } from '@/components/crm/lead-details-modal';
import { WhatsAppMessageModal } from '@/components/crm/whatsapp-message-modal';
import { EditLeadModal } from '@/components/crm/edit-lead-modal';
import { AddLeadModal } from '@/components/crm/add-lead-modal';
import { usePagination } from '@/hooks/use-pagination';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// ✅ OTIMIZAÇÃO: Gráficos removidos para melhor performance
import { useLeads, type Lead } from '@/hooks/use-leads';
import { useTodosLeadsMetrics } from '@/hooks/use-todos-leads-metrics';
import { useToast } from '@/hooks/use-toast';
import { debugNavigation } from '@/utils/debug-navigation';
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
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Clock,
  MapPin,
  Flame,
  TrendingDown,
  ArrowUpDown,
  Settings,
} from 'lucide-react';

// 🎨 CORES PARA UI (gráficos removidos)
const COLORS = {
  primary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  blue: '#3B82F6',
  orange: '#F97316',
  teal: '#14B8A6',
};

export default function TodosLeadsV2() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { leads, loading, createLead, updateLead, deleteLead, refetch } =
    useLeads();
  const { corretores, loading: corretoresLoading } = useCorretores();

  // 🔍 DEBUG: Monitorar navegação para esta página
  React.useEffect(() => {
    console.log('🔍 [TODOS-LEADS] Página carregada, executando debug...');
    debugNavigation.logNavigationState('Todos Leads', { leads: leads.length, loading });
    
    // Verificar inconsistências
    const inconsistencies = debugNavigation.checkNavigationInconsistencies('Todos Leads', { leads: leads.length, loading });
    if (inconsistencies.length > 0) {
      console.log('🔄 [TODOS-LEADS] Inconsistências encontradas, forçando sincronização...');
      debugNavigation.forceNavigationSync({ leads: leads.length, loading });
    }
  }, [leads, loading]);

  // ✅ POLLING ATIVADO (busca mensagens a cada 30s + Claude AI)
  useEvolutionPollingDireto(true);

  // ✅ AUTO-ASSIGN ATIVADO (redirecionamento automático após 2h)
  useAutoAssignLeads(true);

  // Hook personalizado para métricas
  const { metrics, getStatusCount, getCorretorCount, getFilteredLeads } =
    useTodosLeadsMetrics(leads);

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [corretorFilter, setCorretorFilter] = useState('todos');
  const [origemFilter, setOrigemFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('score_ia');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estados para modais
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [periodoMonitor, setPeriodoMonitor] = useState<
    'hoje' | 'semana' | 'mes'
  >('hoje');

  // Leads filtrados com ordenação
  const filteredLeads = useMemo(() => {
    let filtered = getFilteredLeads(searchTerm, statusFilter, corretorFilter);

    // Filtrar por origem
    if (origemFilter !== 'todos') {
      filtered = filtered.filter(lead => lead.origem === origemFilter);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'score_ia':
          aValue = a.score_ia || 0;
          bValue = b.score_ia || 0;
          break;
        case 'nome':
          aValue = a.nome || '';
          bValue = b.nome || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'valor':
          aValue = a.valor_imovel || 0;
          bValue = b.valor_imovel || 0;
          break;
        default:
          aValue = a.score_ia || 0;
          bValue = b.score_ia || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    getFilteredLeads,
    searchTerm,
    statusFilter,
    corretorFilter,
    origemFilter,
    sortBy,
    sortOrder,
  ]);

  // ✅ PAGINAÇÃO
  const {
    paginationState,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  } = usePagination(filteredLeads, 10);

  // ✅ OTIMIZAÇÃO: Dados de gráficos removidos para melhor performance

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // ✅ DEBUG: Limpar cache manualmente
      const { useUnifiedAuth } = await import('@/contexts/unified-auth-context');
      const { user } = useUnifiedAuth();
      const cacheKey = `leads_cache_${user?.id}`;
      const cacheTimeKey = `leads_time_${user?.id}`;
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(cacheTimeKey);
      console.log('🔄 [DEBUG] Cache limpo manualmente (todos-leads)');

      await refetch();
      toast({
        title: '✅ Leads Atualizados',
        description: 'Lista de leads atualizada com sucesso!',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao Atualizar',
        description: 'Não foi possível atualizar os leads.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportLeads = useCallback(() => {
    const dados = filteredLeads.map(lead => ({
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email,
      status: lead.status,
      corretor: lead.corretor || 'Sem corretor',
      valor_imovel: lead.valor_imovel,
      interesse: lead.interesse,
      score_ia: lead.score_ia,
      prioridade: lead.prioridade,
      data_entrada: lead.data_entrada,
      ultima_interacao: lead.ultima_interacao,
    }));

    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-leads-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: '✅ Exportação Concluída',
      description: `${filteredLeads.length} leads exportados com sucesso!`,
    });
  }, [filteredLeads, toast]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('todos');
    setCorretorFilter('todos');
    setOrigemFilter('todos');
    setSortBy('score_ia');
    setSortOrder('desc');
  }, []);

  // Handlers para ações dos leads
  const handleViewDetails = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  }, []);

  const handleEditLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
    toast({
      title: '📝 Editando Lead',
      description: `Editando informações de ${lead.nome}`,
    });
  }, [toast]);

  const handleWhatsAppContact = useCallback((lead: Lead) => {
    if (!lead.telefone) {
      toast({
        title: '⚠️ Telefone não disponível',
        description: 'Este lead não possui número de telefone cadastrado.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedLead(lead);
    setShowWhatsAppModal(true);
  }, [toast]);

  const handleDeleteLead = useCallback(async (lead: Lead) => {
    const confirmDelete = window.confirm(
      `⚠️ Tem certeza que deseja excluir o lead "${lead.nome}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) return;

    try {
      await deleteLead(lead.id);
      toast({
        title: '✅ Lead Excluído',
        description: `Lead "${lead.nome}" foi excluído com sucesso.`,
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao Excluir',
        description: 'Não foi possível excluir o lead.',
        variant: 'destructive',
      });
    }
  }, [deleteLead, toast]);

  const handleAddNewLead = useCallback(() => {
    setShowAddLeadModal(true);
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Componente de card de métrica
  const MetricCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
    trend,
    onClick,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
    trend?: { value: number; label: string };
    onClick?: () => void;
  }) => (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className='relative h-full'>
      <Card
        className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 h-full ${onClick ? 'hover:border-opacity-80' : 'border-opacity-50'}`}
        style={{ borderColor: color }}
        onClick={onClick}
      >
        <CardContent className='p-6 h-full'>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                {title}
              </p>
              <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                {value}
              </p>
              {subtitle && (
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  {subtitle}
                </p>
              )}
              {trend && (
                <div className='flex items-center mt-2'>
                  {trend.value > 0 ? (
                    <TrendingUp className='h-3 w-3 text-green-500 mr-1' />
                  ) : (
                    <TrendingDown className='h-3 w-3 text-red-500 mr-1' />
                  )}
                  <span
                    className={`text-xs ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {Math.abs(trend.value)}% {trend.label}
                  </span>
                </div>
              )}
            </div>
            <div
              className='p-3 rounded-xl'
              style={{ backgroundColor: color + '20' }}
            >
              <Icon className='h-8 w-8' style={{ color }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <ManagerRoute>
      <AppLayout>
      <div className='space-y-8'>
        {/* 🎯 HEADER MODERNO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-3xl p-8 border border-blue-200/50 dark:border-gray-700/50 shadow-lg'
        >
          <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
            <div>
              <h1 className='text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                Gestão de Leads
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2 text-lg'>
                📊 Visão completa de todos os leads da equipe
              </p>
              <div className='flex items-center gap-4 mt-4'>
                <Badge variant='outline' className='bg-white/50'>
                  <Users className='h-3 w-3 mr-1' />
                  {filteredLeads.length} leads filtrados
                </Badge>
                <Badge variant='outline' className='bg-white/50'>
                  <Target className='h-3 w-3 mr-1' />
                  {metrics?.taxaConversao?.toFixed(1) || '0.0'}% conversão
                </Badge>
              </div>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Button
                onClick={handleAddNewLead}
                className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300'
              >
                <Plus className='mr-2 h-4 w-4' />
                Novo Lead
              </Button>

              <Button
                onClick={handleExportLeads}
                variant='outline'
                className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-950/20 border-green-200 dark:border-green-800'
              >
                <Download className='mr-2 h-4 w-4' />
                Exportar
              </Button>

              <Button
                onClick={handleRefresh}
                variant='outline'
                disabled={isRefreshing}
                className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'
              >
                {isRefreshing ? (
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <RefreshCw className='mr-2 h-4 w-4' />
                )}
                Atualizar
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 📊 MÉTRICAS PRINCIPAIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch'
        >
          <MetricCard
            title='Total de Leads'
            value={leads.length}
            icon={Users}
            color={COLORS.primary}
            subtitle='Todos os leads'
            trend={{ value: 12, label: 'este mês' }}
          />

          <MetricCard
            title='Leads Fechados'
            value={metrics?.leadsFechados || 0}
            icon={Award}
            color={COLORS.success}
            subtitle='Vendas concluídas'
            trend={{ value: 8, label: 'esta semana' }}
          />

          <MetricCard
            title='Taxa de Conversão'
            value={`${metrics?.taxaConversao?.toFixed(1) || '0.0'}%`}
            icon={Target}
            color={COLORS.warning}
            subtitle='Performance geral'
            trend={{ value: 3, label: 'vs mês anterior' }}
          />

          <MetricCard
            title='Corretores Ativos'
            value={metrics?.corretoresAtivos || 0}
            icon={Building2}
            color={COLORS.info}
            subtitle='Equipe trabalhando'
          />
        </motion.div>

        {/* 🚨 LEADS NÃO DIREcionados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LeadsNaoDirecionados
            leads={leads}
            corretores={corretores}
            onLeadAtribuido={refetch}
          />
        </motion.div>

        {/* 📞 MONITOR DE LIGAÇÕES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <MonitorLigacoes
            periodo={periodoMonitor}
            onPeriodoChange={setPeriodoMonitor}
          />
        </motion.div>

        {/* ✅ OTIMIZAÇÃO: Gráficos removidos para melhor performance */}

        {/* 🔍 FILTROS AVANÇADOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className='shadow-xl border-2 border-purple-200 dark:border-purple-800'>
            <CardHeader className='bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20'>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5 text-purple-600' />
                Filtros e Ordenação
              </CardTitle>
              <CardDescription>
                Filtre e ordene os leads conforme sua necessidade
              </CardDescription>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
                {/* Busca */}
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Buscar por nome ou telefone...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>

                {/* Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='todos'>Todos os Status</SelectItem>
                    <SelectItem value='novo'>Novo</SelectItem>
                    <SelectItem value='contato_realizado'>
                      Contato Realizado
                    </SelectItem>
                    <SelectItem value='visita_agendada'>
                      Visita Agendada
                    </SelectItem>
                    <SelectItem value='proposta_enviada'>
                      Proposta Enviada
                    </SelectItem>
                    <SelectItem value='fechado'>Fechado</SelectItem>
                  </SelectContent>
                </Select>

                {/* Corretor */}
                <Select
                  value={corretorFilter}
                  onValueChange={setCorretorFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Corretor' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='todos'>Todos os Corretores</SelectItem>
                    {Array.from(
                      new Set(leads.map(l => l.corretor).filter(Boolean))
                    ).map(corretor => (
                      <SelectItem key={corretor} value={corretor}>
                        {corretor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Origem */}
                <Select value={origemFilter} onValueChange={setOrigemFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Origem' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='todos'>Todas as Origens</SelectItem>
                    <SelectItem value='whatsapp'>WhatsApp</SelectItem>
                    <SelectItem value='site'>Site</SelectItem>
                    <SelectItem value='indicacao'>Indicação</SelectItem>
                    <SelectItem value='manual'>Manual</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ordenação */}
                <div className='flex gap-2'>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder='Ordenar por' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='score_ia'>Score IA</SelectItem>
                      <SelectItem value='nome'>Nome</SelectItem>
                      <SelectItem value='created_at'>Data</SelectItem>
                      <SelectItem value='valor'>Valor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                  >
                    <ArrowUpDown className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <div className='flex justify-between items-center mt-4'>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Mostrando {filteredLeads.length} de {leads.length} leads
                </p>
                <Button variant='outline' onClick={handleResetFilters}>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 📋 TABELA DE LEADS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className='shadow-xl border-2 border-indigo-200 dark:border-indigo-800'>
            <CardHeader className='bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-indigo-600' />
                Lista de Leads
              </CardTitle>
              <CardDescription>
                {paginationState.total} leads encontrados (
                {paginationState.startIndex + 1}-{paginationState.endIndex} de{' '}
                {paginationState.total})
              </CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              {loading ? (
                <div className='p-12 text-center'>
                  <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600' />
                  <p className='text-gray-600 dark:text-gray-400'>
                    Carregando leads...
                  </p>
                </div>
              ) : paginationState.total === 0 ? (
                <div className='p-12 text-center'>
                  <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center'>
                    <Users className='h-10 w-10 text-indigo-400' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                    Nenhum Lead Encontrado
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 mb-6'>
                    Tente ajustar os filtros ou criar novos leads
                  </p>
                  <Button onClick={handleAddNewLead}>
                    <Plus className='mr-2 h-4 w-4' />
                    Criar Primeiro Lead
                  </Button>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <Table className='min-w-full'>
                    <TableHeader>
                      <TableRow className='hover:bg-transparent'>
                        <TableHead
                          className='cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 min-w-[120px]'
                          onClick={() => handleSort('score_ia')}
                        >
                          <div className='flex items-center gap-2'>
                            🤖 IA Score
                            {sortBy === 'score_ia' && (
                              <span className='text-xs'>
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className='cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 min-w-[150px]'
                          onClick={() => handleSort('nome')}
                        >
                          <div className='flex items-center gap-2'>
                            👤 Lead
                            {sortBy === 'nome' && (
                              <span className='text-xs'>
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className='min-w-[120px]'>🏠 Interesse</TableHead>
                        <TableHead className='min-w-[100px]'>💰 Valor</TableHead>
                        <TableHead className='min-w-[120px]'>📞 Contato</TableHead>
                        <TableHead className='min-w-[120px] hidden lg:table-cell'>👨‍💼 Corretor</TableHead>
                        <TableHead className='min-w-[100px]'>📊 Status</TableHead>
                        <TableHead className='min-w-[120px]'>⚙️ Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {paginatedData.map((lead, index) => (
                          <motion.tr
                            key={lead.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
                          >
                            {/* IA Score */}
                            <TableCell>
                              <div className='flex flex-col gap-2'>
                                {(lead as any).score_ia !== undefined &&
                                (lead as any).score_ia !== null ? (
                                  <>
                                    <div className='flex items-center gap-2'>
                                      <span
                                        className={`text-lg font-bold ${
                                          (lead as any).score_ia >= 70
                                            ? 'text-green-600'
                                            : (lead as any).score_ia >= 40
                                              ? 'text-yellow-600'
                                              : 'text-red-600'
                                        }`}
                                      >
                                        {(lead as any).score_ia}
                                      </span>
                                      <span className='text-xs text-gray-500'>
                                        /100
                                      </span>
                                    </div>
                                    <div className='w-20 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                      <div
                                        className={`h-full transition-all ${
                                          (lead as any).score_ia >= 70
                                            ? 'bg-green-500'
                                            : (lead as any).score_ia >= 40
                                              ? 'bg-yellow-500'
                                              : 'bg-red-500'
                                        }`}
                                        style={{
                                          width: `${(lead as any).score_ia}%`,
                                        }}
                                      />
                                    </div>
                                    {(lead as any).prioridade && (
                                      <Badge
                                        variant='outline'
                                        className={`text-xs ${
                                          (lead as any).prioridade === 'alta'
                                            ? 'bg-red-50 text-red-700 border-red-200'
                                            : (lead as any).prioridade ===
                                                'media'
                                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                              : 'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}
                                      >
                                        {(lead as any).prioridade === 'alta'
                                          ? '🔥'
                                          : (lead as any).prioridade === 'media'
                                            ? '⚠️'
                                            : 'ℹ️'}
                                        {(lead as any).prioridade.toUpperCase()}
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <span className='text-xs text-gray-400'>
                                    Sem análise
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Lead Info */}
                            <TableCell>
                              <div className='flex items-center gap-3'>
                                <Avatar className='h-10 w-10'>
                                  <AvatarFallback className='bg-gradient-to-br from-indigo-400 to-purple-600 text-white font-bold'>
                                    {lead.nome?.charAt(0).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='font-semibold text-gray-900 dark:text-white'>
                                    {lead.nome}
                                  </p>
                                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                                    {new Date(
                                      lead.created_at
                                    ).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Interesse */}
                            <TableCell>
                              <div className='flex flex-col gap-1'>
                                {(lead as any).interesse && (
                                  <Badge
                                    variant='outline'
                                    className='bg-blue-50 text-blue-700 border-blue-200'
                                  >
                                    🏠 {(lead as any).interesse}
                                  </Badge>
                                )}
                                {(lead as any).cidade && (
                                  <span className='text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1'>
                                    <MapPin className='h-3 w-3' />
                                    {(lead as any).cidade}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Valor */}
                            <TableCell>
                              <div className='flex flex-col gap-1'>
                                {(lead as any).orcamento && (
                                  <span className='font-bold text-green-600 dark:text-green-400'>
                                    R${' '}
                                    {(lead as any).orcamento.toLocaleString(
                                      'pt-BR'
                                    )}
                                  </span>
                                )}
                                {lead.valor_imovel && (
                                  <span className='text-sm text-gray-600 dark:text-gray-400'>
                                    R${' '}
                                    {lead.valor_imovel.toLocaleString('pt-BR')}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Contato */}
                            <TableCell>
                              <div className='flex flex-col gap-1'>
                                {lead.telefone && (
                                  <span className='text-sm text-gray-900 dark:text-white flex items-center gap-1'>
                                    <Phone className='h-3 w-3' />
                                    {lead.telefone}
                                  </span>
                                )}
                                {lead.email && (
                                  <span className='text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1'>
                                    <Mail className='h-3 w-3' />
                                    {lead.email}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Corretor */}
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-6 w-6'>
                                  <AvatarFallback className='bg-gradient-to-br from-green-400 to-blue-600 text-white text-xs'>
                                    {lead.corretor?.charAt(0).toUpperCase() ||
                                      '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className='text-sm text-gray-900 dark:text-white'>
                                  {lead.corretor || 'Sem corretor'}
                                </span>
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Badge
                                variant='outline'
                                className={
                                  lead.status === 'fechado'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : lead.status === 'proposta_enviada'
                                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                                      : lead.status === 'visita_agendada'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : lead.status === 'contato_realizado'
                                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                          : 'bg-gray-50 text-gray-700 border-gray-200'
                                }
                              >
                                {lead.status === 'fechado'
                                  ? '✅ Fechado'
                                  : lead.status === 'proposta_enviada'
                                    ? '📄 Proposta'
                                    : lead.status === 'visita_agendada'
                                      ? '📅 Visita'
                                      : lead.status === 'contato_realizado'
                                        ? '📞 Contato'
                                        : '🆕 Novo'}
                              </Badge>
                            </TableCell>

                            {/* Ações */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant='ghost' size='icon'>
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuItem
                                    onClick={() => handleViewDetails(lead)}
                                  >
                                    <Eye className='mr-2 h-4 w-4' />
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEditLead(lead)}
                                  >
                                    <Edit className='mr-2 h-4 w-4' />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleWhatsAppContact(lead)}
                                  >
                                    <MessageSquare className='mr-2 h-4 w-4' />
                                    WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteLead(lead)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Deletar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 📄 PAGINAÇÃO */}
        {paginationState.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='flex justify-center mt-6'
          >
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={e => {
                      e.preventDefault();
                      prevPage();
                    }}
                    className={
                      !paginationState.hasPrevPage
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: paginationState.totalPages },
                  (_, i) => i + 1
                ).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href='#'
                      onClick={e => {
                        e.preventDefault();
                        goToPage(page);
                      }}
                      isActive={page === paginationState.page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={e => {
                      e.preventDefault();
                      nextPage();
                    }}
                    className={
                      !paginationState.hasNextPage
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </motion.div>
        )}
      </div>

      {/* Modais */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLead(null);
        }}
      />

      <WhatsAppMessageModal
        lead={selectedLead}
        isOpen={showWhatsAppModal}
        onClose={() => {
          setShowWhatsAppModal(false);
          setSelectedLead(null);
        }}
        onWhatsAppReply={() => {
          // Callback para quando uma mensagem é enviada
          toast({
            title: '💬 Mensagem Enviada',
            description: 'Mensagem enviada via WhatsApp com sucesso!',
          });
        }}
      />

      <EditLeadModal
        lead={selectedLead}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLead(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedLead(null);
          refetch(); // Atualizar lista após edição
        }}
      />

      <AddLeadModal
        open={showAddLeadModal}
        onOpenChange={(open) => {
          setShowAddLeadModal(open);
          if (!open) return;
        }}
      />
      </AppLayout>
    </ManagerRoute>
  );
}
