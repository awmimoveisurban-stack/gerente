import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { LeadConversation } from '@/hooks/use-lead-conversations';
import { ContextualAIAnalyzer, ConversationContext } from '@/utils/contextual-ai-analyzer';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface LeadData {
  nome?: string;
  email?: string;
  telefone: string;
  origem?: string;
  status?: string;
  observacoes?: string;
  interesse?: string;
  cidade?: string;
  orcamento?: number;
  mensagem_inicial?: string;
  corretor?: string;
  user_id?: string;
  manager_id?: string;
  atribuido_a?: string;
  score_ia?: number;
  prioridade?: string;
  data_contato?: string;
  metadata?: Record<string, any>;
}

export interface ConversationData {
  canal: 'whatsapp' | 'email' | 'telefone' | 'site' | 'sistema' | 'indicacao';
  mensagem?: string;
  tipo?: 'entrada' | 'saida' | 'sistema' | 'atualizacao';
  origem?: string;
  metadata?: Record<string, any>;
}

export interface LeadCaptureResult {
  success: boolean;
  lead: LeadData | null;
  isNew: boolean;
  conversation?: LeadConversation | null;
  contextualAnalysis?: any; // Análise contextual da IA
  error?: string;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export const useLeadCapture = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUnifiedAuth();

  // =====================================================
  // FUNÇÃO PRINCIPAL: CAPTURAR OU ATUALIZAR LEAD
  // =====================================================
  const captureOrUpdateLead = useCallback(async (
    leadData: LeadData,
    conversationData?: ConversationData
  ): Promise<LeadCaptureResult> => {
    try {
      setLoading(true);

      // 1. VALIDAÇÃO BÁSICA
      if (!leadData.telefone) {
        throw new Error('Telefone é obrigatório para captura de lead');
      }

      // 2. BUSCAR LEAD EXISTENTE POR TELEFONE
      const { data: existingLeads, error: searchError } = await supabase
        .from('leads')
        .select('*')
        .eq('telefone', leadData.telefone)
        .limit(1);

      if (searchError) {
        console.error('Erro ao buscar lead existente:', searchError);
        throw new Error('Erro ao verificar lead existente');
      }

      const existingLead = existingLeads?.[0];

      if (existingLead) {
        // 3. LEAD EXISTENTE - ATUALIZAR COM CONTEXTO HISTÓRICO
        return await updateExistingLeadWithContext(existingLead, leadData, conversationData);
      } else {
        // 4. NOVO LEAD - CRIAR
        return await createNewLead(leadData, conversationData);
      }

    } catch (error) {
      console.error('Erro na captura de lead:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: '❌ Erro na Captura',
        description: errorMessage,
        variant: 'destructive',
      });

      return {
        success: false,
        lead: null,
        isNew: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  // =====================================================
  // ATUALIZAR LEAD EXISTENTE
  // =====================================================
  const updateExistingLead = async (
    existingLead: any,
    leadData: LeadData,
    conversationData?: ConversationData
  ): Promise<LeadCaptureResult> => {
    try {
      // Preservar dados sensíveis
      const updateData: any = {
        // Atualizar campos relevantes (usar ?? para preservar valores existentes)
        nome: leadData.nome ?? existingLead.nome,
        email: leadData.email ?? existingLead.email,
        status: leadData.status ?? existingLead.status,
        observacoes: leadData.observacoes ?? existingLead.observacoes,
        interesse: leadData.interesse ?? existingLead.interesse,
        cidade: leadData.cidade ?? existingLead.cidade,
        orcamento: leadData.orcamento ?? existingLead.orcamento,
        origem: leadData.origem ?? existingLead.origem,
        prioridade: leadData.prioridade ?? existingLead.prioridade,
        score_ia: leadData.score_ia ?? existingLead.score_ia,
        
        // Atualizar timestamps
        updated_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
        
        // Preservar dados sensíveis (NÃO atualizar)
        // user_id, manager_id, atribuido_a, created_at permanecem inalterados
      };

      // Atualizar lead
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', existingLead.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erro ao atualizar lead: ${updateError.message}`);
      }

      // Registrar nova conversa se fornecida
      let conversation = null;
      if (conversationData) {
        conversation = await createConversation(existingLead.id, conversationData);
      }

      // Log de auditoria manual (além do trigger automático)
      await logAuditAction(existingLead.id, 'update', existingLead, updatedLead);

      toast({
        title: '✅ Lead Atualizado',
        description: `Lead ${existingLead.nome || existingLead.telefone} foi atualizado com sucesso`,
      });

      return {
        success: true,
        lead: updatedLead,
        isNew: false,
        conversation,
      };

    } catch (error) {
      console.error('Erro ao atualizar lead existente:', error);
      throw error;
    }
  };

  // =====================================================
  // ATUALIZAR LEAD EXISTENTE COM CONTEXTO HISTÓRICO
  // =====================================================
  const updateExistingLeadWithContext = async (
    existingLead: any,
    leadData: LeadData,
    conversationData?: ConversationData
  ): Promise<LeadCaptureResult> => {
    try {
      // 1. BUSCAR HISTÓRICO DE CONVERSAS
      const { data: conversationHistory, error: historyError } = await supabase
        .from('lead_conversations')
        .select('*')
        .eq('lead_id', existingLead.id)
        .order('created_at', { ascending: true })
        .limit(10); // Últimas 10 mensagens

      if (historyError) {
        console.warn('Erro ao buscar histórico de conversas:', historyError);
        // Continuar sem histórico se houver erro
      }

      // 2. PREPARAR CONTEXTO PARA ANÁLISE IA
      const contextHistory: ConversationContext[] = (conversationHistory || []).map(conv => ({
        id: conv.id,
        mensagem: conv.mensagem || '',
        canal: conv.canal,
        tipo: conv.tipo,
        created_at: conv.created_at,
        metadata: conv.metadata || {}
      }));

      // 3. ANÁLISE IA COM CONTEXTO HISTÓRICO
      let contextualAnalysis = null;
      if (conversationData?.mensagem) {
        try {
          contextualAnalysis = ContextualAIAnalyzer.analyzeWithContext(
            conversationData.mensagem,
            existingLead.nome || 'Cliente',
            contextHistory
          );
          
          console.log('🤖 Análise contextual:', {
            score: contextualAnalysis.score,
            evolucao: contextualAnalysis.evolucao_interesse,
            engajamento: contextualAnalysis.engajamento_temporal,
            mensagensAnalisadas: contextualAnalysis.mensagens_analisadas,
            alertas: contextualAnalysis.alertas_contexto
          });
        } catch (aiError) {
          console.warn('Erro na análise contextual:', aiError);
          // Continuar sem análise contextual
        }
      }

      // 4. PREPARAR DADOS DE ATUALIZAÇÃO COM CONTEXTO
      const updateData: any = {
        // Campos básicos (usar ?? para preservar valores existentes)
        nome: leadData.nome ?? existingLead.nome,
        email: leadData.email ?? existingLead.email,
        status: leadData.status ?? existingLead.status,
        interesse: leadData.interesse ?? existingLead.interesse,
        cidade: leadData.cidade ?? existingLead.cidade,
        orcamento: leadData.orcamento ?? existingLead.orcamento,
        origem: leadData.origem ?? existingLead.origem,
        
        // Timestamps
        updated_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
        
        // Preservar dados sensíveis (NÃO atualizar)
        // user_id, manager_id, atribuido_a, created_at permanecem inalterados
      };

      // 5. APLICAR ANÁLISE CONTEXTUAL SE DISPONÍVEL
      if (contextualAnalysis) {
        updateData.score_ia = contextualAnalysis.score;
        updateData.prioridade = contextualAnalysis.prioridade;
        
        // Atualizar observações com contexto
        const observacoesContextuais = [
          existingLead.observacoes || '',
          `[CONTEXTO] ${contextualAnalysis.contexto_completo}`,
          `[EVOLUÇÃO] ${contextualAnalysis.evolucao_interesse.toUpperCase()}`,
          `[ENGAJAMENTO] ${contextualAnalysis.engajamento_temporal.toUpperCase()}`,
          `[MENSAGENS] ${contextualAnalysis.mensagens_analisadas} analisadas`
        ].filter(Boolean).join('\n');
        
        updateData.observacoes = observacoesContextuais;
        
        // Adicionar alertas se houver
        if (contextualAnalysis.alertas_contexto.length > 0) {
          updateData.observacoes += `\n[ALERTAS] ${contextualAnalysis.alertas_contexto.join('; ')}`;
        }
      } else {
        // Fallback para análise simples se contextual falhar
        updateData.score_ia = leadData.score_ia ?? existingLead.score_ia;
        updateData.prioridade = leadData.prioridade ?? existingLead.prioridade;
        updateData.observacoes = leadData.observacoes ?? existingLead.observacoes;
      }

      // 6. ATUALIZAR LEAD
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', existingLead.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erro ao atualizar lead: ${updateError.message}`);
      }

      // 7. REGISTRAR NOVA CONVERSA
      let conversation = null;
      if (conversationData) {
        conversation = await createConversation(existingLead.id, conversationData);
      }

      // 8. LOG DE AUDITORIA
      await logAuditAction(existingLead.id, 'update', existingLead, updatedLead);

      // 9. NOTIFICAÇÃO COM CONTEXTO
      const contextoInfo = contextualAnalysis ? 
        ` (${contextualAnalysis.evolucao_interesse}, ${contextualAnalysis.mensagens_analisadas} msgs)` : '';
      
      toast({
        title: '✅ Lead Atualizado com Contexto',
        description: `Lead ${existingLead.nome || existingLead.telefone} foi atualizado${contextoInfo}`,
      });

      return {
        success: true,
        lead: updatedLead,
        isNew: false,
        conversation,
        contextualAnalysis, // Retornar análise contextual
      };

    } catch (error) {
      console.error('Erro ao atualizar lead com contexto:', error);
      throw error;
    }
  };

  // =====================================================
  // CRIAR NOVO LEAD
  // =====================================================
  const createNewLead = async (
    leadData: LeadData,
    conversationData?: ConversationData
  ): Promise<LeadCaptureResult> => {
    try {
      // Preparar dados para inserção
      const newLeadData: any = {
        nome: leadData.nome,
        email: leadData.email,
        telefone: leadData.telefone,
        origem: leadData.origem || 'manual',
        status: leadData.status || 'novo',
        observacoes: leadData.observacoes,
        interesse: leadData.interesse,
        cidade: leadData.cidade,
        orcamento: leadData.orcamento,
        mensagem_inicial: leadData.mensagem_inicial,
        corretor: leadData.corretor,
        user_id: leadData.user_id || user?.id,
        manager_id: leadData.manager_id,
        atribuido_a: leadData.atribuido_a || user?.id,
        score_ia: leadData.score_ia || 0,
        prioridade: leadData.prioridade || 'media',
        data_contato: leadData.data_contato || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
      };

      // Criar lead
      const { data: newLead, error: createError } = await supabase
        .from('leads')
        .insert(newLeadData)
        .select()
        .single();

      if (createError) {
        throw new Error(`Erro ao criar lead: ${createError.message}`);
      }

      // Registrar primeira conversa se fornecida
      let conversation = null;
      if (conversationData) {
        conversation = await createConversation(newLead.id, conversationData);
      }

      // Log de auditoria manual (além do trigger automático)
      await logAuditAction(newLead.id, 'create', null, newLead);

      toast({
        title: '✅ Novo Lead Criado',
        description: `Lead ${newLead.nome || newLead.telefone} foi criado com sucesso`,
      });

      return {
        success: true,
        lead: newLead,
        isNew: true,
        conversation,
      };

    } catch (error) {
      console.error('Erro ao criar novo lead:', error);
      throw error;
    }
  };

  // =====================================================
  // CRIAR CONVERSA
  // =====================================================
  const createConversation = async (
    leadId: string,
    conversationData: ConversationData
  ): Promise<any> => {
    try {
      const conversationPayload = {
        lead_id: leadId,
        canal: conversationData.canal,
        mensagem: conversationData.mensagem,
        autor_id: user?.id || null,
        tipo: conversationData.tipo || 'entrada',
        origem: conversationData.origem || 'manual',
        metadata: conversationData.metadata || {},
        created_at: new Date().toISOString(),
      };

      const { data: conversation, error } = await supabase
        .from('lead_conversations')
        .insert(conversationPayload)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar conversa:', error);
        // Não falhar a operação principal por causa da conversa
        return null;
      }

      return conversation;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      return null;
    }
  };

