/**
 * 🔄 useUserSync Hook - Sincronização de Usuário
 * 
 * Hook para garantir que o contexto do usuário seja mantido consistente
 * entre navegações e recarregamentos
 */

import { useEffect, useRef } from 'react';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { debugUserContext } from '@/utils/debug-user-context';
import { forceOfflineAuth } from '@/utils/force-offline-auth';

export function useUserSync() {
  const { user, isAuthenticated } = useUnifiedAuth();
  const lastUserRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Debug inicial
    if (!isInitializedRef.current) {
      console.log('🔄 useUserSync: Inicializando...');
      debugUserContext.logUserState('useUserSync Init');
      isInitializedRef.current = true;
    }

    // Verificar se o usuário mudou
    const currentUserKey = user ? `${user.id}-${user.cargo}-${user.email}` : 'null';
    
    if (lastUserRef.current !== currentUserKey) {
      console.log('🔄 useUserSync: Usuário mudou:', {
        from: lastUserRef.current,
        to: currentUserKey,
        user: user ? { id: user.id, cargo: user.cargo, email: user.email } : null
      });

      // Se há usuário autenticado, verificar consistência
      if (user && isAuthenticated) {
        const offlineUser = forceOfflineAuth.getCurrentUser();
        
        // Se há inconsistência, forçar sincronização
        if (!offlineUser || offlineUser.id !== user.id || offlineUser.cargo !== user.cargo) {
          console.log('⚠️ useUserSync: Inconsistência detectada, forçando sincronização...');
          debugUserContext.forceSync(user.email);
        }
      }

      lastUserRef.current = currentUserKey;
    }

    // Verificar inconsistências periodicamente
    const interval = setInterval(() => {
      if (user && isAuthenticated) {
        const inconsistencies = debugUserContext.checkInconsistencies();
        if (inconsistencies.length > 0) {
          console.log('🔄 useUserSync: Corrigindo inconsistências...');
          debugUserContext.forceSync(user.email);
        }
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => {
      clearInterval(interval);
    };
  }, [user, isAuthenticated]);

  // Retornar informações de debug
  return {
    currentUser: user,
    isAuthenticated,
    lastUserKey: lastUserRef.current,
    debug: () => debugUserContext.logUserState('Manual Debug'),
    forceSync: () => user ? debugUserContext.forceSync(user.email) : null,
    clearAll: debugUserContext.clearAll
  };
}
