import { useMemo, useCallback } from "react";
import { type Lead } from "@/hooks/use-leads-stable";

export interface KanbanMetrics {
  totalLeads: number;
  leadsPorStatus: Record<string, number>;
  leadsAtivos: number;
  leadsFechados: number;
  valorTotalPipeline: number;
  conversionRate: string;
  leadsRecentes: number;
  leadsInteressados: number;
  leadsVisitas: number;
  leadsPropostas: number;
  ticketMedio: number;
  leadsPorPeriodo: {
    hoje: number;
    semana: number;
    mes: number;
  };
}

export interface UseKanbanMetricsReturn {
  metrics: KanbanMetrics;
  getStatusCount: (status: string) => number;
  getLeadsByStatus: (status: string) => Lead[];
  getFilteredLeads: (searchTerm: string) => Lead[];
  getColumnStats: () => Array<{
    id: string;
    title: string;
    count: number;
    leads: Lead[];
  }>;
}

export function useKanbanMetrics(leads: Lead[]): UseKanbanMetricsReturn {
  const metrics = useMemo((): KanbanMetrics => {
    const totalLeads = leads.length;
    const leadsAtivos = leads.filter(lead => !["fechado", "perdido"].includes(lead.status.toLowerCase())).length;
    const leadsFechados = leads.filter(lead => lead.status.toLowerCase() === "fechado").length;
    const leadsInteressados = leads.filter(lead => lead.status.toLowerCase() === "interessado").length;
    const leadsVisitas = leads.filter(lead => lead.status.toLowerCase() === "visita_agendada").length;
    const leadsPropostas = leads.filter(lead => lead.status.toLowerCase() === "proposta").length;
    
    // Leads por status
    const leadsPorStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Valor total do pipeline (leads ativos)
    const valorTotalPipeline = leads.filter(lead => !["fechado", "perdido"].includes(lead.status.toLowerCase())).reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0);
    
    // Taxa de conversão
    const conversionRate = totalLeads > 0 ? ((leadsFechados / totalLeads) * 100).toFixed(1) : "0";
    
    // Leads recentes (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const leadsRecentes = leads.filter(lead => new Date(lead.created_at) >= sevenDaysAgo).length;
    
    // Ticket médio
    const ticketMedio = leadsFechados > 0 ? leads.filter(lead => lead.status.toLowerCase() === "fechado").reduce((sum, lead) => sum + (lead.valor_interesse || 0), 0) / leadsFechados : 0;
    
    // Leads por período
    const hoje = new Date();
    const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicioDaSemana = new Date(hoje);
    inicioDaSemana.setDate(hoje.getDate() - hoje.getDay());
    const inicioDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    const leadsPorPeriodo = {
      hoje: leads.filter(lead => new Date(lead.created_at) >= inicioDoDia).length,
      semana: leads.filter(lead => new Date(lead.created_at) >= inicioDaSemana).length,
      mes: leads.filter(lead => new Date(lead.created_at) >= inicioDoMes).length,
    };

    return {
      totalLeads,
      leadsPorStatus,
      leadsAtivos,
      leadsFechados,
      valorTotalPipeline,
      conversionRate,
      leadsRecentes,
      leadsInteressados,
      leadsVisitas,
      leadsPropostas,
      ticketMedio,
      leadsPorPeriodo
    };
  }, [leads]);

  const getStatusCount = useCallback((status: string) => {
    return metrics.leadsPorStatus[status] || 0;
  }, [metrics.leadsPorStatus]);

  const getLeadsByStatus = useCallback((status: string) => {
    return leads.filter(lead => lead.status === status);
  }, [leads]);

  const getFilteredLeads = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return leads;
    
    const term = searchTerm.toLowerCase();
    return leads.filter(lead => {
      return lead.nome.toLowerCase().includes(term) ||
             (lead.email && lead.email.toLowerCase().includes(term)) ||
             (lead.telefone && lead.telefone.includes(term)) ||
             (lead.imovel_interesse && lead.imovel_interesse.toLowerCase().includes(term));
    });
  }, [leads]);

  const getColumnStats = useCallback(() => {
    const COLUMNS = [
      { id: 'novo', title: 'Novo' },
      { id: 'contatado', title: 'Contatado' },
      { id: 'interessado', title: 'Interessado' },
      { id: 'visita_agendada', title: 'Visita Agendada' },
      { id: 'proposta', title: 'Proposta' },
      { id: 'perdido', title: 'Perdido' },
    ];

    return COLUMNS.map(column => ({
      id: column.id,
      title: column.title,
      count: getStatusCount(column.id),
      leads: getLeadsByStatus(column.id)
    }));
  }, [getStatusCount, getLeadsByStatus]);

  return {
    metrics,
    getStatusCount,
    getLeadsByStatus,
    getFilteredLeads,
    getColumnStats
  };
}





