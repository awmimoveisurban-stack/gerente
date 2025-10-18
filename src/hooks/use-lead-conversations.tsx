import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface LeadConversation {
  id: string;
  lead_id: string;
  canal: 'whatsapp' | 'email' | 'telefone' | 'site' | 'sistema' | 'indicacao';
  mensagem?: string;
  autor_id?: string;
  autor_nome?: string;
  tipo: 'entrada' | 'saida' | 'sistema' | 'atualizacao';
  origem: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ConversationFilters {
  canal?: string;
  tipo?: string;
  autor_id?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ConversationStats {
  total: number;
  porCanal: Record<string, number>;
  porTipo: Record<string, number>;
  ultimaConversa?: string;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export const useLeadConversations = (leadId?: string) => {
  const [conversations, setConversations] = useState<LeadConversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUnifiedAuth();

  // =====================================================
  // BUSCAR CONVERSAS DE UM LEAD
  // =====================================================
  const fetchConversations = useCallback(async (
    targetLeadId?: string,
    filters?: ConversationFilters
  ) => {
    try {
      setLoading(true);
      const leadIdToUse = targetLeadId || leadId;
      
      if (!leadIdToUse) {
        setConversations([]);
        return;
      }

      let query = supabase
        .from('lead_conversations')
        .select(`
          *,
          autor:profiles!lead_conversations_autor_id_fkey(nome, email)
        `)
        .eq('lead_id', leadIdToUse)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.canal) {
        query = query.eq('canal', filters.canal);
      }
      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters?.autor_id) {
        query = query.eq('autor_id', filters.autor_id);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar conversas:', error);
        throw new Error('Erro ao carregar conversas');
      }

      // Processar dados para incluir nome do autor
      const processedConversations = (data || []).map(conv => ({
        ...conv,
        autor_nome: conv.autor?.nome || 'Sistema',
      }));

      setConversations(processedConversations);
      
      // Calcular estatísticas
      calculateStats(processedConversations);

    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      toast({
        title: '❌ Erro ao Carregar Conversas',
        description: 'Não foi possível carregar o histórico de conversas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [leadId, toast]);

  // =====================================================
  // ADICIONAR NOVA CONVERSA
  // =====================================================
  const addConversation = useCallback(async (
    targetLeadId: string,
    conversationData: {
      canal: 'whatsapp' | 'email' | 'telefone' | 'site' | 'sistema' | 'indicacao';
      mensagem?: string;
      tipo?: 'entrada' | 'saida' | 'sistema' | 'atualizacao';
      origem?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    try {
      const conversationPayload = {
        lead_id: targetLeadId,
        canal: conversationData.canal,
        mensagem: conversationData.mensagem,
        autor_id: user?.id || null,
        tipo: conversationData.tipo || 'entrada',
        origem: conversationData.origem || 'manual',
        metadata: conversationData.metadata || {},
        created_at: new Date().toISOString(),
      };

      const { data: newConversation, error } = await supabase
        .from('lead_conversations')
        .insert(conversationPayload)
        .select(`
          *,
          autor:profiles!lead_conversations_autor_id_fkey(nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao adicionar conversa: ${error.message}`);
      }

      // Atualizar lista local
      const processedConversation = {
        ...newConversation,
        autor_nome: newConversation.autor?.nome || 'Sistema',
      };

      setConversations(prev => [processedConversation, ...prev]);
      
      // Recalcular estatísticas
      const updatedConversations = [processedConversation, ...conversations];
      calculateStats(updatedConversations);

      toast({
        title: '✅ Conversa Adicionada',
        description: 'Nova conversa registrada com sucesso',
      });

      return newConversation;

    } catch (error) {
      console.error('Erro ao adicionar conversa:', error);
      toast({
        title: '❌ Erro ao Adicionar Conversa',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, conversations, toast]);

  // =====================================================
  // ATUALIZAR CONVERSA EXISTENTE
  // =====================================================
  const updateConversation = useCallback(async (
    conversationId: string,
    updateData: {
      mensagem?: string;
      tipo?: 'entrada' | 'saida' | 'sistema' | 'atualizacao';
      metadata?: Record<string, any>;
    }
  ) => {
    try {
      const { data: updatedConversation, error } = await supabase
        .from('lead_conversations')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .select(`
          *,
          autor:profiles!lead_conversations_autor_id_fkey(nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar conversa: ${error.message}`);
      }

      // Atualizar lista local
      const processedConversation = {
        ...updatedConversation,
        autor_nome: updatedConversation.autor?.nome || 'Sistema',
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? processedConversation : conv
        )
      );

      toast({
        title: '✅ Conversa Atualizada',
        description: 'Conversa atualizada com sucesso',
      });

      return updatedConversation;

    } catch (error) {
      console.error('Erro ao atualizar conversa:', error);
      toast({
        title: '❌ Erro ao Atualizar Conversa',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // =====================================================
  // EXCLUIR CONVERSA
  // =====================================================
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('lead_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) {
        throw new Error(`Erro ao excluir conversa: ${error.message}`);
      }

      // Atualizar lista local
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      toast({
        title: '✅ Conversa Excluída',
        description: 'Conversa excluída com sucesso',
      });

    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
      toast({
        title: '❌ Erro ao Excluir Conversa',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // =====================================================
  // CALCULAR ESTATÍSTICAS
  // =====================================================
  const calculateStats = useCallback((conversationsList: LeadConversation[]) => {
    const stats: ConversationStats = {
      total: conversationsList.length,
      porCanal: {},
      porTipo: {},
      ultimaConversa: conversationsList[0]?.created_at,
    };

    // Contar por canal
    conversationsList.forEach(conv => {
      stats.porCanal[conv.canal] = (stats.porCanal[conv.canal] || 0) + 1;
      stats.porTipo[conv.tipo] = (stats.porTipo[conv.tipo] || 0) + 1;
    });

    setStats(stats);
  }, []);

  // =====================================================
  // BUSCAR CONVERSAS POR FILTROS
  // =====================================================
  const searchConversations = useCallback(async (filters: ConversationFilters) => {
    await fetchConversations(leadId, filters);
  }, [fetchConversations, leadId]);

  // =====================================================
  // BUSCAR TODAS AS CONVERSAS (para gerentes)
  // =====================================================
  const fetchAllConversations = useCallback(async (filters?: ConversationFilters) => {
    try {
      setLoading(true);

      let query = supabase
        .from('lead_conversations')
        .select(`
          *,
          autor:profiles!lead_conversations_autor_id_fkey(nome, email),
          lead:leads!lead_conversations_lead_id_fkey(nome, telefone, email)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.canal) {
        query = query.eq('canal', filters.canal);
      }
      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters?.autor_id) {
        query = query.eq('autor_id', filters.autor_id);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error('Erro ao carregar todas as conversas');
      }

      const processedConversations = (data || []).map(conv => ({
        ...conv,
        autor_nome: conv.autor?.nome || 'Sistema',
      }));

      setConversations(processedConversations);
      calculateStats(processedConversations);

    } catch (error) {
      console.error('Erro ao buscar todas as conversas:', error);
      toast({
        title: '❌ Erro ao Carregar Conversas',
        description: 'Não foi possível carregar as conversas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, calculateStats]);

  // =====================================================
  // EFFECTS
  // =====================================================
  useEffect(() => {
    if (leadId) {
      fetchConversations();
    }
  }, [leadId, fetchConversations]);

  // =====================================================
  // RETORNO
  // =====================================================
  return {
    // Dados
    conversations,
    stats,
    loading,
    
    // Ações
    fetchConversations,
    addConversation,
    updateConversation,
    deleteConversation,
    searchConversations,
    fetchAllConversations,
    
    // Utilitários
    calculateStats,
  };
};
