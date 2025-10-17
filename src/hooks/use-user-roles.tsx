import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';

export type AppRole = 'corretor' | 'gerente';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// ✅ SINGLETON GLOBAL: Controlar execuções de roles
const globalRolesCache: Map<string, { roles: AppRole[]; timestamp: number }> =
  new Map();
const globalExecutionTracker: Set<string> = new Set();
let globalDebounceTimer: NodeJS.Timeout | null = null;
const globalLoadingState: Map<string, boolean> = new Map();

// ✅ FUNÇÃO PARA LIMPAR CACHE GLOBAL
export const clearGlobalRolesCache = () => {
  globalRolesCache.clear();
  globalExecutionTracker.clear();
  globalLoadingState.clear();
  if (globalDebounceTimer) {
    clearTimeout(globalDebounceTimer);
    globalDebounceTimer = null;
  }
  console.log('🧹 [ROLES] Cache global limpo');
};

export const useUserRoles = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUnifiedAuth();
  const hasExecutedRef = useRef<string | null>(null);
  const userRef = useRef(user);
  const loadingRef = useRef(true);

  // ✅ SINGLETON: Controle global de loading
  const userKey = user?.id || 'no-user';
  const globalLoading = globalLoadingState.get(userKey) ?? true;

  // ✅ OTIMIZAÇÃO: Atualizar refs apenas quando necessário
  useEffect(() => {
    const userChanged =
      userRef.current?.id !== user?.id ||
      userRef.current?.email !== user?.email;
    if (userChanged) {
      console.log('👤 [ROLES] User realmente mudou:', {
        from: userRef.current?.email || 'null',
        to: user?.email || 'null',
      });
      userRef.current = user;
    }
  }, [user]);

  // ✅ OTIMIZAÇÃO: Se user já é null e loading já é false, não fazer nada
  useEffect(() => {
    if (!userRef.current && !loadingRef.current) {
      console.log(
        '✅ [ROLES] User já é null e loading já é false, não fazendo nada'
      );
      return;
    }
  }, [user, loading]);

  // ✅ DEBUG: Log quando loading muda
  useEffect(() => {
    console.log('🔄 [ROLES] Loading mudou para:', loading);
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    // ✅ SINGLETON: Se já tem loading global false, usar
    if (!globalLoading) {
      console.log('✅ [ROLES] Usando loading global false');
      setLoading(false);
      return;
    }

    // ✅ OTIMIZAÇÃO: Se não há user, definir loading false imediatamente
    if (!userRef.current) {
      // ✅ FIX: Evitar logs excessivos em produção
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [ROLES] Sem user, definindo loading false imediatamente');
      }
      globalLoadingState.set(userKey, false);
      setLoading(false);
      setRoles([]);
      return;
    }

    // ✅ DEBOUNCE: Limpar timer anterior
    if (globalDebounceTimer) {
      clearTimeout(globalDebounceTimer);
    }

    // ✅ DEBOUNCE: Aguardar 100ms antes de executar
    globalDebounceTimer = setTimeout(() => {
      let isMounted = true;

      console.log(
        '🚀 [ROLES] useEffect executado (após debounce) para user:',
        userRef.current?.email
      );

      // ✅ SINGLETON: Verificar se já está executando globalmente
      if (globalExecutionTracker.has(userRef.current.id)) {
        console.log(
          '✅ [ROLES] Já executando globalmente para este user, saindo do useEffect'
        );
        // ✅ OTIMIZAÇÃO: Se já está executando, usar cache se disponível
        const cached = globalRolesCache.get(userRef.current.id);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
          console.log(
            '✅ [ROLES] Usando cache global válido (execução em andamento):',
            cached.roles
          );
          if (isMounted) {
            setRoles(cached.roles);
            setLoading(false);
          }
        }
        return;
      }

      // ✅ SINGLETON: Verificar cache global
      const cached = globalRolesCache.get(userRef.current.id);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        // 5 minutos
        console.log('✅ [ROLES] Usando cache global válido:', cached.roles);
        if (isMounted) {
          setRoles(cached.roles);
          setLoading(false);
        }
        return;
      }

      // ✅ SINGLETON: Marcar como executando globalmente
      globalExecutionTracker.add(userRef.current.id);

      const fetchRoles = async () => {
        if (!user) {
          console.log('❌ [ROLES] Sem user, limpando roles');
          hasExecutedRef.current = null;
          if (isMounted) {
            setRoles([]);
            setLoading(false);
          }
          return;
        }

        // ✅ OTIMIZAÇÃO: Evitar execuções múltiplas para o mesmo user
        if (hasExecutedRef.current === user.id) {
          console.log('✅ [ROLES] Já executado para este user, pulando...');
          return;
        }

        // ✅ OTIMIZAÇÃO: Se já tem roles carregados para este user, não executar novamente
        if (roles.length > 0 && !loading) {
          console.log('✅ [ROLES] Roles já carregados, pulando execução');
          return;
        }

        // ✅ OTIMIZAÇÃO: Marcar como executado imediatamente para evitar execuções paralelas
        hasExecutedRef.current = user.id;

        // ✅ OTIMIZAÇÃO: Verificar cache primeiro
        const cacheKey = `userRoles_cache_${user.id}`;
        const cacheTimeKey = `userRoles_time_${user.id}`;
        const cachedRoles = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(cacheTimeKey);

        // Se tem cache válido, usar e não executar novamente
        if (cachedRoles && cacheTime) {
          const cacheAge = Date.now() - parseInt(cacheTime);
          if (cacheAge < 5 * 60 * 1000) {
            // 5 minutos
            const cachedRolesArray = JSON.parse(cachedRoles);
            console.log('✅ [ROLES] Usando cache válido:', cachedRolesArray);
            if (isMounted) {
              setRoles(cachedRolesArray);
              setLoading(false);
            }
            return;
          }
        }

        console.log('✅ [ROLES] User encontrado, buscando roles...');
        if (isMounted) setLoading(true);

        try {
          // ✅ Determinar role por email (fallback rápido)
          let fetchedRoles: AppRole[] = [];

          console.log('🔍 [ROLES] Verificando email:', user.email);

          // ✅ FIX: Detecção mais precisa de roles por email
          const emailLower = user.email?.toLowerCase() || '';

          if (
            emailLower === 'gerente@imobiliaria.com' ||
            emailLower.includes('gerente@') ||
            emailLower === 'admin@imobiliaria.com' ||
            emailLower === 'administrador@imobiliaria.com'
          ) {
            fetchedRoles = ['gerente'];
            console.log(
              '✅ [ROLES] Role GERENTE detectado por email:',
              user.email
            );
          } else if (
            emailLower.includes('corretor@') ||
            emailLower.includes('vendedor@') ||
            emailLower.includes('comercial@')
          ) {
            fetchedRoles = ['corretor'];
            console.log(
              '✅ [ROLES] Role CORRETOR detectado por email:',
              user.email
            );
          } else {
            // ✅ SIMPLIFICADO: Usar apenas role do usuário offline
            console.log('🔧 [ROLES] Usando sistema offline, cargo do usuário:', user.cargo);
            if (user.cargo) {
              fetchedRoles = [user.cargo as AppRole];
              console.log('✅ [ROLES] Role definido pelo usuário offline:', user.cargo);
            } else {
              fetchedRoles = ['corretor']; // Padrão seguro
              console.log('🔧 [ROLES] Usando fallback: corretor');
            }
          }

          // Salvar no cache local
          sessionStorage.setItem(cacheKey, JSON.stringify(fetchedRoles));
          sessionStorage.setItem(cacheTimeKey, Date.now().toString());

          // ✅ SINGLETON: Salvar no cache global
          globalRolesCache.set(user.id, {
            roles: fetchedRoles,
            timestamp: Date.now(),
          });

          console.log('🎯 [ROLES] Roles finais:', fetchedRoles);

          if (isMounted) {
            setRoles(fetchedRoles);
            setLoading(false);
            hasExecutedRef.current = user.id; // Marcar como executado
            console.log('✅ [ROLES] setLoading(false) - Roles prontas!');
          }

          // ✅ SINGLETON: Remover do tracker global
          globalExecutionTracker.delete(user.id);
        } catch (error) {
          console.error('Erro ao buscar roles:', error);

          // Fallback usando cargo do usuário offline
          let fallbackRoles: AppRole[] = [];
          if (user.cargo) {
            fallbackRoles = [user.cargo as AppRole];
            console.log('🔧 [ROLES] Fallback usando cargo:', user.cargo);
          } else if (user.email?.toLowerCase() === 'cursos360.click@gmail.com') {
            fallbackRoles = ['gerente'];
            console.log('🔧 [ROLES] Fallback por email gerente');
          } else {
            fallbackRoles = ['corretor'];
            console.log('🔧 [ROLES] Fallback padrão: corretor');
          }

          if (isMounted) {
            setRoles(fallbackRoles);
            setLoading(false);
          }

          // ✅ SINGLETON: Remover do tracker global (em caso de erro)
          globalExecutionTracker.delete(user.id);
        }
      };

      fetchRoles();

      return () => {
        isMounted = false;
      };
    }, 100); // ✅ DEBOUNCE: 100ms

    return () => {
      // ✅ DEBOUNCE: Limpar timer no cleanup
      if (globalDebounceTimer) {
        clearTimeout(globalDebounceTimer);
        globalDebounceTimer = null;
      }
    };
  }, [user?.id]); // ✅ Usar user.id para evitar execuções desnecessárias

  // ✅ OTIMIZAÇÃO: Limpar ref quando user muda
  useEffect(() => {
    hasExecutedRef.current = null;
  }, [user?.id]);

  const hasRole = useCallback(
    (role: AppRole): boolean => {
      return roles.includes(role);
    },
    [roles]
  );

  const isCorretor = useMemo(() => roles.includes('corretor'), [roles]);
  const isGerente = useMemo(() => roles.includes('gerente'), [roles]);

  return {
    roles,
    loading,
    hasRole,
    isCorretor,
    isGerente,
  };
};
