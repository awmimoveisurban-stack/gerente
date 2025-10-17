/**
 * 🧹 UTILITÁRIO DE LIMPEZA DE CACHE
 *
 * Função centralizada para limpar todos os caches do sistema
 * Útil para debug, logout, ou quando há problemas de dados
 */

import { clearGlobalRolesCache } from '@/hooks/use-user-roles';

export interface CacheClearOptions {
  leads?: boolean;
  dashboard?: boolean;
  userRoles?: boolean;
  notifications?: boolean;
  all?: boolean;
  verbose?: boolean;
}

export function clearCache(options: CacheClearOptions = { all: true }) {
  const {
    leads = false,
    dashboard = false,
    userRoles = false,
    notifications = false,
    all = false,
    verbose = true,
  } = options;

  const clearedKeys: string[] = [];
  const keysToRemove: string[] = [];

  // Coletar todas as chaves do sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      keysToRemove.push(key);
    }
  }

  // Filtrar chaves baseado nas opções
  keysToRemove.forEach(key => {
    let shouldRemove = false;

    if (all) {
      shouldRemove = true;
    } else {
      if (
        leads &&
        (key.startsWith('leads_cache_') || key.startsWith('leads_time_'))
      ) {
        shouldRemove = true;
      }
      if (
        dashboard &&
        (key.includes('dashboard_cache') || key.includes('dashboard_time'))
      ) {
        shouldRemove = true;
      }
      if (
        userRoles &&
        (key.includes('userRoles') || key.includes('roles_cache'))
      ) {
        shouldRemove = true;
      }
      if (
        notifications &&
        (key.includes('notifications') || key.includes('notifications_cache'))
      ) {
        shouldRemove = true;
      }
    }

    if (shouldRemove) {
      sessionStorage.removeItem(key);
      clearedKeys.push(key);
    }
  });

  // Limpar localStorage também (se necessário)
  if (all) {
    const localKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes('leads') ||
          key.includes('dashboard') ||
          key.includes('userRoles') ||
          key.includes('notifications') ||
          key.includes('auth') ||
          key.includes('supabase'))
      ) {
        localKeysToRemove.push(key);
      }
    }

    localKeysToRemove.forEach(key => {
      localStorage.removeItem(key);
      clearedKeys.push(`local:${key}`);
    });
  }

  // ✅ LIMPAR CACHE GLOBAL DE ROLES
  if (all || userRoles) {
    clearGlobalRolesCache();
  }

  if (verbose) {
    console.log('🧹 [CACHE CLEAR] Chaves removidas:', {
      total: clearedKeys.length,
      keys: clearedKeys.slice(0, 10), // Mostrar apenas as primeiras 10
      hasMore: clearedKeys.length > 10,
    });
  }

  return {
    cleared: clearedKeys.length,
    keys: clearedKeys,
  };
}

/**
 * Limpeza específica de cache de leads
 */
export function clearLeadsCache() {
  return clearCache({ leads: true, verbose: true });
}

/**
 * Limpeza específica de cache de dashboard
 */
export function clearDashboardCache() {
  return clearCache({ dashboard: true, verbose: true });
}

/**
 * Limpeza específica de cache de roles
 */
export function clearUserRolesCache() {
  return clearCache({ userRoles: true, verbose: true });
}

/**
 * Limpeza completa de todos os caches
 */
export function clearAllCache() {
  return clearCache({ all: true, verbose: true });
}

/**
 * Limpeza silenciosa (sem logs)
 */
export function clearCacheSilent(options: CacheClearOptions = { all: true }) {
  return clearCache({ ...options, verbose: false });
}
