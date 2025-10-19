import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useToast } from '@/hooks/use-toast';
import { useDashboard } from '@/hooks/use-dashboard';
import { useAnalyticsData } from '@/hooks/use-analytics-data';
import {
  LeadsByStatusChart,
  CorretorPerformanceChart,
  LeadsByOriginChart,
  ConversionTrendChart,
  ValueTrendChart,
} from '@/components/ui/analytics-charts';
import { AppLayout } from '@/components/layout/app-layout';
import { ManagerRoute } from '@/components/layout/auth-middleware';
import { AILeadIndicators } from '@/components/ui/ai-indicators';
import { AITooltip } from '@/components/ui/ai-tooltip';
import {
  formatarDataRelativa,
  type LeadCompleto,
} from '@/utils/lead-intelligence';
import {
  Users,
  TrendingUp,
  Target,
  Building2,
  Calendar,
  Trophy,
  RefreshCw,
  Settings,
  BarChart3,
  Activity,
  Plus,
  Eye,
  ArrowRight,
  Zap,
  Clock,
  UserCheck,
  Star,
  ChevronRight,
  Bell,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Phone,
  Mail,
} from 'lucide-react';

// 🎨 PALETA DE CORES OTIMIZADA
const COLORS = {
  primary: '#6366F1',      // Indigo mais moderno
  success: '#10B981',      // Verde mantido
  warning: '#F59E0B',      // Amarelo mantido
  danger: '#EF4444',       // Vermelho mantido
  info: '#3B82F6',         // Azul mantido
  purple: '#8B5CF6',       // Roxo mantido
  teal: '#14B8A6',         // Teal mantido
  orange: '#F97316',       // Laranja mantido
};

