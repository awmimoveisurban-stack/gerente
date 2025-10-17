/**
 * Debounce function
 * Aguarda o usuário parar de digitar antes de executar
 *
 * @param func - Função a ser executada
 * @param wait - Tempo de espera em ms (padrão: 300ms)
 * @returns Função debounced
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * Executa no máximo uma vez a cada X ms
 *
 * @param func - Função a ser executada
 * @param limit - Intervalo mínimo em ms (padrão: 1000ms)
 * @returns Função throttled
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit = 1000
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}



