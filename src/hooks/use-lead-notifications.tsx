/**
 * 🔔 Hook de Integração com Leads
 * 
 * Integração segura com o sistema de leads existente
 * Não modifica funcionalidades atuais, apenas adiciona notificações
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { createLogger } from '@/utils/structured-logger';

const logger = createLogger('LeadNotifications');

// ============================================================================
// HOOK DE INTEGRAÇÃO COM LEADS
// ============================================================================

export const useLeadNotifications = () => {
  const { notifyNewLead, notifySystemAlert } = useNotifications();
  const processedLeadsRef = useRef<Set<string>>(new Set());

  // ============================================================================
  // FUNÇÃO PARA NOTIFICAR NOVO LEAD
  // ============================================================================

  const notifyLeadCreated = (leadData: any) => {
    try {
      // Evitar notificações duplicadas
      const leadId = leadData.id || `${leadData.telefone}_${leadData.nome}`;
      
      if (processedLeadsRef.current.has(leadId)) {
        logger.debug('Lead já processado, ignorando notificação', { leadId });
        return;
      }

      processedLeadsRef.current.add(leadId);

      // Determinar prioridade baseada no score da IA
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
      
      if (leadData.score_ia >= 90) {
        priority = 'urgent';
      } else if (leadData.score_ia >= 75) {
        priority = 'high';
      } else if (leadData.score_ia >= 50) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      // Criar mensagem personalizada
      let message = `${leadData.nome}`;
      
      if (leadData.score_ia) {
        message += ` - Score IA: ${leadData.score_ia}/100`;
      }
      
      if (leadData.origem) {
        message += ` - Origem: ${leadData.origem}`;
      }
      
      if (leadData.prioridade) {
        message += ` - Prioridade: ${leadData.prioridade}`;
      }

      // Notificar
      notifyNewLead({
        ...leadData,
        priority,
        message,
      });

      logger.info('Notificação de lead criada', {
        leadId,
        nome: leadData.nome,
        score: leadData.score_ia,
        priority,
        origem: leadData.origem,
      });

    } catch (error) {
      logger.error('Erro ao notificar lead criado', { error, leadData });
    }
  };

  // ============================================================================
  // FUNÇÃO PARA NOTIFICAR LEAD ATUALIZADO
  // ============================================================================

  const notifyLeadUpdated = (leadData: any, changes: any) => {
    try {
      // Só notificar mudanças importantes
      const importantChanges = [
        'status',
        'score_ia',
        'prioridade',
        'corretor',
        'valor_interesse'
      ];

      const hasImportantChange = importantChanges.some(
        field => changes[field] !== undefined
      );

      if (!hasImportantChange) {
        logger.debug('Mudança não importante, ignorando notificação', { changes });
        return;
      }

      let message = `${leadData.nome} - `;
      
      if (changes.status) {
        message += `Status: ${changes.status}`;
      } else if (changes.score_ia) {
        message += `Score IA: ${changes.score_ia}/100`;
      } else if (changes.prioridade) {
        message += `Prioridade: ${changes.prioridade}`;
      } else if (changes.corretor) {
        message += `Atribuído a: ${changes.corretor}`;
      }

      notifySystemAlert(
        '📝 Lead Atualizado',
        message,
        'medium'
      );

      logger.info('Notificação de lead atualizado', {
        leadId: leadData.id,
        nome: leadData.nome,
        changes: Object.keys(changes),
      });

    } catch (error) {
      logger.error('Erro ao notificar lead atualizado', { error, leadData, changes });
    }
  };

  // ============================================================================
  // FUNÇÃO PARA NOTIFICAR LEAD URGENTE
  // ============================================================================

  const notifyUrgentLead = (leadData: any, reason: string) => {
    try {
      notifySystemAlert(
        '🚨 Lead Urgente',
        `${leadData.nome} - ${reason}`,
        'urgent'
      );

      logger.info('Notificação de lead urgente', {
        leadId: leadData.id,
        nome: leadData.nome,
        reason,
      });

    } catch (error) {
      logger.error('Erro ao notificar lead urgente', { error, leadData, reason });
    }
  };

  // ============================================================================
  // FUNÇÃO PARA NOTIFICAR META ATINGIDA
  // ============================================================================

  const notifyGoalAchieved = (goal: string, value: number, target: number) => {
    try {
      notifySystemAlert(
        '🎯 Meta Atingida!',
        `${goal}: ${value}/${target} (${Math.round((value/target)*100)}%)`,
        'high'
      );

      logger.info('Notificação de meta atingida', {
        goal,
        value,
        target,
        percentage: Math.round((value/target)*100),
      });

    } catch (error) {
      logger.error('Erro ao notificar meta atingida', { error, goal, value, target });
    }
  };

  // ============================================================================
  // FUNÇÃO PARA NOTIFICAR ERRO NO SISTEMA
  // ============================================================================

  const notifySystemError = (error: any, context: string) => {
    try {
      notifySystemAlert(
        '⚠️ Erro no Sistema',
        `${context}: ${error.message || 'Erro desconhecido'}`,
        'urgent'
      );

      logger.error('Notificação de erro do sistema', {
        error: error.message,
        context,
        stack: error.stack,
      });

    } catch (notifyError) {
      logger.error('Erro ao notificar erro do sistema', { 
        originalError: error, 
        notifyError 
      });
    }
  };

  // ============================================================================
  // LIMPEZA PERIÓDICA
  // ============================================================================

  useEffect(() => {
    // Limpar leads processados a cada hora para evitar acúmulo de memória
    const cleanupInterval = setInterval(() => {
      processedLeadsRef.current.clear();
      logger.debug('Limpeza periódica de leads processados');
    }, 60 * 60 * 1000); // 1 hora

    return () => clearInterval(cleanupInterval);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    notifyLeadCreated,
    notifyLeadUpdated,
    notifyUrgentLead,
    notifyGoalAchieved,
    notifySystemError,
  };
};
