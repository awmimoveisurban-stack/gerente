import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export interface Lead {
  id: string;
  user_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  imovel_interesse?: string;
  valor_interesse?: number;
  status: string;
  corretor?: string;
  observacoes?: string;
  data_entrada: string;
  ultima_interacao?: string;
  created_at: string;
  updated_at: string;
}

export const useLeadsFallback = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLeads = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          ...leadData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Lead criado com sucesso!');
      // Atualizar lista local
      setLeads(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast.error('Erro ao criar lead');
      throw error;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          ultima_interacao: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Lead atualizado com sucesso!');
      // Atualizar lista local
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast.error('Erro ao atualizar lead');
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Lead excluído com sucesso!');
      // Remover da lista local
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast.error('Erro ao excluir lead');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeads();

      // Fallback: polling a cada 5 segundos se realtime falhar
      const pollingInterval = setInterval(() => {
        fetchLeads();
      }, 5000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [user]);

  // Estatísticas dos leads
  const getLeadsStats = () => {
    const stats = {
      total: leads.length,
      novo: leads.filter(l => l.status === 'novo').length,
      contatado: leads.filter(l => l.status === 'contatado').length,
      interessado: leads.filter(l => l.status === 'interessado').length,
      visita_agendada: leads.filter(l => l.status === 'visita_agendada').length,
      proposta: leads.filter(l => l.status === 'proposta').length,
      fechado: leads.filter(l => l.status === 'fechado').length,
      perdido: leads.filter(l => l.status === 'perdido').length,
    };

    const totalValue = leads
      .filter(l => l.status === 'fechado')
      .reduce((sum, l) => sum + (l.valor_interesse || 0), 0);

    return {
      ...stats,
      totalValue,
      conversionRate: stats.total > 0 ? ((stats.fechado / stats.total) * 100).toFixed(1) : '0',
    };
  };

  // Buscar leads por status
  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  // Buscar leads por período
  const getLeadsByPeriod = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return leads.filter(lead => 
      new Date(lead.created_at) >= cutoffDate
    );
  };

  return {
    leads,
    loading,
    createLead,
    updateLead,
    deleteLead,
    refetch: fetchLeads,
    getLeadsStats,
    getLeadsByStatus,
    getLeadsByPeriod,
  };
};