  // =====================================================
  // LOG DE AUDITORIA MANUAL
  // =====================================================
  const logAuditAction = async (
    leadId: string,
    action: string,
    oldValues: any,
    newValues: any
  ): Promise<void> => {
    try {
      const auditPayload = {
        lead_id: leadId,
        action,
        old_values: oldValues || {},
        new_values: newValues || {},
        user_id: user?.id || null,
        user_email: user?.email || null,
        metadata: {
          source: 'manual',
          timestamp: new Date().toISOString(),
        },
      };

      await supabase
        .from('lead_audit_log')
        .insert(auditPayload);

    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
      // Não falhar a operação principal por causa da auditoria
    }
  };

  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================

  // Buscar lead por telefone
  const findLeadByPhone = useCallback(async (telefone: string) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('telefone', telefone)
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Erro ao buscar lead por telefone:', error);
      return null;
    }
  }, []);

  // Buscar conversas de um lead
  const getLeadConversations = useCallback(async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('lead_conversations')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar conversas do lead:', error);
      return [];
    }
  }, []);

  // Buscar histórico de auditoria de um lead
  const getLeadAuditHistory = useCallback(async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('lead_audit_log')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de auditoria:', error);
      return [];
    }
  }, []);

  // =====================================================
  // RETORNO
  // =====================================================
  return {
    // Função principal
    captureOrUpdateLead,
    
    // Funções auxiliares
    findLeadByPhone,
    getLeadConversations,
    getLeadAuditHistory,
    
    // Estados
    loading,
  };
};