export default function GerenteDashboardV2() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    metrics,
    corretoresPerformance,
    leadsRecentes,
    allLeads,
    loading,
    refetch,
  } = useDashboard();
  const analyticsData = useAnalyticsData();

  // ✅ FUNÇÕES AUXILIARES PARA IA
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'alta':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'media':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'baixa':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
        return <AlertTriangle className="h-3 w-3" />;
      case 'alta':
        return <TrendingUp className="h-3 w-3" />;
      case 'media':
        return <Target className="h-3 w-3" />;
      case 'baixa':
        return <Clock className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  const getOriginIcon = (origin: string) => {
    switch (origin?.toLowerCase()) {
      case 'whatsapp':
        return <MessageSquare className="h-3 w-3 text-green-500" />;
      case 'site':
        return <Users className="h-3 w-3 text-blue-500" />;
      case 'indicacao':
        return <Users className="h-3 w-3 text-purple-500" />;
      case 'manual':
        return <Settings className="h-3 w-3 text-gray-500" />;
      default:
        return <Users className="h-3 w-3 text-gray-500" />;
    }
  };

  // 🎯 ESTADOS PARA INTERATIVIDADE
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  

  // ✅ OTIMIZAÇÃO: Dados de gráficos removidos para melhor performance

  // 🔄 FUNCIONALIDADES REAIS DOS BOTÕES
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: '✅ Dashboard Atualizado',
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
  };

  const handleNovoLead = () => {
    // Redireciona para página de leads com modal aberto
    navigate('/todos-leads?action=new');
  };

  const handleVerLeads = () => {
    navigate('/todos-leads');
  };

  const handleCorretores = () => {
    navigate('/gerente-equipe');
  };

  const handleAgendamentos = () => {
    navigate('/kanban?filter=agendamentos');
  };

  const handleRelatorios = () => {
    navigate('/gerente-relatorios');
  };

  const handleConfiguracoes = () => {
    navigate('/profile');
  };

  const handleSair = async () => {
    // Implementar logout real
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/login');
  };

  // 🎨 COMPONENTE DE CARD MÉTRICA
  const MetricCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
    trend,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
    trend?: { value: number; label: string };
  }) => (
    <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className='relative h-full'>
      <Card
        className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 h-full`}
        style={{ borderColor: color }}
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
                <TrendingUp className='h-3 w-3 text-green-500 mr-1' />
                <span className='text-xs text-green-600 dark:text-green-400'>
                  {trend.value}% {trend.label}
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


  if (loading) {
    return (
      <ManagerRoute>
        <AppLayout>
          <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
            <div className='container mx-auto px-4 py-8'>
              <div className='animate-pulse space-y-8'>
                {/* Header Skeleton */}
                <div className='bg-white dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700'>
                  <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4'></div>
                  <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                </div>
                
                {/* Metrics Skeleton */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className='h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl'
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </ManagerRoute>
    );
  }

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
                <div className='space-y-3'>
            <div>
              <h1 className='text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                Dashboard Gerencial
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2 text-lg'>
                📊 Visão estratégica completa do desempenho da equipe
              </p>
              <div className='flex items-center gap-4 mt-4'>
                <Badge variant='outline' className='bg-white/50'>
                  <Clock className='h-3 w-3 mr-1' />
                  Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                </Badge>
                <Badge variant='outline' className='bg-white/50'>
                  <Users className='h-3 w-3 mr-1' />
                  {metrics?.corretoresAtivos || 0} corretores ativos
                </Badge>
              </div>
            </div>
                </div>

            <div className='flex flex-wrap gap-3'>
              <Button
                onClick={handleNovoLead}
                className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300'
              >
                <Plus className='mr-2 h-4 w-4' />
                Novo Lead
              </Button>

              <Button
                onClick={handleVerLeads}
                variant='outline'
                className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-950/20 border-green-200 dark:border-green-800'
              >
                <Eye className='mr-2 h-4 w-4' />
                Ver Leads
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
            value={metrics?.totalLeads || 0}
            icon={Users}
            color={COLORS.primary}
            subtitle='Todos os leads'
            trend={{ value: 12, label: 'este mês' }}
          />

          <MetricCard
            title='Leads Fechados'
            value={metrics?.leadsFechados || 0}
            icon={Trophy}
            color={COLORS.success}
            subtitle='Vendas concluídas'
            trend={{ value: 8, label: 'esta semana' }}
          />

          <MetricCard
            title='Taxa de Conversão'
            value={`${metrics?.taxaConversao || 0}%`}
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
            trend={{ value: 2, label: 'novos este mês' }}
          />
        </motion.div>

      {/* ✅ OTIMIZAÇÃO: Gráficos removidos para melhor performance e UX */}

        {/* 📋 AÇÕES RÁPIDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className='shadow-xl border-2 border-blue-200 dark:border-blue-800'>
            <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='h-5 w-5 text-blue-600' />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4'>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='outline'
                    className='h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 border-green-200 hover:bg-green-50 text-xs sm:text-sm text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100'
                    onClick={handleNovoLead}
                  >
                    <Plus className='h-5 w-5 sm:h-6 sm:w-6 text-green-600' />
                    <span className='text-xs'>Novo Lead</span>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='outline'
                    className='h-20 flex flex-col items-center justify-center gap-2 border-blue-200 hover:bg-blue-50 text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100'
                    onClick={handleVerLeads}
                  >
                    <Users className='h-6 w-6 text-blue-600' />
                    <span className='text-xs'>Ver Leads</span>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='outline'
                    className='h-20 flex flex-col items-center justify-center gap-2 border-purple-200 hover:bg-purple-50 text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100'
                    onClick={handleCorretores}
                  >
                    <Building2 className='h-6 w-6 text-purple-600' />
                    <span className='text-xs'>Corretores</span>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='outline'
                    className='h-20 flex flex-col items-center justify-center gap-2 border-orange-200 hover:bg-orange-50 text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100'
                    onClick={handleAgendamentos}
                  >
                    <Calendar className='h-6 w-6 text-orange-600' />
                    <span className='text-xs'>Agendamentos</span>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='outline'
                    className='h-20 flex flex-col items-center justify-center gap-2 border-yellow-200 hover:bg-yellow-50 text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100'
                    onClick={handleRelatorios}
                  >
                    <BarChart3 className='h-6 w-6 text-yellow-600' />
                    <span className='text-xs'>Relatórios</span>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='outline'
                    className='h-20 flex flex-col items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 text-gray-800 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100'
                    onClick={handleConfiguracoes}
                  >
                    <Settings className='h-6 w-6 text-gray-600' />
                    <span className='text-xs'>Configurações</span>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 📊 SEÇÃO DE GRÁFICOS ANALÍTICOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Análises e Gráficos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Visualize insights importantes sobre sua equipe e leads
            </p>
          </div>

          {/* Primeira linha de gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <LeadsByStatusChart 
              data={analyticsData.leadsByStatus} 
              loading={analyticsData.loading}
            />
            <LeadsByOriginChart 
              data={analyticsData.leadsByOrigin} 
              loading={analyticsData.loading}
            />
          </div>

          {/* Segunda linha de gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ConversionTrendChart 
              data={analyticsData.conversionTrend} 
              loading={analyticsData.loading}
            />
            <ValueTrendChart 
              data={analyticsData.valueTrend} 
              loading={analyticsData.loading}
            />
          </div>

          {/* Terceira linha - Performance dos Corretores (largura completa) */}
          <div className="grid grid-cols-1 gap-6">
            <CorretorPerformanceChart 
              data={analyticsData.corretorPerformance} 
              loading={analyticsData.loading}
            />
          </div>
        </motion.div>

      </div>
      </AppLayout>
    </ManagerRoute>
  );
}
