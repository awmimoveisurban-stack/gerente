import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { type Lead } from '@/hooks/use-leads';

export interface FilterState {
  searchTerm: string;
  statusFilter: string;
}

export interface UseLeadsFiltersReturn {
  filters: FilterState;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  resetFilters: () => void;
  filteredLeads: Lead[];
  handleExportLeads: (leads: Lead[]) => void;
  handleViewKanban: () => void;
  handleAddLead: () => void;
  getStatusCount: (status: string) => number;
}

export function useLeadsFilters(
  leads: Lead[],
  onAddLead: () => void
): UseLeadsFiltersReturn {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    statusFilter: 'todos',
  });

  const setSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setStatusFilter = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, statusFilter: status }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ searchTerm: '', statusFilter: 'todos' });
  }, []);

  const filteredLeads = useMemo(() => {
    return (leads || []).filter(lead => {
      const matchesSearch =
        lead.nome?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (lead.email &&
          lead.email
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())) ||
        (lead.telefone && lead.telefone.includes(filters.searchTerm));

      const matchesStatus =
        filters.statusFilter === 'todos' ||
        lead.status === filters.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, filters.searchTerm, filters.statusFilter]);

  const getStatusCount = useCallback(
    (status: string) => {
      if (status === 'todos') return (leads || []).length;
      return (leads || []).filter(lead => lead.status === status).length;
    },
    [leads]
  );

  const handleExportLeads = useCallback(
    (leads: Lead[]) => {
      const dados = leads.map(lead => ({
        nome: lead.nome,
        telefone: lead.telefone,
        email: lead.email,
        status: lead.status,
        valor_interesse: lead.valor_interesse,
        imovel_interesse: lead.imovel_interesse,
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
        title: 'Exportação Concluída',
        description: `${dados.length} leads exportados com sucesso`,
      });
    },
    [toast]
  );

  const handleViewKanban = useCallback(() => {
    navigate('/kanban');
    toast({
      title: 'Navegando para Kanban',
      description: 'Redirecionando para o quadro Kanban',
    });
  }, [navigate, toast]);

  const handleAddLead = useCallback(() => {
    onAddLead();
  }, [onAddLead]);

  return {
    filters,
    setSearchTerm,
    setStatusFilter,
    resetFilters,
    filteredLeads,
    handleExportLeads,
    handleViewKanban,
    handleAddLead,
    getStatusCount,
  };
}
