import { useMemo } from 'react';
import { type Lead } from '@/hooks/use-leads';

export interface DashboardMetrics {
  totalLeads: number;
  leadsAtivos: number;
  leadsFechados: number;
  leadsNovos: number;
  leadsInteressados: number;
  leadsVisitas: number;
  leadsPropostas: number;
  metaMensal: number;
  progressoMeta: number;
  valorTotalLeads: number;
  valorTotalVendas: number;
  ticketMedio: number;
  conversionRate: string;
  leadsPorStatus: Record<string, number>;
}

export interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics;
  getStatusCount: (status: string) => number;
  getWeeklyMetrics: () => {
    leadsSemana: number;
    metaSemanal: number;
    progressoSemanal: number;
    leadsInteressadosSemana: number;
    leadsVisitasSemana: number;
  };
  getPerformanceMetrics: () => {
    ranking: number;
    performance: string;
    pontos: number;
    nivel: string;
  };
}

export function useDashboardMetrics(leads: Lead[]): UseDashboardMetricsReturn {
  const metrics = useMemo((): DashboardMetrics => {
    const totalLeads = leads.length;
    const leadsAtivos = leads.filter(
      lead => !['fechado', 'perdido'].includes(lead.status.toLowerCase())
    ).length;
    const leadsFechados = leads.filter(
      lead => lead.status.toLowerCase() === 'fechado'
    ).length;
    const leadsNovos = leads.filter(
      lead => lead.status.toLowerCase() === 'novo'
    ).length;
    const leadsInteressados = leads.filter(
      lead => lead.status.toLowerCase() === 'interessado'
    ).length;
    const leadsVisitas = leads.filter(
      lead => lead.status.toLowerCase() === 'visita_agendada'
    ).length;
    const leadsPropostas = leads.filter(
      lead => lead.status.toLowerCase() === 'proposta'
    ).length;

    // Meta mensal para corretor
    const metaMensal = 20;
    const progressoMeta =
      totalLeads > 0 ? Math.min((totalLeads / metaMensal) * 100, 100) : 0;

    // Valor total dos leads ativos
    const valorTotalLeads = leads
      .filter(
        lead => !['fechado', 'perdido'].includes(lead.status.toLowerCase())
      )
      .reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0);

    // Valor total das vendas fechadas
    const valorTotalVendas = leads
      .filter(lead => lead.status.toLowerCase() === 'fechado')
      .reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0);

    // Ticket médio
    const ticketMedio =
      leadsFechados > 0 ? valorTotalVendas / leadsFechados : 0;

    // Taxa de conversão
    const conversionRate =
      totalLeads > 0 ? ((leadsFechados / totalLeads) * 100).toFixed(1) : '0';

    // Leads por status
    const leadsPorStatus = leads.reduce(
      (acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalLeads,
      leadsAtivos,
      leadsFechados,
      leadsNovos,
      leadsInteressados,
      leadsVisitas,
      leadsPropostas,
      metaMensal,
      progressoMeta,
      valorTotalLeads,
      valorTotalVendas,
      ticketMedio,
      conversionRate,
      leadsPorStatus,
    };
  }, [leads]);

  const getStatusCount = useMemo(
    () => (status: string) => {
      if (status === 'todos') return leads.length;
      return leads.filter(lead => lead.status === status).length;
    },
    [leads]
  );

  const getWeeklyMetrics = useMemo(
    () => () => {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

      const leadsSemana = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= startOfWeek && leadDate <= endOfWeek;
      }).length;

      const metaSemanal = 5; // 5 leads por semana
      const progressoSemanal =
        leadsSemana > 0 ? Math.min((leadsSemana / metaSemanal) * 100, 100) : 0;

      const leadsInteressadosSemana = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return (
          leadDate >= startOfWeek &&
          leadDate <= endOfWeek &&
          lead.status === 'interessado'
        );
      }).length;

      const leadsVisitasSemana = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return (
          leadDate >= startOfWeek &&
          leadDate <= endOfWeek &&
          lead.status === 'visita_agendada'
        );
      }).length;

      return {
        leadsSemana,
        metaSemanal,
        progressoSemanal,
        leadsInteressadosSemana,
        leadsVisitasSemana,
      };
    },
    [leads]
  );

  const getPerformanceMetrics = useMemo(
    () => () => {
      // Simulação de ranking baseado na performance
      const performance = parseFloat(metrics.conversionRate);
      let ranking = 1;
      let pontos = 0;
      let nivel = 'Iniciante';

      if (performance >= 20) {
        ranking = 1;
        pontos = 950;
        nivel = 'Expert';
      } else if (performance >= 15) {
        ranking = 2;
        pontos = 750;
        nivel = 'Avançado';
      } else if (performance >= 10) {
        ranking = 3;
        pontos = 550;
        nivel = 'Intermediário';
      } else if (performance >= 5) {
        ranking = 4;
        pontos = 350;
        nivel = 'Iniciante';
      } else {
        ranking = 5;
        pontos = 150;
        nivel = 'Novato';
      }

      return {
        ranking,
        performance: `${performance}%`,
        pontos,
        nivel,
      };
    },
    [metrics.conversionRate]
  );

  return {
    metrics,
    getStatusCount,
    getWeeklyMetrics,
    getPerformanceMetrics,
  };
}
