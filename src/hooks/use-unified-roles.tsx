/**
 * 🔐 Unified Roles Hook - Hook Unificado de Roles
 * 
 * Hook simplificado que usa o sistema de autenticação unificado
 * para gerenciar roles e permissões sem complexidade desnecessária
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import { useMemo } from 'react';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';

// ============================================================================
// TIPOS
// ============================================================================

export type AppRole = 'corretor' | 'gerente';

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useUnifiedRoles = () => {
  const { user, isAuthenticated } = useUnifiedAuth();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const roles = useMemo<AppRole[]>(() => {
    if (!user || !isAuthenticated) {
      return [];
    }

    return [user.cargo];
  }, [user, isAuthenticated]);

  const hasRole = useMemo(() => {
    return (role: AppRole): boolean => {
      return roles.includes(role);
    };
  }, [roles]);

  const isManager = useMemo(() => {
    return roles.includes('gerente');
  }, [roles]);

  const isCorretor = useMemo(() => {
    return roles.includes('corretor');
  }, [roles]);

  const loading = useMemo(() => {
    return !user && isAuthenticated;
  }, [user, isAuthenticated]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    roles,
    hasRole,
    isManager,
    isCorretor,
    loading,
    userRole: user?.cargo || null,
  };
};

// ============================================================================
// HOOKS DE CONVENIÊNCIA
// ============================================================================

export const useIsManager = () => {
  const { isManager } = useUnifiedRoles();
  return isManager;
};

export const useIsCorretor = () => {
  const { isCorretor } = useUnifiedRoles();
  return isCorretor;
};

export const useHasRole = () => {
  const { hasRole } = useUnifiedRoles();
  return hasRole;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default useUnifiedRoles;


