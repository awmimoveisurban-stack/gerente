import { useMemo, useCallback } from 'react';
import { type Lead } from './use-leads';

export interface TodosLeadsMetrics {
  totalLeads: number;
  leadsPorStatus: Record<string, number>;
  leadsPorCorretor: Record<string, number>;
  leadsAtivos: number;
  leadsFechados: number;
  leadsNovos: number;
  leadsInteressados: number;
  leadsVisitas: number;
  leadsPropostas: number;
  valorTotalPipeline: number;
  valorTotalVendas: number;
  ticketMedio: number;
  conversionRate: string;
  leadsRecentes: number;
  leadsPorPeriodo: {
    hoje: number;
    semana: number;
    mes: number;
  };
  performanceCorretores: Array<{
    id: string;
    nome: string;
    leads: number;
    conversao: number;
    valor: number;
  }>;
}

export interface UseTodosLeadsMetricsReturn {
  metrics: TodosLeadsMetrics;
  getStatusCount: (status: string) => number;
  getCorretorCount: (corretor: string) => number;
  getLeadsByStatus: (status: string) => Lead[];
  getLeadsByCorretor: (corretor: string) => Lead[];
  getFilteredLeads: (
    searchTerm: string,
    statusFilter: string,
    corretorFilter: string
  ) => Lead[];
}

export function useTodosLeadsMetrics(
  leads: Lead[]
): UseTodosLeadsMetricsReturn {
  const metrics = useMemo((): TodosLeadsMetrics => {
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

    // Leads por status
    const leadsPorStatus = leads.reduce(
      (acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Leads por corretor
    const leadsPorCorretor = leads.reduce(
      (acc, lead) => {
        const corretor = lead.corretor || 'Sem corretor';
        acc[corretor] = (acc[corretor] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Valor total do pipeline (leads ativos)
    const valorTotalPipeline = leads
      .filter(
        lead => !['fechado', 'perdido'].includes(lead.status.toLowerCase())
      )
      .reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0);

    // Valor total das vendas fechadas
    const valorTotalVendas = leads
      .filter(lead => lead.status.toLowerCase() === 'fechado')
      .reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0);

    // Taxa de conversão
    const conversionRate =
      totalLeads > 0 ? ((leadsFechados / totalLeads) * 100).toFixed(1) : '0';

    // Leads recentes (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const leadsRecentes = leads.filter(
      lead => new Date(lead.created_at) >= sevenDaysAgo
    ).length;

    // Ticket médio
    const ticketMedio =
      leadsFechados > 0 ? valorTotalVendas / leadsFechados : 0;

    // Leads por período
    const hoje = new Date();
    const inicioDoDia = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );
    const inicioDaSemana = new Date(hoje);
    inicioDaSemana.setDate(hoje.getDate() - hoje.getDay());
    const inicioDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const leadsPorPeriodo = {
      hoje: leads.filter(lead => new Date(lead.created_at) >= inicioDoDia)
        .length,
      semana: leads.filter(lead => new Date(lead.created_at) >= inicioDaSemana)
        .length,
      mes: leads.filter(lead => new Date(lead.created_at) >= inicioDoMes)
        .length,
    };

    // Performance dos corretores
    const performanceCorretores = Object.entries(leadsPorCorretor)
      .map(([corretor, count]) => {
        const leadsCorretor = leads.filter(
          lead => (lead.corretor || 'Sem corretor') === corretor
        );
        const leadsFechadosCorretor = leadsCorretor.filter(
          lead => lead.status.toLowerCase() === 'fechado'
        ).length;
        const conversao = count > 0 ? (leadsFechadosCorretor / count) * 100 : 0;
        const valor =
          leadsFechadosCorretor > 0
            ? leadsCorretor
                .filter(lead => lead.status.toLowerCase() === 'fechado')
                .reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0)
            : 0;

        return {
          id: corretor,
          nome: corretor,
          leads: count,
          conversao,
          valor,
        };
      })
      .sort((a, b) => b.leads - a.leads);

    return {
      totalLeads,
      leadsPorStatus,
      leadsPorCorretor,
      leadsAtivos,
      leadsFechados,
      leadsNovos,
      leadsInteressados,
      leadsVisitas,
      leadsPropostas,
      valorTotalPipeline,
      valorTotalVendas,
      ticketMedio,
      conversionRate,
      leadsRecentes,
      leadsPorPeriodo,
      performanceCorretores,
    };
  }, [leads]);

  // ✅ FIX LOOP INFINITO: Usar useCallback em vez de useMemo para funções
  const getStatusCount = useCallback(
    (status: string) => {
      return metrics.leadsPorStatus[status] || 0;
    },
    [metrics.leadsPorStatus]
  );

  const getCorretorCount = useCallback(
    (corretor: string) => {
      return metrics.leadsPorCorretor[corretor] || 0;
    },
    [metrics.leadsPorCorretor]
  );

  const getLeadsByStatus = useCallback(
    (status: string) => {
      return leads.filter(lead => lead.status === status);
    },
    [leads]
  );

  const getLeadsByCorretor = useCallback(
    (corretor: string) => {
      return leads.filter(
        lead => (lead.corretor || 'Sem corretor') === corretor
      );
    },
    [leads]
  );

  const getFilteredLeads = useCallback(
    (searchTerm: string, statusFilter: string, corretorFilter: string) => {
      let filtered = leads;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(lead => {
          return (
            lead.nome.toLowerCase().includes(term) ||
            (lead.email && lead.email.toLowerCase().includes(term)) ||
            (lead.telefone && lead.telefone.includes(term)) ||
            (lead.imovel_interesse &&
              lead.imovel_interesse.toLowerCase().includes(term)) ||
            (lead.corretor && lead.corretor.toLowerCase().includes(term))
          );
        });
      }

      if (statusFilter !== 'todos') {
        filtered = filtered.filter(lead => lead.status === statusFilter);
      }

      if (corretorFilter !== 'todos') {
        filtered = filtered.filter(
          lead => (lead.corretor || 'Sem corretor') === corretorFilter
        );
      }

      return filtered;
    },
    [leads]
  );

  return {
    metrics,
    getStatusCount,
    getCorretorCount,
    getLeadsByStatus,
    getLeadsByCorretor,
    getFilteredLeads,
  };
}
