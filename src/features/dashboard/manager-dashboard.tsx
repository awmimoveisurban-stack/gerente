import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/auth-context';
import { StandardPage, StandardHeader, MetricCard, StandardCard, ResponsiveGrid } from '@/components/ui/standard-components';
import { DESIGN_SYSTEM } from '@/design-system';
import {
  Users,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  RefreshCw,
  Plus,
  Settings,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// 🎯 INTERFACE DE MÉTRICAS
interface DashboardMetrics {
  totalLeads: number;
  leadsAtivos: number;
  leadsFechados: number;
  taxaConversao: number;
  valorTotal: number;
  corretoresAtivos: number;
  leadsNovosHoje: number;
  tarefasPendentes: number;
}

// 📊 DASHBOARD DO GERENTE
export default function ManagerDashboard() {
  const { user, isManager } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    leadsAtivos: 0,
    leadsFechados: 0,
    taxaConversao: 0,
    valorTotal: 0,
    corretoresAtivos: 0,
    leadsNovosHoje: 0,
    tarefasPendentes: 0
  });
  const [loading, setLoading] = useState(true);

  // 🚀 CARREGAR MÉTRICAS
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        
        // Simular carregamento de dados reais
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados para demonstração
        setMetrics({
          totalLeads: 156,
          leadsAtivos: 89,
          leadsFechados: 23,
          taxaConversao: 14.7,
          valorTotal: 2450000,
          corretoresAtivos: 8,
          leadsNovosHoje: 12,
          tarefasPendentes: 34
        });
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isManager) {
      loadMetrics();
    }
  }, [isManager]);

  // 🔄 ATUALIZAR DADOS
  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  // 🎯 AÇÕES DO HEADER
  const headerActions = (
    <div className="flex gap-3">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
        <Settings className="h-4 w-4" />
        Configurações
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
        <Plus className="h-4 w-4" />
        Novo Lead
      </button>
    </div>
  );

  // 🏷️ BADGES DO HEADER
  const headerBadges = [
    {
      text: `${metrics.corretoresAtivos} corretores ativos`,
      icon: <Users className="h-3 w-3" />
    },
    {
      text: `${metrics.taxaConversao.toFixed(1)}% conversão`,
      icon: <TrendingUp className="h-3 w-3" />
    },
    {
      text: `${metrics.leadsNovosHoje} novos hoje`,
      icon: <Target className="h-3 w-3" />
    }
  ];

  if (!isManager) {
    return (
      <StandardPage>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </StandardPage>
    );
  }

  return (
    <StandardPage
      header={
        <StandardHeader
          title="Dashboard do Gerente"
          description="Visão geral completa da equipe e performance"
          icon={BarChart3}
          badges={headerBadges}
          actions={headerActions}
        />
      }
    >
      {/* 📊 MÉTRICAS PRINCIPAIS */}
      <ResponsiveGrid cols={4} className="mb-8">
        <MetricCard
          title="Total de Leads"
          value={metrics.totalLeads}
          subtitle="Todos os leads"
          icon={Users}
          color="primary"
          trend={{ value: 12, isPositive: true }}
          loading={loading}
        />
        <MetricCard
          title="Leads Ativos"
          value={metrics.leadsAtivos}
          subtitle="Em andamento"
          icon={Target}
          color="success"
          trend={{ value: 8, isPositive: true }}
          loading={loading}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${metrics.taxaConversao.toFixed(1)}%`}
          subtitle="Performance geral"
          icon={TrendingUp}
          color="warning"
          trend={{ value: 2.1, isPositive: true }}
          loading={loading}
        />
        <MetricCard
          title="Valor Total"
          value={`R$ ${(metrics.valorTotal / 1000000).toFixed(1)}M`}
          subtitle="Pipeline de vendas"
          icon={DollarSign}
          color="info"
          trend={{ value: 15, isPositive: true }}
          loading={loading}
        />
      </ResponsiveGrid>

      {/* 📈 MÉTRICAS SECUNDÁRIAS */}
      <ResponsiveGrid cols={3} className="mb-8">
        <MetricCard
          title="Leads Fechados"
          value={metrics.leadsFechados}
          subtitle="Este mês"
          icon={CheckCircle}
          color="success"
          loading={loading}
        />
        <MetricCard
          title="Corretores Ativos"
          value={metrics.corretoresAtivos}
          subtitle="Na equipe"
          icon={Users}
          color="primary"
          loading={loading}
        />
        <MetricCard
          title="Tarefas Pendentes"
          value={metrics.tarefasPendentes}
          subtitle="Para revisar"
          icon={AlertCircle}
          color="warning"
          loading={loading}
        />
      </ResponsiveGrid>

      {/* 📊 GRÁFICOS E ANÁLISES */}
      <ResponsiveGrid cols={2} className="mb-8">
        <StandardCard
          title="Performance da Equipe"
          description="Leads por corretor"
          icon={BarChart3}
          color="primary"
        >
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Gráfico de performance será implementado</p>
            </div>
          </div>
        </StandardCard>

        <StandardCard
          title="Leads por Status"
          description="Distribuição atual"
          icon={Target}
          color="success"
        >
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Gráfico de status será implementado</p>
            </div>
          </div>
        </StandardCard>
      </ResponsiveGrid>

      {/* 🚀 AÇÕES RÁPIDAS */}
      <StandardCard
        title="Ações Rápidas"
        description="Ferramentas de gestão"
        icon={Settings}
        color="info"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <span className="text-sm font-medium">WhatsApp</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Calendar className="h-8 w-8 text-green-500" />
            <span className="text-sm font-medium">Agendamentos</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Users className="h-8 w-8 text-purple-500" />
            <span className="text-sm font-medium">Equipe</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            <span className="text-sm font-medium">Relatórios</span>
          </button>
        </div>
      </StandardCard>
    </StandardPage>
  );
}

