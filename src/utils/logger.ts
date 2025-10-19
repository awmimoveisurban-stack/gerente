/**
 * Logger Condicional
 * Mostra logs apenas em desenvolvimento
 * Silencioso em produção (performance)
 */

const isDev = import.meta.env.DEV;
const isDebugMode = import.meta.env.VITE_DEBUG === 'true';

export const logger = {
  /**
   * Debug - Apenas em DEV com VITE_DEBUG=true
   */
  debug: (...args: any[]) => {
    if (isDev && isDebugMode) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info - Apenas em DEV
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Warn - Sempre (importante)
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error - Sempre (crítico)
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Dados sensíveis - Mascara em produção
   */
  sensitive: (label: string, data: any) => {
    if (isDev) {
      const masked =
        typeof data === 'string'
          ? data.substring(0, 4) + '***' + data.substring(data.length - 4)
          : '[MASKED]';
      console.log(`[SENSITIVE] ${label}:`, masked);
    }
  },

  /**
   * Performance - Medições
   */
  perf: (label: string, startTime: number) => {
    if (isDev) {
      const duration = performance.now() - startTime;
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
    }
  },
};

// Export default para compatibilidade
export default logger;




