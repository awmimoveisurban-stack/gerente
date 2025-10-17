/**
 * Logger estruturado para monitoramento e debugging
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// ✅ OTIMIZAÇÃO: Modo production (só errors e warnings críticos)
const isProduction = import.meta.env.PROD;
const LOG_LEVEL = isProduction ? 'error' : 'debug';

const logLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return logLevelPriority[level] >= logLevelPriority[LOG_LEVEL as LogLevel];
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

/**
 * Sanitiza dados sensíveis antes de logar
 */
function sanitizeData(data: any): any {
  if (!data) return data;

  // Se for string, retornar como está
  if (typeof data !== 'object') return data;

  // Se for array, sanitizar cada item
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  // Se for objeto, sanitizar propriedades sensíveis
  const sanitized = { ...data };

  const sensitiveKeys = [
    'apikey',
    'api_key',
    'token',
    'instanceToken',
    'instance_token',
    'password',
    'secret',
    'authorization',
  ];

  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Logger estruturado
 */
export class StructuredLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: any) {
    // ✅ OTIMIZAÇÃO: Pular logs que não atendem o nível mínimo
    if (!shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data: sanitizeData(data),
    };

    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
    };

    const logFn =
      level === 'error'
        ? console.error
        : level === 'warn'
          ? console.warn
          : console.log;

    logFn(
      `${emoji[level]} [${entry.timestamp}] [${entry.context}] ${message}`,
      data ? sanitizeData(data) : ''
    );

    // TODO: Enviar para serviço de logs externo em produção
    // if (level === 'error') {
    //   sendToLogService(entry);
    // }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  /**
   * Log de transição de estado
   */
  stateTransition(from: string, to: string, data?: any) {
    this.info(`Estado: ${from} → ${to}`, data);
  }

  /**
   * Log de chamada de API
   */
  apiCall(method: string, url: string, status?: number, data?: any) {
    const message = status
      ? `API ${method} ${url} → ${status}`
      : `API ${method} ${url}`;

    if (status && status >= 400) {
      this.error(message, data);
    } else {
      this.info(message, data);
    }
  }
}

/**
 * Factory para criar loggers
 */
export function createLogger(context: string): StructuredLogger {
  return new StructuredLogger(context);
}
