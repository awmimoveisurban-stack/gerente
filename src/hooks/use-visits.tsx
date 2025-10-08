import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export interface Visit {
  id: string;
  user_id: string;
  lead_id: string;
  property_id?: string;
  data_visita: string;
  endereco: string;
  observacoes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useVisits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchVisits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('data_visita', { ascending: true });

      if (error) {
        // Se a tabela não existe, não mostrar erro para o usuário
        if (error.code === 'PGRST205') {
          console.log('Tabela visits não existe ainda, retornando array vazio');
          setVisits([]);
          return;
        }
        throw error;
      }
      setVisits(data || []);
    } catch (error) {
      console.error('Erro ao buscar visitas:', error);
      toast.error('Erro ao carregar visitas');
      setVisits([]); // Definir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const createVisit = async (visitData: Omit<Visit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('visits')
        .insert([{
          ...visitData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Visita agendada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao agendar visita:', error);
      toast.error('Erro ao agendar visita');
      throw error;
    }
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Visita atualizada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar visita:', error);
      toast.error('Erro ao atualizar visita');
      throw error;
    }
  };

  const deleteVisit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Visita cancelada com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar visita:', error);
      toast.error('Erro ao cancelar visita');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchVisits();

      // Set up realtime subscription
      const channel = supabase
        .channel('visits-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'visits',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchVisits();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    visits,
    loading,
    createVisit,
    updateVisit,
    deleteVisit,
    refetch: fetchVisits,
  };
};