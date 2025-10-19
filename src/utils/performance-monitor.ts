/**
 * 📊 SISTEMA DE MONITORAMENTO DE PERFORMANCE
 * 
 * Monitora performance de APIs, componentes e operações
 * Coleta métricas e gera relatórios
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  duration: number;
  timestamp: string;
  category: 'api' | 'component' | 'database' | 'external' | 'ui';
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  total: number;
  average: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  slowest: PerformanceMetric[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 10000;
  private slowThreshold = 1000; // 1 segundo

  // Registrar métrica
  public recordMetric(
    name: string,
    duration: number,
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ): PerformanceMetric {
    const metric: PerformanceMetric = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      duration,
      timestamp: new Date().toISOString(),
      category,
      metadata
    };

    this.metrics.push(metric);

    // Limitar número de métricas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Alertar sobre operações lentas
    if (duration > this.slowThreshold) {
      this.alertSlowOperation(metric);
    }

    return metric;
  }

  // Alertar sobre operações lentas
  private alertSlowOperation(metric: PerformanceMetric): void {
    const emoji = {
      api: '🌐',
      component: '⚛️',
      database: '🗄️',
      external: '🔗',
      ui: '🎨'
    }[metric.category];

    console.warn(`${emoji} SLOW OPERATION DETECTED:`, {
      name: metric.name,
      duration: `${metric.duration}ms`,
      category: metric.category,
      threshold: `${this.slowThreshold}ms`,
      metadata: metric.metadata
    });
  }

  // Obter estatísticas
  public getStats(filter?: {
    name?: string;
    category?: PerformanceMetric['category'];
    timeRange?: { start: Date; end: Date };
  }): PerformanceStats {
    let filteredMetrics = this.metrics;

    // Aplicar filtros
    if (filter) {
      if (filter.name) {
        filteredMetrics = filteredMetrics.filter(m => m.name === filter.name);
      }
      
      if (filter.category) {
        filteredMetrics = filteredMetrics.filter(m => m.category === filter.category);
      }
      
      if (filter.timeRange) {
        const { start, end } = filter.timeRange;
        filteredMetrics = filteredMetrics.filter(m => {
          const timestamp = new Date(m.timestamp);
          return timestamp >= start && timestamp <= end;
        });
      }
    }

    if (filteredMetrics.length === 0) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        slowest: []
      };
    }

    const durations = filteredMetrics.map(m => m.duration).sort((a, b) => a - b);
    const total = durations.reduce((sum, d) => sum + d, 0);
    const average = total / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];

    // Calcular percentis
    const p50Index = Math.floor(durations.length * 0.5);
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    const p50 = durations[p50Index] || 0;
    const p95 = durations[p95Index] || 0;
    const p99 = durations[p99Index] || 0;

    // Top 10 operações mais lentas
    const slowest = filteredMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      total: filteredMetrics.length,
      average: Math.round(average * 100) / 100,
      min,
      max,
      p50,
      p95,
      p99,
      slowest
    };
  }

  // Obter métricas por categoria
  public getMetricsByCategory(): Record<string, PerformanceStats> {
    const categories = [...new Set(this.metrics.map(m => m.category))];
    const result: Record<string, PerformanceStats> = {};

    for (const category of categories) {
      result[category] = this.getStats({ category });
    }

    return result;
  }

  // Obter métricas recentes
  public getRecentMetrics(limit = 50): PerformanceMetric[] {
    return this.metrics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Limpar métricas antigas
  public cleanupOldMetrics(maxAgeHours = 24): number {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const initialLength = this.metrics.length;
    
    this.metrics = this.metrics.filter(m => new Date(m.timestamp) > cutoffTime);
    
    const cleanedCount = initialLength - this.metrics.length;
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old performance metrics`);
    }
    
    return cleanedCount;
  }

  // Definir threshold para operações lentas
  public setSlowThreshold(thresholdMs: number): void {
    this.slowThreshold = thresholdMs;
    console.log(`⏱️ Slow operation threshold set to ${thresholdMs}ms`);
  }
}

// Instância global do monitor de performance
export const performanceMonitor = new PerformanceMonitor();

// Decorator para medir performance de funções
export const measurePerformance = (
  name: string,
  category: PerformanceMetric['category'] = 'api'
) => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - startTime;
        
        performanceMonitor.recordMetric(
          `${name || propertyKey}`,
          duration,
          category,
          { args: args.length }
        );
        
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        performanceMonitor.recordMetric(
          `${name || propertyKey}_error`,
          duration,
          category,
          { 
            args: args.length,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
        
        throw error;
      }
    };

    return descriptor;
  };
};

// Hook para medir performance de componentes React
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  return {
    recordRender: (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      performanceMonitor.recordMetric(
        `component_${componentName}`,
        duration,
        'component',
        metadata
      );
    },
    
    recordInteraction: (interactionName: string, metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      performanceMonitor.recordMetric(
        `interaction_${componentName}_${interactionName}`,
        duration,
        'ui',
        metadata
      );
    }
  };
};

// Utilitário para medir operações de banco de dados
export const measureDatabaseOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric(
      `db_${operationName}`,
      duration,
      'database',
      { success: true }
    );
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric(
      `db_${operationName}_error`,
      duration,
      'database',
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    throw error;
  }
};

// Utilitário para medir operações de API externa
export const measureExternalAPI = async <T>(
  apiName: string,
  operation: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric(
      `api_${apiName}`,
      duration,
      'external',
      { success: true }
    );
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    performanceMonitor.recordMetric(
      `api_${apiName}_error`,
      duration,
      'external',
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );
    
    throw error;
  }
};

// Limpeza automática de métricas antigas
setInterval(() => {
  performanceMonitor.cleanupOldMetrics();
}, 60 * 60 * 1000); // A cada hora




