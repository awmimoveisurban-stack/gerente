/**
 * 🚨 SISTEMA DE TRATAMENTO DE ERROS GLOBAL
 * 
 * Sistema centralizado para tratamento de erros
 * Logs, notificações e recuperação automática
 */

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  url?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'database' | 'api' | 'whatsapp' | 'ai' | 'validation' | 'system';
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

class ErrorHandler {
  private errors: Map<string, ErrorReport> = new Map();
  private maxErrors = 1000;

  // Categorizar erros
  private categorizeError(error: Error): ErrorContext['category'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return 'auth';
    }
    
    if (message.includes('supabase') || message.includes('database') || message.includes('sql')) {
      return 'database';
    }
    
    if (message.includes('whatsapp') || message.includes('evolution')) {
      return 'whatsapp';
    }
    
    if (message.includes('claude') || message.includes('ai') || message.includes('anthropic')) {
      return 'ai';
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    
    return 'system';
  }

  // Determinar severidade
  private determineSeverity(error: Error, category: ErrorContext['category']): ErrorContext['severity'] {
    const message = error.message.toLowerCase();
    
    // Erros críticos
    if (
      message.includes('database connection') ||
      message.includes('memory') ||
      message.includes('disk space') ||
      category === 'auth' && message.includes('token')
    ) {
      return 'critical';
    }
    
    // Erros altos
    if (
      message.includes('timeout') ||
      message.includes('rate limit') ||
      category === 'whatsapp' ||
      category === 'ai'
    ) {
      return 'high';
    }
    
    // Erros médios
    if (
      message.includes('validation') ||
      message.includes('not found') ||
      category === 'api'
    ) {
      return 'medium';
    }
    
    return 'low';
  }

  // Gerar ID único para erro
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Registrar erro
  public reportError(
    error: Error,
    context: Partial<ErrorContext> = {}
  ): ErrorReport {
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(error, category);
    const errorId = this.generateErrorId();

    const errorReport: ErrorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      context: {
        timestamp: new Date().toISOString(),
        severity,
        category,
        ...context
      },
      resolved: false,
      createdAt: new Date().toISOString()
    };

    // Armazenar erro
    this.errors.set(errorId, errorReport);

    // Limitar número de erros armazenados
    if (this.errors.size > this.maxErrors) {
      const oldestError = Array.from(this.errors.entries())[0];
      this.errors.delete(oldestError[0]);
    }

    // Log baseado na severidade
    this.logError(errorReport);

    // Notificar erros críticos
    if (severity === 'critical') {
      this.notifyCriticalError(errorReport);
    }

    return errorReport;
  }

  // Log de erro
  private logError(errorReport: ErrorReport): void {
    const { id, message, context } = errorReport;
    const emoji = {
      low: '⚠️',
      medium: '🔶',
      high: '🔴',
      critical: '🚨'
    }[context.severity];

    console.error(`${emoji} [${context.severity.toUpperCase()}] ${context.category.toUpperCase()}:`, {
      id,
      message,
      timestamp: context.timestamp,
      userId: context.userId,
      requestId: context.requestId,
      url: context.url
    });

    // Log detalhado para erros críticos
    if (context.severity === 'critical') {
      console.error('🔍 Stack Trace:', errorReport.stack);
    }
  }

  // Notificar erros críticos
  private notifyCriticalError(errorReport: ErrorReport): void {
    // Aqui você implementaria notificações (email, Slack, etc.)
    console.error('🚨 CRITICAL ERROR DETECTED - Immediate attention required!');
    console.error('Error ID:', errorReport.id);
    console.error('Message:', errorReport.message);
    console.error('Context:', errorReport.context);
  }

  // Marcar erro como resolvido
  public resolveError(errorId: string): boolean {
    const error = this.errors.get(errorId);
    if (error && !error.resolved) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
      console.log(`✅ Error ${errorId} marked as resolved`);
      return true;
    }
    return false;
  }

  // Obter estatísticas de erros
  public getErrorStats(): {
    total: number;
    unresolved: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: ErrorReport[];
  } {
    const errors = Array.from(this.errors.values());
    const unresolved = errors.filter(e => !e.resolved);
    
    const byCategory = errors.reduce((acc, error) => {
      acc[error.context.category] = (acc[error.context.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = errors.reduce((acc, error) => {
      acc[error.context.severity] = (acc[error.context.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recent = errors
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      total: errors.length,
      unresolved: unresolved.length,
      byCategory,
      bySeverity,
      recent
    };
  }

  // Obter erros não resolvidos
  public getUnresolvedErrors(): ErrorReport[] {
    return Array.from(this.errors.values()).filter(e => !e.resolved);
  }

  // Limpar erros antigos (mais de 24 horas)
  public cleanupOldErrors(): number {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [id, error] of this.errors.entries()) {
      if (new Date(error.createdAt) < cutoffTime && error.resolved) {
        this.errors.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old errors`);
    }

    return cleanedCount;
  }

  // Auto-recuperação para erros conhecidos
  public attemptAutoRecovery(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Recuperação para erros de conexão do Supabase
    if (message.includes('supabase') && message.includes('connection')) {
      console.log('🔄 Attempting Supabase connection recovery...');
      // Implementar lógica de reconexão
      return true;
    }

    // Recuperação para erros de rate limit
    if (message.includes('rate limit')) {
      console.log('⏳ Rate limit detected, waiting before retry...');
      // Implementar delay e retry
      return true;
    }

    // Recuperação para erros de WhatsApp
    if (message.includes('whatsapp') && message.includes('disconnected')) {
      console.log('📱 Attempting WhatsApp reconnection...');
      // Implementar reconexão do WhatsApp
      return true;
    }

    return false;
  }
}

// Instância global do error handler
export const errorHandler = new ErrorHandler();

// Função de conveniência para reportar erros
export const reportError = (
  error: Error,
  context?: Partial<ErrorContext>
): ErrorReport => {
  return errorHandler.reportError(error, context);
};

// Wrapper para funções async
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Partial<ErrorContext>
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      reportError(error as Error, context);
      
      // Tentar auto-recuperação
      if (errorHandler.attemptAutoRecovery(error as Error)) {
        console.log('✅ Auto-recovery attempted');
      }
      
      return null;
    }
  };
};

// Wrapper para funções síncronas
export const withErrorHandlingSync = <T extends any[], R>(
  fn: (...args: T) => R,
  context?: Partial<ErrorContext>
) => {
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      reportError(error as Error, context);
      return null;
    }
  };
};

// Limpeza automática de erros antigos
setInterval(() => {
  errorHandler.cleanupOldErrors();
}, 60 * 60 * 1000); // A cada hora




