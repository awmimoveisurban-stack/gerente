/**
 * 🔐 Audit Manager - Sistema de Auditoria e Logs
 * 
 * Registra todas as ações críticas do sistema para auditoria
 * Implementa logs estruturados e rastreamento de atividades
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import { supabase } from '@/integrations/supabase/client';
import { SecureUser } from './security-manager';

// ✅ Tipos de eventos de auditoria
export enum AuditEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  LEAD_DELETED = 'lead_deleted',
  PERMISSION_CHANGED = 'permission_changed',
  PASSWORD_CHANGED = 'password_changed',
  SESSION_EXPIRED = 'session_expired',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_EXPORT = 'data_export',
  SYSTEM_ERROR = 'system_error',
}

// ✅ Níveis de severidade
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ✅ Interface de evento de auditoria
export interface AuditEvent {
  id?: string;
  user_id: string;
  user_email: string;
  user_cargo: string;
  event_type: AuditEventType;
  severity: AuditSeverity;
  description: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  resource_id?: string;
  resource_type?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at?: string;
}

/**
 * ✅ Gerenciador de Auditoria
 */
export class AuditManager {
  private static instance: AuditManager;
  private eventQueue: AuditEvent[] = [];
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): AuditManager {
    if (!AuditManager.instance) {
      AuditManager.instance = new AuditManager();
    }
    return AuditManager.instance;
  }

  /**
   * 🔐 Registra evento de auditoria
   */
  public async logEvent(event: Omit<AuditEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      // Adicionar metadados
      const auditEvent: AuditEvent = {
        ...event,
        id: crypto.randomUUID(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      };

      // Adicionar à fila
      this.eventQueue.push(auditEvent);

      // Processar fila
      this.processQueue();

      // Log no console para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [AUDIT]', auditEvent);
      }
    } catch (error) {
      console.error('❌ Erro ao registrar evento de auditoria:', error);
    }
  }

  /**
   * 🔐 Processa fila de eventos
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Processar em lotes de 10
      const batch = this.eventQueue.splice(0, 10);
      
      const { error } = await supabase
        .from('audit_logs')
        .insert(batch);

      if (error) {
        console.error('❌ Erro ao salvar eventos de auditoria:', error);
        // Recolocar eventos na fila
        this.eventQueue.unshift(...batch);
      }
    } catch (error) {
      console.error('❌ Erro ao processar fila de auditoria:', error);
    } finally {
      this.isProcessing = false;
      
      // Processar próximo lote se houver
      if (this.eventQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  /**
   * 🔐 Logs específicos para autenticação
   */
  public async logAuthEvent(
    user: SecureUser | null,
    eventType: AuditEventType,
    details: Record<string, any> = {},
    severity: AuditSeverity = AuditSeverity.MEDIUM
  ): Promise<void> {
    await this.logEvent({
      user_id: user?.id || 'anonymous',
      user_email: user?.email || 'anonymous',
      user_cargo: user?.cargo || 'unknown',
      event_type: eventType,
      severity,
      description: this.getEventDescription(eventType, details),
      details,
    });
  }

  /**
   * 🔐 Logs específicos para ações de usuário
   */
  public async logUserAction(
    user: SecureUser,
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any> = {},
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      user_id: user.id,
      user_email: user.email,
      user_cargo: user.cargo,
      event_type: this.mapActionToEventType(action),
      severity: AuditSeverity.LOW,
      description: `Usuário ${user.nome} executou ação: ${action}`,
      details: {
        action,
        resource_type: resourceType,
        ...details,
      },
      resource_id: resourceId,
      resource_type: resourceType,
      old_values: oldValues,
      new_values: newValues,
    });
  }

  /**
   * 🔐 Logs de erro do sistema
   */
  public async logSystemError(
    error: Error,
    context: Record<string, any> = {},
    user?: SecureUser
  ): Promise<void> {
    await this.logEvent({
      user_id: user?.id || 'system',
      user_email: user?.email || 'system',
      user_cargo: user?.cargo || 'system',
      event_type: AuditEventType.SYSTEM_ERROR,
      severity: AuditSeverity.HIGH,
      description: `Erro do sistema: ${error.message}`,
      details: {
        error_message: error.message,
        error_stack: error.stack,
        context,
      },
    });
  }

  /**
   * 🔐 Busca eventos de auditoria
   */
  public async getAuditEvents(filters: {
    user_id?: string;
    event_type?: AuditEventType;
    severity?: AuditSeverity;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AuditEvent[]> {
    try {
      let query = supabase.from('audit_logs').select('*');

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(filters.limit || 100)
        .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 100) - 1);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar eventos de auditoria:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar eventos de auditoria:', error);
      return [];
    }
  }

  /**
   * 🔐 Utilitários
   */
  private getEventDescription(eventType: AuditEventType, details: Record<string, any>): string {
    const descriptions: Record<AuditEventType, string> = {
      [AuditEventType.LOGIN_SUCCESS]: 'Login realizado com sucesso',
      [AuditEventType.LOGIN_FAILED]: 'Tentativa de login falhou',
      [AuditEventType.LOGOUT]: 'Logout realizado',
      [AuditEventType.USER_CREATED]: 'Usuário criado',
      [AuditEventType.USER_UPDATED]: 'Usuário atualizado',
      [AuditEventType.USER_DELETED]: 'Usuário deletado',
      [AuditEventType.LEAD_CREATED]: 'Lead criado',
      [AuditEventType.LEAD_UPDATED]: 'Lead atualizado',
      [AuditEventType.LEAD_DELETED]: 'Lead deletado',
      [AuditEventType.PERMISSION_CHANGED]: 'Permissões alteradas',
      [AuditEventType.PASSWORD_CHANGED]: 'Senha alterada',
      [AuditEventType.SESSION_EXPIRED]: 'Sessão expirada',
      [AuditEventType.UNAUTHORIZED_ACCESS]: 'Tentativa de acesso não autorizado',
      [AuditEventType.DATA_EXPORT]: 'Exportação de dados',
      [AuditEventType.SYSTEM_ERROR]: 'Erro do sistema',
    };

    return descriptions[eventType] || 'Evento não identificado';
  }

  private mapActionToEventType(action: string): AuditEventType {
    const mapping: Record<string, AuditEventType> = {
      'create': AuditEventType.LEAD_CREATED,
      'update': AuditEventType.LEAD_UPDATED,
      'delete': AuditEventType.LEAD_DELETED,
      'login': AuditEventType.LOGIN_SUCCESS,
      'logout': AuditEventType.LOGOUT,
    };

    return mapping[action] || AuditEventType.SYSTEM_ERROR;
  }

  private async getClientIP(): Promise<string> {
    try {
      // Em produção, isso seria obtido do servidor
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

// ✅ Instância singleton
export const auditManager = AuditManager.getInstance();

// ✅ Funções utilitárias para uso rápido
export const logAuthSuccess = (user: SecureUser) => 
  auditManager.logAuthEvent(user, AuditEventType.LOGIN_SUCCESS);

export const logAuthFailure = (email: string, reason: string) =>
  auditManager.logAuthEvent(null, AuditEventType.LOGIN_FAILED, { email, reason });

export const logUserAction = (user: SecureUser, action: string, resourceType: string, resourceId: string) =>
  auditManager.logUserAction(user, action, resourceType, resourceId);

export const logSystemError = (error: Error, context: Record<string, any> = {}) =>
  auditManager.logSystemError(error, context);


