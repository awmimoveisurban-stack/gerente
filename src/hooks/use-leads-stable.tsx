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

export const useLeadsStable = () => {
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

      // Configuração estável: polling a cada 5 segundos + realtime opcional
      let pollingInterval: NodeJS.Timeout;
      let channel: any = null;
      let realtimeEnabled = true;

      // Tentar configurar realtime
      const setupRealtime = () => {
        if (!realtimeEnabled) return;

        try {
          channel = supabase
            .channel(`leads-stable-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'leads',
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                console.log('🔄 Realtime update received:', payload);
                fetchLeads();
              }
            )
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                console.log('✅ Realtime ativo - polling reduzido');
                // Se realtime funciona, reduzir polling para 30 segundos
                clearInterval(pollingInterval);
                pollingInterval = setInterval(fetchLeads, 30000);
              } else if (status === 'CHANNEL_ERROR') {
                console.log('⚠️ Realtime com erro - usando apenas polling');
                realtimeEnabled = false;
                if (channel) {
                  supabase.removeChannel(channel);
                  channel = null;
                }
              }
            });
        } catch (error) {
          console.log('⚠️ Erro no realtime - usando apenas polling');
          realtimeEnabled = false;
        }
      };

      // Polling de backup (sempre ativo)
      pollingInterval = setInterval(fetchLeads, 5000);

      // Tentar realtime
      setupRealtime();

      return () => {
        console.log('🔌 Limpando subscriptions');
        clearInterval(pollingInterval);
        if (channel) {
          supabase.removeChannel(channel);
        }
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





