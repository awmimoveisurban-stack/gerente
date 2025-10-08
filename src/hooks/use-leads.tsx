import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useUserRoles } from '@/hooks/use-user-roles';
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

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { hasRole, loading: rolesLoading } = useUserRoles();

  const fetchLeads = async () => {
    if (!user || rolesLoading) return;

    try {
      setLoading(true);
      console.log('🔍 Fetching leads for user:', user.email);
      
      let query = supabase.from('leads').select('*');
      
      // Para corretores, filtrar por corretor (email)
      if (hasRole('corretor')) {
        query = query.eq('corretor', user.email);
        console.log('👨‍💼 Filtering leads for corretor:', user.email);
      }
      // Para gerentes, buscar todos os leads
      else if (hasRole('gerente')) {
        console.log('👨‍💼 Fetching all leads for gerente');
      }
      // Se não tem role definido, buscar apenas os próprios leads
      else {
        query = query.eq('user_id', user.id);
        console.log('👤 Filtering leads by user_id:', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching leads:', error);
        throw error;
      }
      
      console.log('✅ Leads fetched successfully:', data?.length || 0);
      setLeads(data || []);
    } catch (error) {
      console.error('❌ Erro ao buscar leads:', error);
      toast.error('Erro ao carregar leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const leadToCreate = {
        ...leadData,
        user_id: user.id,
        // Para corretores, definir o corretor como o email do usuário
        corretor: hasRole('corretor') ? user.email : leadData.corretor,
      };

      const { data, error } = await supabase
        .from('leads')
        .insert([leadToCreate])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Lead criado com sucesso!');
      await fetchLeads(); // Recarregar leads
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
      await fetchLeads(); // Recarregar leads
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
      await fetchLeads(); // Recarregar leads
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast.error('Erro ao excluir lead');
      throw error;
    }
  };

  useEffect(() => {
    if (user && !rolesLoading) {
      fetchLeads();

      // Set up realtime subscription with improved error handling
      let channel: any = null;
      let reconnectTimeout: NodeJS.Timeout | null = null;
      let reconnectAttempts = 0;
      const maxReconnectAttempts = 3;
      let isSubscribed = false;

      const setupRealtime = () => {
        try {
          // Clean up existing channel first
          if (channel) {
            supabase.removeChannel(channel);
          }

          channel = supabase
            .channel(`leads-changes-${user.id}`, {
              config: {
                broadcast: { self: false },
                presence: { key: user.id }
              }
            })
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'leads',
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                console.log('🔄 Realtime update received:', payload.eventType);
                // Only fetch if it's not our own change to avoid loops
                if (payload.eventType !== 'INSERT' || !isSubscribed) {
                  fetchLeads();
                }
              }
            )
            .subscribe((status) => {
              console.log('📡 Subscription status:', status);
              
              if (status === 'SUBSCRIBED') {
                console.log('✅ Realtime subscription active for leads');
                isSubscribed = true;
                reconnectAttempts = 0;
              } else if (status === 'CHANNEL_ERROR') {
                console.warn('⚠️ Realtime subscription error - will retry');
                isSubscribed = false;
                handleRealtimeError();
              } else if (status === 'CLOSED') {
                console.log('📡 Realtime subscription closed');
                isSubscribed = false;
                // Don't auto-reconnect on manual close
                if (reconnectAttempts > 0) {
                  handleRealtimeError();
                }
              } else if (status === 'TIMED_OUT') {
                console.warn('⏰ Realtime subscription timed out - will retry');
                isSubscribed = false;
                handleRealtimeError();
              }
            });
        } catch (error) {
          console.warn('⚠️ Error setting up realtime:', error);
          isSubscribed = false;
          handleRealtimeError();
        }
      };

      const handleRealtimeError = () => {
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`🔄 Attempting to reconnect realtime (${reconnectAttempts}/${maxReconnectAttempts})...`);
          
          // Clean up existing channel
          if (channel) {
            supabase.removeChannel(channel);
            channel = null;
          }

          // Try to reconnect after delay with exponential backoff
          reconnectTimeout = setTimeout(() => {
            setupRealtime();
          }, Math.min(2000 * Math.pow(2, reconnectAttempts - 1), 10000));
        } else {
          console.log('⚠️ Max reconnect attempts reached. Using polling fallback.');
          // Fall back to polling every 15 seconds
          const pollingInterval = setInterval(() => {
            fetchLeads();
          }, 15000);

          return () => {
            clearInterval(pollingInterval);
          };
        }
      };

      // Initial setup with delay to ensure auth is ready
      const initTimeout = setTimeout(() => {
        setupRealtime();
      }, 1000);

      return () => {
        console.log('🔌 Cleaning up realtime subscription');
        clearTimeout(initTimeout);
        
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }
        
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
        
        isSubscribed = false;
        reconnectAttempts = 0;
      };
    }
  }, [user, rolesLoading]);

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