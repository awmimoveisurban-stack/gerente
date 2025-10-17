import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useUnifiedRoles } from '@/hooks/use-unified-roles';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  user_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  origem?: string;
  imovel_interesse?: string;
  valor_interesse?: number;
  status: string;
  corretor?: string;
  observacoes?: string;
  data_entrada: string;
  ultima_interacao?: string;
  created_at: string;
  updated_at: string;
  tipo_imovel?: string;
  localizacao?: string;
}

export const useLeadsSimple = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUnifiedAuth();
  const { hasRole, loading: rolesLoading } = useUnifiedRoles();
  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    if (!user || rolesLoading) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // ✅ Filtrar por role
      if (hasRole('corretor')) {
        query = query.eq('corretor', user.email);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar leads:', error);
        setLeads([]);
      } else {
        setLeads(data || []);
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [user, rolesLoading, hasRole]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      console.log('🔄 Atualizando lead:', id, updates);
      
      // ✅ Limpar campos vazios
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => 
          value !== null && value !== undefined && value !== ''
        )
      );

      console.log('🧹 Dados limpos:', cleanUpdates);

      // ✅ Usar método direto do Supabase
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...cleanUpdates,
          ultima_interacao: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw new Error(error.message || 'Erro ao atualizar lead');
      }
      
      console.log('✅ Lead atualizado:', data);
      
      // ✅ Atualizar estado local
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === id ? { ...lead, ...cleanUpdates } : lead
        )
      );
      
      toast({
        title: "✅ Lead Atualizado",
        description: "Informações salvas com sucesso!"
      });
      
      return data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar lead:', error);
      toast({
        title: "❌ Erro ao Atualizar",
        description: error.message || "Não foi possível atualizar o lead.",
        variant: "destructive"
      });
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

      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
      
      toast({
        title: "✅ Lead Excluído",
        description: "Lead removido com sucesso!"
      });
    } catch (error: any) {
      console.error('Erro ao deletar lead:', error);
      toast({
        title: "❌ Erro ao Excluir",
        description: error.message || "Não foi possível excluir o lead.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createLead = async (leadData: Partial<Lead>) => {
    try {
      // ✅ Garantir campos mínimos e formatos válidos
      const nowIso = new Date().toISOString();

      const isUuid = (val?: string) =>
        !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

      const baseData: any = {
        nome: leadData.nome,
        email: leadData.email,
        telefone: leadData.telefone,
        imovel_interesse: leadData.imovel_interesse,
        observacoes: leadData.observacoes,
        status: (leadData.status as any) || 'novo',
        data_entrada: leadData.data_entrada || nowIso,
        ultima_interacao: leadData.ultima_interacao || nowIso,
        created_at: nowIso,
        updated_at: nowIso,
        // Vincular corretor por email (evita conflitos de uuid/text)
        corretor: (leadData as any).corretor || user?.email || null,
      };

      // Incluir user_id apenas se for uuid válido (evita 400 text=uuid)
      if (isUuid(user?.id || '')) {
        baseData.user_id = user?.id;
      }

      // Remover chaves com undefined/null vazio
      const insertData = Object.fromEntries(
        Object.entries(baseData).filter(([_, v]) => v !== undefined && v !== '')
      );

      const { data, error } = await supabase
        .from('leads')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      setLeads(prevLeads => [data, ...prevLeads]);
      
      toast({
        title: "✅ Lead Criado",
        description: "Novo lead adicionado com sucesso!"
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "❌ Erro ao Criar",
        description: error.message || "Não foi possível criar o lead.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    leads,
    loading,
    createLead,
    updateLead,
    deleteLead,
    refetch: fetchLeads,
  };
};
