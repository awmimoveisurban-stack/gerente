import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useUnifiedRoles } from '@/hooks/use-unified-roles';
import { useToast } from '@/hooks/use-toast';
import { useSafeLeadIntegration } from '@/components/notifications/safe-integration';
import { useUnifiedCache } from '@/hooks/use-unified-cache';

// ✅ SINGLETON GLOBAL: Apenas 1 interval para TODOS os componentes
let globalPollingInterval: NodeJS.Timeout | null = null;
let globalPollingActive = false;

export interface Lead {
  id: string;
  user_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  origem?: string; // ✅ Origem do lead (whatsapp, site, indicacao, etc)
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
}

export const useLeads = () => {
  // ✅ MODO NORMAL: Buscar dados reais do banco
  const EMERGENCY_MODE = false;
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUnifiedAuth();
  const { hasRole, loading: rolesLoading } = useUnifiedRoles();
  const { toast } = useToast();
  
  // ✅ CACHE UNIFICADO PARA PERFORMANCE
  const cache = useUnifiedCache({ defaultTTL: 30000, maxSize: 50 });
  
  // ✅ INTEGRAÇÃO SEGURA DE NOTIFICAÇÕES
  const { notifyLeadCreated, notifyLeadUpdated } = useSafeLeadIntegration();

  const fetchLeads = useCallback(async (forceRefresh = false) => {
    // 🚨 MODO EMERGÊNCIA
    if (EMERGENCY_MODE) {
      setLeads([]);
      setLoading(false);
      return;
    }
    
    if (!user || rolesLoading) {
      setLoading(false);
      return;
    }
    
    // ✅ FORÇAR REFRESH: Limpar cache se solicitado
    if (forceRefresh) {
      cache.clearCache(`leads_${user.id}`);
      console.log('🔄 [DEBUG] Cache forçado a limpar para refresh');
    }

    try {
      setLoading(true);
      
      // ✅ OTIMIZAÇÃO: Cache unificado de leads
      const cacheKey = `leads_${user.id}`;
      const cachedLeads = cache.getCachedData<Lead[]>(cacheKey);
      
      console.log('🔍 [DEBUG] Verificando cache unificado:', {
        hasCache: !!cachedLeads,
        cacheStats: cache.getCacheStats()
      });
      
      // Verificar se cache é válido
      if (cachedLeads && !forceRefresh) {
        console.log('✅ [DEBUG] Usando cache unificado válido:', { total: cachedLeads.length });
        setLeads(cachedLeads);
        setLoading(false);
        return;
      }
      
      let query = supabase.from('leads').select('*');
      
      // Para corretores, filtrar por corretor (email)
      if (hasRole('corretor')) {
        console.log('🔍 [LEADS] Filtrando leads para corretor:', user.email);
        query = query.eq('corretor', user.email);
      }
      // Para gerentes, buscar todos os leads
      else if (hasRole('gerente')) {
        console.log('🔍 [LEADS] Buscando todos os leads para gerente');
        // Buscar todos os leads (sem filtro)
      }
      // Se não tem role definido, verificar cargo do usuário
      else {
        console.log('🔍 [LEADS] Role não definido, verificando cargo:', user.cargo);
        if (user.cargo === 'gerente') {
          console.log('🔍 [LEADS] Cargo gerente, buscando todos os leads');
          // Buscar todos os leads
        } else {
          console.log('🔍 [LEADS] Cargo corretor, filtrando por email');
          query = query.eq('corretor', user.email);
        }
      }
      
      // ✅ OTIMIZAÇÃO: Timeout para evitar travamento
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      // ✅ ORDENAR por score_ia (maior primeiro), depois por created_at
      const queryPromise = query
        .order('score_ia', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      console.log('🔍 [DEBUG] Buscando leads para:', {
        userEmail: user.email,
        userRole: hasRole('gerente') ? 'gerente' : hasRole('corretor') ? 'corretor' : 'sem-role',
        query: hasRole('corretor') ? `corretor = ${user.email}` : hasRole('gerente') ? 'todos os leads' : `user_id = ${user.id}`
      });

      const { data, error } = await Promise.race([queryPromise, timeout]) as any;

      if (error) {
        console.error('❌ Error fetching leads:', error);
        throw error;
      }
      
      const leadsData = data || [];
      
      // Salvar no cache unificado
      cache.setCachedData(cacheKey, leadsData);
      
      setLeads(leadsData);
    } catch (error) {
      console.error('❌ Erro ao buscar leads:', error);
      toast({
        title: "Erro ao carregar leads",
        description: "Não foi possível carregar os leads. Tente novamente.",
        variant: "destructive"
      });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [user, rolesLoading]); // ✅ FIX: hasRole e toast REMOVIDOS (usados via closure)

  const createLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      // ✅ 1. VERIFICAR DUPLICATAS (por telefone OU email)
      if (leadData.telefone || leadData.email) {
        const conditions = [];
        if (leadData.telefone) conditions.push(`telefone.eq.${leadData.telefone}`);
        if (leadData.email) conditions.push(`email.eq.${leadData.email}`);
        
        const { data: existingLeads, error: checkError } = await supabase
          .from('leads')
          .select('id, nome, telefone, email, status, corretor')
          .or(conditions.join(','))
          .limit(5);

        if (!checkError && existingLeads && existingLeads.length > 0) {
          console.warn('⚠️ Lead similar encontrado:', existingLeads[0]);
          
          // Mostrar aviso (não bloquear, apenas avisar)
          toast({
            title: "⚠️ Possível duplicata",
            description: `Encontrado lead similar: ${existingLeads[0].nome} (${existingLeads[0].status})`,
            variant: "default",
          });
          
          // Continuar mesmo assim (gerente pode querer criar duplicata intencional)
        }
      }

      // ✅ 2. CRIAR LEAD
      const isUuid = (val?: string) =>
        !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
      
      const leadToCreate = {
        ...leadData,
        user_id: isUuid(user.id) ? user.id : null, // ✅ CORREÇÃO: Usar null se não for UUID válido
        // Para corretores, definir o corretor como o email do usuário
        corretor: hasRole('corretor') ? user.email : leadData.corretor,
      };

      const { data, error } = await supabase
        .from('leads')
        .insert([leadToCreate])
        .select()
        .single();

      if (error) throw error;
      
      // ✅ NOTIFICAÇÃO DE LEAD CRIADO (SEGURO)
      notifyLeadCreated(data);
      
      toast({
        title: "✅ Lead criado com sucesso!",
        description: `${data.nome} foi adicionado ao sistema.`
      });
      await fetchLeads(); // Recarregar leads
      return data;
    } catch (error: any) {
      console.error('Erro ao criar lead:', error);
      
      // ✅ CORREÇÃO ESPECÍFICA PARA FOREIGN KEY
      if (error.code === '23503' && error.message?.includes('user_id')) {
        console.warn('⚠️ Erro de foreign key user_id, tentando sem user_id...');
        
        // Tentar novamente sem user_id
        const leadToCreateSemUserId = { ...leadToCreate };
        delete leadToCreateSemUserId.user_id;
        
        try {
          const { data: retryData, error: retryError } = await supabase
            .from('leads')
            .insert([leadToCreateSemUserId])
            .select()
            .single();
            
          if (retryError) throw retryError;
          
          // ✅ NOTIFICAÇÃO DE LEAD CRIADO (SEGURO)
          notifyLeadCreated(retryData);
          
          toast({
            title: "✅ Lead criado com sucesso!",
            description: `${retryData.nome} foi adicionado ao sistema. (user_id omitido)`
          });
          await fetchLeads(); // Recarregar leads
          return retryData;
        } catch (retryError) {
          console.error('Erro no retry:', retryError);
          // Continuar com erro original
        }
      }
      
      // ✅ 3. MENSAGENS DE ERRO ESPECÍFICAS
      let title = "Erro ao criar lead";
      let description = "Não foi possível criar o lead. Tente novamente.";
      
      if (error.code === '23505') {
        title = "Lead duplicado";
        description = "Já existe um lead com este email ou telefone no sistema.";
      } else if (error.code === '23503') {
        title = "Erro de autenticação";
        description = "Sua sessão expirou. Faça login novamente.";
      } else if (error.code === '23502') {
        title = "Campo obrigatório faltando";
        description = "Verifique se preencheu todos os campos obrigatórios.";
      } else if (error.message?.includes('network')) {
        title = "Erro de conexão";
        description = "Verifique sua internet e tente novamente.";
      } else if (error.message) {
        description = error.message;
      }
      
      toast({
        title,
        description,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      console.log('🔄 Iniciando atualização do lead:', id, updates);
      
      // ✅ Limpar campos vazios e preparar dados para atualização
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => 
          value !== null && value !== undefined && value !== ''
        )
      );

      console.log('🧹 Dados limpos para atualização:', cleanUpdates);

      // ✅ Usar método simples do Supabase
      const { data, error } = await (supabase as any)
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
        throw new Error(error.message || 'Erro ao atualizar lead no banco de dados');
      }
      
      console.log('✅ Lead atualizado com sucesso:', data);
      
      // ✅ NOTIFICAÇÃO DE LEAD ATUALIZADO (SEGURO)
      notifyLeadUpdated(data, cleanUpdates);
      
      // ✅ Atualizar estado local imediatamente
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === id ? { ...lead, ...cleanUpdates } : lead
        )
      );
      
      toast({
        title: "✅ Lead Atualizado",
        description: `Informações foram salvas com sucesso!`
      });
      
      return data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar lead:', error);
      toast({
        title: "❌ Erro ao Atualizar",
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
        title: "Lead excluído com sucesso!",
        description: "Lead foi removido do sistema."
      });
      await fetchLeads(); // Recarregar leads
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast({
        title: "Erro ao excluir lead",
        description: "Não foi possível excluir o lead. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    // ✅ SINGLETON: Apenas 1 polling global para TODA a aplicação
    if (globalPollingActive) {
      return;
    }

    // Se não tem user ou ainda carregando roles, não fazer nada
    if (!user || rolesLoading) {
      setLoading(false);
      return;
    }

    // ✅ FIX: Verificar se já existe um interval ativo antes de criar outro
    if (globalPollingInterval) {
      clearInterval(globalPollingInterval);
    }

    // Marcar como ativo globalmente
    globalPollingActive = true;

    // ✅ Limpar interval global anterior (se existir)
    if (globalPollingInterval) {
      clearInterval(globalPollingInterval);
      globalPollingInterval = null;
    }

    let isMounted = true;

    // ✅ FIX RACE CONDITION: Função interna para evitar dependência circular
    const pollLeads = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);
        // console.log('🔍 Fetching leads for user:', user.email); // ✅ OTIMIZAÇÃO: Log removido
        
        let query = supabase.from('leads').select('*');
        
        // Para corretores, filtrar por corretor (email)
        if (hasRole('corretor')) {
          console.log('🔍 [POLLING] Filtrando leads para corretor:', user.email);
          query = query.eq('corretor', user.email);
        }
        // Para gerentes, buscar todos os leads
        else if (hasRole('gerente')) {
          console.log('🔍 [POLLING] Buscando todos os leads para gerente');
          // Buscar todos os leads (sem filtro)
        }
        // Se não tem role definido, verificar cargo do usuário
        else {
          console.log('🔍 [POLLING] Role não definido, verificando cargo:', user.cargo);
          if (user.cargo === 'gerente') {
            console.log('🔍 [POLLING] Cargo gerente, buscando todos os leads');
            // Buscar todos os leads
          } else {
            console.log('🔍 [POLLING] Cargo corretor, filtrando por email');
            query = query.eq('corretor', user.email);
          }
        }
        
        // ✅ ORDENAR por score_ia (maior primeiro), depois por created_at
      const { data, error } = await query
        .order('score_ia', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching leads:', error);
        throw error;
      }
      
      console.log('✅ [DEBUG] Leads encontrados:', {
        total: data?.length || 0,
        leads: data?.slice(0, 3).map((l: any) => ({
          nome: l.nome,
          corretor: l.corretor,
          status: l.status
        }))
      });
      
      if (isMounted) {
        setLeads(data || []);
      }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Erro ao buscar leads:', error);
          toast({
            title: "Erro ao carregar leads",
            description: "Não foi possível carregar os leads. Tente novamente.",
            variant: "destructive"
          });
          setLeads([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Fetch inicial
    pollLeads();

    // ✅ POLLING GLOBAL: Apenas 1 interval para toda aplicação
    // ✅ OTIMIZAÇÃO: 60 segundos (era 30s)
    globalPollingInterval = setInterval(() => {
      if (isMounted) {
        pollLeads();
      }
    }, 60000);

    // console.log('✅ Polling GLOBAL ativo (60s interval) - Singleton'); // ✅ OTIMIZAÇÃO: Log removido

    // Cleanup
    return () => {
      isMounted = false;
      globalPollingActive = false;
      if (globalPollingInterval) {
        clearInterval(globalPollingInterval);
        globalPollingInterval = null;
        // console.log('🧹 Polling GLOBAL removido'); // ✅ OTIMIZAÇÃO: Log removido
      }
    };
  }, [user?.id, rolesLoading]); // ✅ user?.id em vez de user (evita re-execução)

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
    refetch: () => fetchLeads(true), // ✅ FORÇAR REFRESH: Limpar cache
    getLeadsStats,
    getLeadsByStatus,
    getLeadsByPeriod,
  };
};