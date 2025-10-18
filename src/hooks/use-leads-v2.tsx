import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useUnifiedRoles } from '@/hooks/use-unified-roles';
import { useToast } from '@/hooks/use-toast';
import { useLeadCapture } from '@/hooks/use-lead-capture';

// ✅ SINGLETON GLOBAL: Apenas 1 interval para TODOS os componentes
let globalPollingInterval: NodeJS.Timeout | null = null;
let globalPollingActive = false;

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
  // ✅ Campos adicionais para o modal de edição
  tipo_imovel?: string;
  localizacao?: string;
  // ✅ Novos campos do sistema inteligente
  manager_id?: string;
  atribuido_a?: string;
  score_ia?: number;
  prioridade?: string;
  interesse?: string;
  cidade?: string;
  orcamento?: number;
  mensagem_inicial?: string;
  data_contato?: string;
  last_interaction_at?: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUnifiedAuth();
  const { hasRole, loading: rolesLoading } = useUnifiedRoles();
  const { toast } = useToast();
  
  // ✅ USAR NOVO SISTEMA DE CAPTURA INTELIGENTE
  const { captureOrUpdateLead } = useLeadCapture();

  const fetchLeads = useCallback(async (forceRefresh = false) => {
    if (!user || rolesLoading) {
      setLoading(false);
      return;
    }
    
    // ✅ FORÇAR REFRESH: Limpar cache se solicitado
    if (forceRefresh) {
      const cacheKey = `leads_cache_${user.id}`;
      const cacheTimeKey = `leads_time_${user.id}`;
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(cacheTimeKey);
      console.log('🔄 [DEBUG] Cache forçado a limpar para refresh');
    }

    try {
      setLoading(true);
      
      // ✅ OTIMIZAÇÃO: Cache de leads por 30 segundos
      const cacheKey = `leads_cache_${user.id}`;
      const cacheTimeKey = `leads_time_${user.id}`;
      const cachedLeads = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(cacheTimeKey);
      
      console.log('🔍 [DEBUG] Verificando cache:', {
        hasCache: !!cachedLeads,
        cacheTime: cacheTime ? new Date(parseInt(cacheTime)).toLocaleString() : 'não existe',
        cacheAge: cacheTime ? Math.round((Date.now() - parseInt(cacheTime)) / 1000) + 's' : 'não existe'
      });
      
      // Verificar se cache é válido (30 segundos)
      if (cachedLeads && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        if (cacheAge < 30 * 1000) { // 30 segundos
          const leads = JSON.parse(cachedLeads);
          console.log('✅ [DEBUG] Usando cache válido:', { total: leads.length });
          setLeads(leads);
          setLoading(false);
          return;
        } else {
          console.log('⏰ [DEBUG] Cache expirado, buscando dados frescos');
        }
      }
      
      let query = supabase.from('leads').select('*');
      
      // Para corretores, filtrar por corretor (email)
      if (hasRole('corretor')) {
        query = query.or(`corretor.eq.${user.email},user_id.eq.${user.id},atribuido_a.eq.${user.id}`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar leads:', error);
        throw error;
      }
      
      console.log('✅ [DEBUG] Leads carregados:', { total: data?.length || 0 });
      
      // ✅ SALVAR NO CACHE
      if (data) {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        sessionStorage.setItem(cacheTimeKey, Date.now().toString());
      }
      
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast({
        title: "❌ Erro ao carregar leads",
        description: "Não foi possível carregar os leads. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, hasRole, rolesLoading, toast]);

  // ✅ FUNÇÃO CRIAR LEAD USANDO NOVO SISTEMA
  const createLead = async (leadData: Partial<Lead>) => {
    try {
      console.log('🔄 Criando lead com novo sistema:', leadData);
      
      // Preparar dados para o novo sistema
      const newLeadData = {
        nome: leadData.nome || '',
        telefone: leadData.telefone || '',
        email: leadData.email,
        origem: leadData.origem || 'manual',
        status: leadData.status || 'novo',
        observacoes: leadData.observacoes,
        interesse: leadData.interesse,
        cidade: leadData.cidade,
        orcamento: leadData.orcamento,
        mensagem_inicial: leadData.mensagem_inicial,
        user_id: user?.id,
        manager_id: leadData.manager_id,
        atribuido_a: leadData.atribuido_a || user?.id,
        score_ia: leadData.score_ia || 0,
        prioridade: leadData.prioridade || 'media',
        data_contato: leadData.data_contato || new Date().toISOString(),
        metadata: {
          source: 'manual_creation',
          created_by: user?.email,
        },
      };

      // Usar novo sistema de captura
      const result = await captureOrUpdateLead(newLeadData);

      if (result.success) {
        toast({
          title: "✅ Lead criado com sucesso!",
          description: `${result.lead.nome} foi adicionado ao sistema.`
        });
        await fetchLeads(); // Recarregar leads
        return result.lead;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao criar lead:', error);
      
      toast({
        title: "❌ Erro ao criar lead",
        description: error.message || "Não foi possível criar o lead. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      console.log('🔄 Atualizando lead:', id, updates);
      
      // ✅ Limpar campos vazios e preparar dados para atualização
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => 
          value !== null && value !== undefined && value !== ''
        )
      );

      console.log('🧹 Dados limpos para atualização:', cleanUpdates);

      // ✅ Usar método simples do Supabase
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar lead:', error);
        throw error;
      }

      console.log('✅ Lead atualizado com sucesso:', data);
      
      toast({
        title: "✅ Lead atualizado!",
        description: `${data.nome} foi atualizado com sucesso.`
      });
      
      await fetchLeads(); // Recarregar leads
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar lead:', error);
      
      toast({
        title: "❌ Erro ao atualizar lead",
        description: error.message || "Não foi possível atualizar o lead. Tente novamente.",
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
      
      toast({
        title: "✅ Lead excluído!",
        description: "Lead foi removido do sistema."
      });
      
      await fetchLeads(); // Recarregar leads
    } catch (error: any) {
      console.error('Erro ao excluir lead:', error);
      
      toast({
        title: "❌ Erro ao excluir lead",
        description: error.message || "Não foi possível excluir o lead. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const refetch = useCallback(() => {
    return fetchLeads(true);
  }, [fetchLeads]);

  // ✅ POLLING GLOBAL OTIMIZADO
  useEffect(() => {
    if (!user || rolesLoading) return;

    // Iniciar polling global se não estiver ativo
    if (!globalPollingActive) {
      globalPollingActive = true;
      globalPollingInterval = setInterval(() => {
        fetchLeads();
      }, 30000); // 30 segundos
      
      console.log('🔄 [DEBUG] Polling global iniciado');
    }

    // Cleanup
    return () => {
      if (globalPollingInterval) {
        clearInterval(globalPollingInterval);
        globalPollingInterval = null;
        globalPollingActive = false;
        console.log('🔄 [DEBUG] Polling global parado');
      }
    };
  }, [user, rolesLoading, fetchLeads]);

  // Carregar leads inicial
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    createLead,
    updateLead,
    deleteLead,
    refetch,
  };
};
