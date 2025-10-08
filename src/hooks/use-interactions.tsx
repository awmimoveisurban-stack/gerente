import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export interface Interaction {
  id: string;
  user_id: string;
  lead_id: string;
  tipo: string;
  descricao: string;
  data_interacao: string;
  created_at: string;
}

export const useInteractions = (leadId?: string) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInteractions = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('interactions')
        .select('*')
        .order('data_interacao', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error('Erro ao buscar interações:', error);
      toast.error('Erro ao carregar interações');
    } finally {
      setLoading(false);
    }
  };

  const createInteraction = async (interactionData: Omit<Interaction, 'id' | 'user_id' | 'created_at' | 'data_interacao'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert([{
          ...interactionData,
          user_id: user.id,
          data_interacao: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Interação registrada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar interação:', error);
      toast.error('Erro ao registrar interação');
      throw error;
    }
  };

  const deleteInteraction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('interactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Interação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir interação:', error);
      toast.error('Erro ao excluir interação');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchInteractions();

      // Set up realtime subscription
      const channel = supabase
        .channel('interactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'interactions',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchInteractions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, leadId]);

  return {
    interactions,
    loading,
    createInteraction,
    deleteInteraction,
    refetch: fetchInteractions,
  };
};