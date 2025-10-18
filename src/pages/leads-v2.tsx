import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { CorretorRoute } from '@/components/layout/auth-middleware';
import { useSearch } from '@/contexts/search-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/crm/status-badge';
import { LeadDetailsModal } from '@/components/crm/lead-details-modal';
import { WhatsAppMessageModal } from '@/components/crm/whatsapp-message-modal';
import { EditLeadModal } from '@/components/crm/edit-lead-modal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
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
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  PieChart as PieChartIcon,
  Flame,
  MapPin,
  ArrowUpDown,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  Clock3,
} from 'lucide-react';
import { CallLeadModal } from '@/components/crm/call-lead-modal';
import { EmailLeadModal } from '@/components/crm/email-lead-modal';
import { ScheduleVisitModal } from '@/components/crm/schedule-visit-modal';
import { AddLeadModal } from '@/components/crm/add-lead-modal';
import { useLeads, type Lead } from '@/hooks/use-leads-v2';
import { useLeadsFilters } from '@/hooks/use-leads-filters';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';

// 🎨 CORES PARA GRÁFICOS
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

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.orange,
  COLORS.teal,
];

export default function LeadsV2() {
  const { toast } = useToast();
  const { user } = useUnifiedAuth();
  const { leads, loading, createLead, updateLead, deleteLead, refetch } =
    useLeads();
  const { searchTerm: globalSearchTerm, setSearchTerm: setGlobalSearchTerm } =
    useSearch();
  const location = useLocation();

  // Estados dos modais
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('score_ia');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  // Mobile-only view preference
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');
  useEffect(() => {
    const saved = localStorage.getItem('leads-v2-mobile-view');
    if (saved === 'cards' || saved === 'table') setMobileViewMode(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('leads-v2-mobile-view', mobileViewMode);
  }, [mobileViewMode]);

  // Handle global search from header
  useEffect(() => {
    if (location.state?.searchTerm) {
      setGlobalSearchTerm(location.state.searchTerm);
      setSearchTerm(location.state.searchTerm);
    }
  }, [location.state, setGlobalSearchTerm]);

  // Leads filtrados e ordenados (apenas leads atribuídos ao corretor atual)
  const filteredLeads = useMemo(() => {
    // Debug: Log para verificar dados
    console.log('🔍 DEBUG - Filtro de leads:', {
      totalLeads: leads.length,
      userEmail: user?.email,
      userRole: user?.role,
      leadsWithCorretor: leads.filter(l => l.corretor).length,
      leadsWithAtribuidoA: leads.filter(l => (l as any).atribuido_a).length,
    });

    const filtered = leads.filter(lead => {
      // Filtrar apenas leads atribuídos ao corretor atual
      // Verificar tanto corretor quanto atribuido_a
      const matchesCorretor =
        user?.email &&
        (lead.corretor === user.email ||
          lead.atribuido_a === user.email ||
          (lead as any).atribuido_a === user.email);

      const matchesSearch =
        !searchTerm ||
        lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'todos' || lead.status === statusFilter;

      // Debug: Log para cada lead
      if (user?.email && lead.corretor) {
        console.log('🔍 Lead:', {
          nome: lead.nome,
          corretor: lead.corretor,
          atribuido_a: (lead as any).atribuido_a,
          userEmail: user.email,
          matchesCorretor,
        });
      }

      return matchesCorretor && matchesSearch && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'score_ia':
          aValue = (a as any).score_ia || 0;
          bValue = (b as any).score_ia || 0;
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
          aValue = (a as any).score_ia || 0;
          bValue = (b as any).score_ia || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [leads, searchTerm, statusFilter, sortBy, sortOrder, user?.email]);

  // Métricas pessoais
  const personalMetrics = useMemo(() => {
    const totalLeads = leads.length;
    const leadsFechados = leads.filter(l => l.status === 'fechado').length;
    const leadsNovos = leads.filter(l => l.status === 'novo').length;
    const leadsEmAndamento = leads.filter(l =>
      ['contato_realizado', 'visita_agendada', 'proposta_enviada'].includes(
        l.status
      )
    ).length;
    const taxaConversao =
      totalLeads > 0 ? (leadsFechados / totalLeads) * 100 : 0;
    const scoreMedio =
      leads.length > 0
        ? leads.reduce((acc, lead) => acc + ((lead as any).score_ia || 0), 0) /
          leads.length
        : 0;

    return {
      totalLeads,
      leadsFechados,
      leadsNovos,
      leadsEmAndamento,
      taxaConversao,
      scoreMedio,
    };
  }, [leads]);

  // Dados para gráficos
  const statusChartData = [
    { name: 'Novos', value: personalMetrics.leadsNovos, color: COLORS.info },
    {
      name: 'Em Andamento',
      value: personalMetrics.leadsEmAndamento,
      color: COLORS.warning,
    },
    {
      name: 'Fechados',
      value: personalMetrics.leadsFechados,
      color: COLORS.success,
    },
  ];

  const performanceChartData = [
    {
      name: 'Taxa Conversão',
      value: personalMetrics.taxaConversao,
      color: COLORS.primary,
    },
    {
      name: 'Score Médio',
      value: personalMetrics.scoreMedio,
      color: COLORS.success,
    },
  ];

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // ✅ DEBUG: Limpar cache manualmente
      const cacheKey = `leads_cache_${user?.id}`;
      const cacheTimeKey = `leads_time_${user?.id}`;
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(cacheTimeKey);
      console.log('🔄 [DEBUG] Cache limpo manualmente');

      await refetch();
      toast({
        title: '✅ Leads Atualizados',
        description: 'Seus leads foram atualizados com sucesso!',
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
      valor_imovel: lead.valor_imovel,
      interesse: (lead as any).interesse,
      score_ia: (lead as any).score_ia,
      prioridade: (lead as any).prioridade,
      data_entrada: lead.data_entrada,
      ultima_interacao: lead.ultima_interacao,
    }));

    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-leads-${new Date().toISOString().split('T')[0]}.json`;
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
    setSortBy('score_ia');
    setSortOrder('desc');
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
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className='relative'
    >
      <Card
        className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
          onClick ? 'hover:border-opacity-80' : 'border-opacity-50'
        }`}
        style={{ borderColor: color }}
        onClick={onClick}
      >
        <CardContent className='p-6'>
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
                    <TrendingUp className='h-3 w-3 text-red-500 mr-1 rotate-180' />
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
    <CorretorRoute>
      <AppLayout>
      <div className='space-y-8'>
        {/* 🎯 HEADER MODERNO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-3xl p-8 border border-green-200/50 dark:border-gray-700/50 shadow-lg'
        >
          <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
            <div>
              <h1 className='text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
                Meus Leads
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2 text-lg'>
                🎯 Gestão pessoal dos seus leads e oportunidades
              </p>
              <div className='flex items-center gap-4 mt-4'>
                <Badge variant='outline' className='bg-white/50'>
                  <Users className='h-3 w-3 mr-1' />
                  {filteredLeads.length} leads filtrados
                </Badge>
                <Badge variant='outline' className='bg-white/50'>
                  <Target className='h-3 w-3 mr-1' />
                  {personalMetrics?.taxaConversao?.toFixed(1) || '0.0'}%
                  conversão
                </Badge>
                <Badge variant='outline' className='bg-white/50'>
                  <Star className='h-3 w-3 mr-1' />
                  Score médio: {personalMetrics?.scoreMedio?.toFixed(0) || '0'}
                </Badge>
              </div>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Button
                onClick={handleAddLead}
                className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300'
              >
                <Plus className='mr-2 h-4 w-4' />
                Novo Lead
              </Button>

              <Button
                onClick={handleExportLeads}
                variant='outline'
                className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 dark:border-blue-800'
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

        {/* 📊 MÉTRICAS PESSOAIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
        >
          <MetricCard
            title='Total de Leads'
            value={personalMetrics.totalLeads}
            icon={Users}
            color={COLORS.primary}
            subtitle='Seus leads'
            trend={{ value: 15, label: 'este mês' }}
          />

          <MetricCard
            title='Leads Fechados'
            value={personalMetrics.leadsFechados}
            icon={Award}
            color={COLORS.success}
            subtitle='Vendas concluídas'
            trend={{ value: 12, label: 'esta semana' }}
          />

          <MetricCard
            title='Taxa de Conversão'
            value={`${personalMetrics?.taxaConversao?.toFixed(1) || '0.0'}%`}
            icon={Target}
            color={COLORS.warning}
            subtitle='Sua performance'
            trend={{ value: 5, label: 'vs mês anterior' }}
          />

          <MetricCard
            title='Score Médio IA'
            value={personalMetrics?.scoreMedio?.toFixed(0) || '0'}
            icon={Star}
            color={COLORS.info}
            subtitle='Qualidade dos leads'
            trend={{ value: 8, label: 'melhorou' }}
          />
        </motion.div>

        {/* 📈 GRÁFICOS PESSOAIS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='grid grid-cols-1 lg:grid-cols-2 gap-8'
        >
          {/* 🥧 STATUS DOS LEADS */}
          <Card className='shadow-xl border-2 border-green-200 dark:border-green-800'>
            <CardHeader className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'>
              <CardTitle className='flex items-center gap-2'>
                <PieChartIcon className='h-5 w-5 text-green-600' />
                Status dos Meus Leads
              </CardTitle>
              <CardDescription>
                Distribuição dos seus leads por estágio
              </CardDescription>
            </CardHeader>
            <CardContent className='p-6'>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className='mt-4 grid grid-cols-3 gap-2'>
                {statusChartData.map((status, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: status.color }}
                    />
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      {status.name}: {status.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 📊 PERFORMANCE PESSOAL */}
          <Card className='shadow-xl border-2 border-blue-200 dark:border-blue-800'>
            <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5 text-blue-600' />
                Minha Performance
              </CardTitle>
              <CardDescription>
                Métricas de conversão e qualidade
              </CardDescription>
            </CardHeader>
            <CardContent className='p-6'>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='name' stroke='#666' />
                  <YAxis stroke='#666' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar
                    dataKey='value'
                    fill={COLORS.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* 🔍 FILTROS E BUSCA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className='shadow-xl border-2 border-purple-200 dark:border-purple-800'>
            <CardHeader className='bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20'>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5 text-purple-600' />
                Filtros e Busca
                <Button
                  variant='outline'
                  size='sm'
                  className='ml-auto sm:hidden'
                  onClick={() => setShowFilters(v => !v)}
                >
                  {showFilters ? 'Ocultar' : 'Mostrar'}
                </Button>
              </CardTitle>
              <CardDescription>
                Encontre os leads que você precisa
              </CardDescription>
            </CardHeader>
            <CardContent className={`p-6 ${showFilters ? 'block' : 'hidden'} sm:block`}>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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

                {/* Ordenação */}
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

                {/* Ordem e View Mode */}
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                  >
                    <ArrowUpDown className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() =>
                      setViewMode(viewMode === 'grid' ? 'list' : 'grid')
                    }
                  >
                    {viewMode === 'grid' ? (
                      <LayoutGrid className='h-4 w-4' />
                    ) : (
                      <BarChart3 className='h-4 w-4' />
                    )}
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

        {/* 📋 LISTA DE LEADS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className='shadow-xl border-2 border-indigo-200 dark:border-indigo-800'>
            <CardHeader className='bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-indigo-600' />
                Meus Leads
                {/* Toggle mobile cards/table */}
                <div className='ml-auto sm:hidden'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setMobileViewMode(mobileViewMode === 'cards' ? 'table' : 'cards')}
                  >
                    {mobileViewMode === 'cards' ? 'Ver Tabela' : 'Ver Cards'}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {filteredLeads.length} leads encontrados
              </CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              {loading ? (
                <div className='p-12 text-center'>
                  <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600' />
                  <p className='text-gray-600 dark:text-gray-400'>
                    Carregando seus leads...
                  </p>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className='p-12 text-center'>
                  <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center'>
                    <Users className='h-10 w-10 text-indigo-400' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                    {leads.length === 0
                      ? 'Erro ao Carregar Leads'
                      : 'Nenhum Lead Encontrado'}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 mb-6'>
                    {leads.length === 0
                      ? 'Não foi possível carregar os leads. Verifique sua conexão e tente novamente.'
                      : `Você não tem leads atribuídos no momento. ${user?.email ? `Seu email: ${user.email}` : ''}`}
                  </p>
                  {leads.length === 0 && (
                    <Button onClick={() => refetch()} variant='outline'>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      Tentar Novamente
                    </Button>
                  )}
                  <Button onClick={handleAddLead}>
                    <Plus className='mr-2 h-4 w-4' />
                    Criar Primeiro Lead
                  </Button>
                </div>
              ) : viewMode === 'list' ? (
                <>
                <div className={`overflow-x-auto ${mobileViewMode === 'table' ? 'block' : 'hidden'} sm:block`}>
                  <Table className='min-w-full'>
                    <TableHeader>
                      <TableRow className='hover:bg-transparent'>
                        <TableHead
                          className='cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
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
                          className='cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
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
                        <TableHead>🏠 Interesse</TableHead>
                        <TableHead>💰 Valor</TableHead>
                        <TableHead>📞 Contato</TableHead>
                        <TableHead>📊 Status</TableHead>
                        <TableHead>⚙️ Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredLeads.map((lead, index) => (
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
                                <div className='relative'>
                                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold'>
                                    {lead.nome?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                  {(lead as any).score_ia >= 80 && (
                                    <div className='absolute -top-1 -right-1'>
                                      <Flame className='h-5 w-5 text-red-500 fill-current' />
                                    </div>
                                  )}
                                </div>
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

                            {/* Status */}
                            <TableCell>
                              <StatusBadge status={lead.status as any} />
                            </TableCell>

                            {/* Ações */}
                            <TableCell>
                              <div className='flex items-center gap-1'>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleViewDetails(lead)}
                                  title='Ver Detalhes'
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleCallLead(lead)}
                                  title='Ligar'
                                >
                                  <Phone className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleEmailLead(lead)}
                                  title='Enviar E-mail'
                                >
                                  <Mail className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleScheduleVisit(lead)}
                                  title='Agendar Visita'
                                >
                                  <Calendar className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleEditLead(lead)}
                                  title='Editar Lead'
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
                {/* mobile cards */}
                <div className={`${mobileViewMode === 'cards' ? 'block' : 'hidden'} sm:hidden p-4 space-y-3`}>
                  {filteredLeads.map((lead, index) => (
                    <Card key={lead.id} className='border border-indigo-100 dark:border-indigo-900'>
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='flex items-center gap-3 min-w-0'>
                            <div className='w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0'>
                              {lead.nome?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className='min-w-0'>
                              <p className='font-semibold text-gray-900 dark:text-white truncate text-sm'>{lead.nome}</p>
                              <div className='flex items-center gap-2 mt-1 text-[11px] text-gray-500 dark:text-gray-400'>
                                {(lead as any).interesse && (
                                  <span className='truncate'>🏠 {(lead as any).interesse}</span>
                                )}
                                {lead.valor_imovel && (
                                  <span className='truncate'>• R$ {lead.valor_imovel.toLocaleString('pt-BR')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={lead.status as any} />
                        </div>
                        <div className='mt-2 flex items-center gap-3 text-[12px] text-gray-600 dark:text-gray-300'>
                          {lead.telefone && (
                            <span className='flex items-center gap-1 truncate'><Phone className='h-3 w-3' />{lead.telefone}</span>
                          )}
                          {lead.email && (
                            <span className='flex items-center gap-1 truncate'><Mail className='h-3 w-3' />{lead.email}</span>
                          )}
                        </div>
                        <div className='mt-3 flex items-center justify-end gap-2'>
                          <Button variant='outline' size='sm' className='h-8 px-2' onClick={() => setShowDetailsModal(true) || setSelectedLead(lead)}>
                            <Eye className='h-3 w-3 mr-1' /> Detalhes
                          </Button>
                          <Button variant='outline' size='sm' className='h-8 px-2' onClick={() => setShowCallModal(true) || setSelectedLead(lead)}>
                            <Phone className='h-3 w-3 mr-1' /> Ligar
                          </Button>
                          <Button variant='outline' size='sm' className='h-8 px-2' onClick={() => setShowEmailModal(true) || setSelectedLead(lead)}>
                            <Mail className='h-3 w-3 mr-1' /> Email
                          </Button>
                          <Button variant='outline' size='sm' className='h-8 px-2' onClick={() => setShowVisitModal(true) || setSelectedLead(lead)}>
                            <Calendar className='h-3 w-3 mr-1' /> Visita
                          </Button>
                          <Button variant='outline' size='sm' className='h-8 px-2' onClick={() => setShowEditModal(true) || setSelectedLead(lead)}>
                            <Edit className='h-3 w-3 mr-1' /> Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                </>
              ) : (
                /* Grid View */
                <div className='p-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <AnimatePresence>
                      {filteredLeads.map((lead, index) => (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                          className='group'
                        >
                          <Card className='h-full transition-all duration-300 hover:shadow-xl border-2 hover:border-indigo-300'>
                            <CardContent className='p-6'>
                              <div className='flex items-start justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                  <div className='relative'>
                                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg'>
                                      {lead.nome?.charAt(0).toUpperCase() ||
                                        '?'}
                                    </div>
                                    {(lead as any).score_ia >= 80 && (
                                      <div className='absolute -top-1 -right-1'>
                                        <Flame className='h-5 w-5 text-red-500 fill-current' />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className='font-bold text-gray-900 dark:text-white'>
                                      {lead.nome}
                                    </h3>
                                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                                      {new Date(
                                        lead.created_at
                                      ).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                                <StatusBadge status={lead.status as any} />
                              </div>

                              <div className='space-y-3'>
                                {/* Score IA */}
                                {(lead as any).score_ia && (
                                  <div className='flex items-center justify-between'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      Score IA:
                                    </span>
                                    <div className='flex items-center gap-2'>
                                      <span
                                        className={`font-bold ${
                                          (lead as any).score_ia >= 70
                                            ? 'text-green-600'
                                            : (lead as any).score_ia >= 40
                                              ? 'text-yellow-600'
                                              : 'text-red-600'
                                        }`}
                                      >
                                        {(lead as any).score_ia}/100
                                      </span>
                                      <div className='w-16 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                        <div
                                          className={`h-full ${
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
                                    </div>
                                  </div>
                                )}

                                {/* Interesse */}
                                {(lead as any).interesse && (
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      Interesse:
                                    </span>
                                    <Badge
                                      variant='outline'
                                      className='bg-blue-50 text-blue-700 border-blue-200'
                                    >
                                      🏠 {(lead as any).interesse}
                                    </Badge>
                                  </div>
                                )}

                                {/* Valor */}
                                {(lead as any).orcamento && (
                                  <div className='flex items-center justify-between'>
                                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                                      Orçamento:
                                    </span>
                                    <span className='font-bold text-green-600 dark:text-green-400'>
                                      R${' '}
                                      {(lead as any).orcamento.toLocaleString(
                                        'pt-BR'
                                      )}
                                    </span>
                                  </div>
                                )}

                                {/* Contato */}
                                <div className='space-y-1'>
                                  {lead.telefone && (
                                    <div className='flex items-center gap-2 text-sm'>
                                      <Phone className='h-3 w-3 text-gray-400' />
                                      <span className='text-gray-900 dark:text-white'>
                                        {lead.telefone}
                                      </span>
                                    </div>
                                  )}
                                  {lead.email && (
                                    <div className='flex items-center gap-2 text-sm'>
                                      <Mail className='h-3 w-3 text-gray-400' />
                                      <span className='text-gray-600 dark:text-gray-400'>
                                        {lead.email}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Ações */}
                              <div className='grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleViewDetails(lead)}
                                >
                                  <Eye className='mr-2 h-3 w-3' />
                                  Ver
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleCallLead(lead)}
                                >
                                  <Phone className='mr-2 h-3 w-3' />
                                  Ligar
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleEmailLead(lead)}
                                >
                                  <Mail className='mr-2 h-3 w-3' />
                                  E-mail
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleScheduleVisit(lead)}
                                >
                                  <Calendar className='mr-2 h-3 w-3' />
                                  Visita
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleEditLead(lead)}
                                  className='col-span-2'
                                >
                                  <Edit className='mr-2 h-3 w-3' />
                                  Editar Lead
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modais */}
      <AddLeadModal
        open={showAddLeadModal}
        onOpenChange={setShowAddLeadModal}
      />

      <LeadDetailsModal
        lead={selectedLead}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLead(null);
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
          refetch();
        }}
      />

      <CallLeadModal
        lead={selectedLead}
        isOpen={showCallModal}
        onClose={() => {
          setShowCallModal(false);
          setSelectedLead(null);
        }}
      />

      <EmailLeadModal
        lead={selectedLead}
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setSelectedLead(null);
        }}
      />

      <ScheduleVisitModal
        lead={selectedLead}
        isOpen={showVisitModal}
        onClose={() => {
          setShowVisitModal(false);
          setSelectedLead(null);
        }}
        onSuccess={() => {
          setShowVisitModal(false);
          setSelectedLead(null);
          refetch();
        }}
      />

      {/* Novos modais para ações */}
      <WhatsAppMessageModal
        lead={selectedLead}
        isOpen={showWhatsAppModal}
        onClose={() => {
          setShowWhatsAppModal(false);
          setSelectedLead(null);
        }}
        onWhatsAppReply={() => {
          toast({
            title: '💬 Mensagem Enviada',
            description: 'Mensagem enviada via WhatsApp com sucesso!',
          });
        }}
      />
      </AppLayout>
    </CorretorRoute>
  );
}
