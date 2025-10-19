import { useRef, useCallback } from 'react';

// 🎯 SISTEMA DE CACHE UNIFICADO PARA PERFORMANCE
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  defaultTTL?: number;
  maxSize?: number;
}

// 🚀 HOOK DE CACHE UNIFICADO
export const useUnifiedCache = (config: CacheConfig = {}) => {
  const {
    defaultTTL = 30000, // 30 segundos por padrão
    maxSize = 100, // Máximo 100 entradas
  } = config;

  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());

  // 🧹 LIMPAR CACHE EXPIRADO
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
      }
    }
  }, []);

  // 📥 OBTER DADOS DO CACHE
  const getCachedData = useCallback(<T>(key: string): T | null => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }, []);

  // 📤 DEFINIR DADOS NO CACHE
  const setCachedData = useCallback(<T>(key: string, data: T, ttl?: number): void => {
    const cache = cacheRef.current;
    
    // Limitar tamanho do cache
    if (cache.size >= maxSize) {
      cleanExpiredCache();
      
      // Se ainda estiver cheio, remover a entrada mais antiga
      if (cache.size >= maxSize) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
    }
    
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTTL,
    });
  }, [defaultTTL, maxSize, cleanExpiredCache]);

  // 🗑️ LIMPAR CACHE ESPECÍFICO
  const clearCache = useCallback((key?: string): void => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  // 📊 OBTER ESTATÍSTICAS DO CACHE
  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();
    let expired = 0;
    let valid = 0;
    
    for (const entry of cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        valid++;
      }
    }
    
    return {
      total: cache.size,
      valid,
      expired,
      hitRate: valid / cache.size || 0,
    };
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    getCacheStats,
    cleanExpiredCache,
  };
};

