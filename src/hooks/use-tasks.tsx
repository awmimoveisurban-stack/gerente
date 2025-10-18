import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { toast } from 'sonner';

export interface Task {
  id: string;
  user_id: string;
  lead_id?: string;
  titulo: string;
  descricao?: string;
  status: string;
  data_vencimento?: string;
  prioridade: string;
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUnifiedAuth();

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existe, não mostrar erro para o usuário
        if (error.code === 'PGRST205') {
          console.log('Tabela tasks não existe ainda, retornando array vazio');
          setTasks([]);
          return;
        }
        throw error;
      }
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
      setTasks([]); // Definir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (
    taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...taskData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Tarefa criada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Tarefa atualizada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;

      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();

      // ✅ DESATIVADO: Realtime removido, usando polling
      // Polling a cada 60s (opcional)
      const pollingInterval = setInterval(() => {
        fetchTasks();
      }, 60000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [user]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
};
