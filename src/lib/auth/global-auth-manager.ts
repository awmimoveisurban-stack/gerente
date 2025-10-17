/**
 * 🔐 Global Auth Manager - Gerenciador Global de Autenticação
 * 
 * Sistema unificado para gerenciar estado de autenticação global
 * com persistência robusta e sincronização entre contextos
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface GlobalUser {
  id: string;
  email: string;
  nome: string;
  cargo: 'gerente' | 'corretor';
  ativo: boolean;
  created_at: string;
  permissions: string[];
  lastLogin?: string;
  sessionId: string;
}

export interface GlobalSession {
  user: GlobalUser;
  token: string;
  expires_at: number;
  refresh_token?: string;
  permissions: string[];
  isActive: boolean;
  lastActivity: number;
}

export interface AuthState {
  // Estado principal
  user: GlobalUser | null;
  session: GlobalSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Estado de sincronização
  lastSync: number;
  isOnline: boolean;
  needsSync: boolean;
  
  // Ações
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (updates: Partial<GlobalUser>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  syncWithStorage: () => void;
  forceSync: () => void;
  
  // Utilitários
  hasPermission: (permission: string) => boolean;
  isManager: () => boolean;
  isCorretor: () => boolean;
  getSessionExpiry: () => number | null;
  isSessionExpired: () => boolean;
}

// ============================================================================
// CONFIGURAÇÕES
// ============================================================================

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const SYNC_INTERVAL = 30 * 1000; // 30 segundos
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

// ============================================================================
// STORE ZUSTAND COM PERSISTÊNCIA
// ============================================================================

export const useGlobalAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      session: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      lastSync: Date.now(),
      isOnline: navigator.onLine,
      needsSync: false,

      // ========================================================================
      // AÇÕES DE AUTENTICAÇÃO
      // ========================================================================

      login: async (credentials) => {
        try {
        set({
          loading: true,
          error: null,
        });

          console.log('🔐 [GLOBAL-AUTH] Iniciando login...', { email: credentials.email });

          // Simular autenticação (substituir por lógica real)
          const mockUser: GlobalUser = {
            id: credentials.email === 'cursos360.click@gmail.com' ? 'gerente-fixed-id' : 'corretor-fixed-id',
            email: credentials.email,
            nome: credentials.email === 'cursos360.click@gmail.com' ? 'Admin Gerente' : 'Usuário Teste',
            cargo: credentials.email === 'cursos360.click@gmail.com' ? 'gerente' : 'corretor',
            ativo: true,
            created_at: new Date().toISOString(),
            permissions: credentials.email === 'cursos360.click@gmail.com' ? [
              'leads:read:all',
              'leads:write:all',
              'leads:delete:all',
              'users:read:all',
              'users:write:all',
              'users:delete:all',
              'reports:read:all',
              'settings:write',
              'audit:read',
            ] : [
              'leads:read:own',
              'leads:write:own',
              'profile:read:own',
              'profile:write:own',
            ],
            lastLogin: new Date().toISOString(),
            sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };

          const mockSession: GlobalSession = {
            user: mockUser,
            token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            expires_at: Date.now() + SESSION_DURATION,
            permissions: mockUser.permissions,
            isActive: true,
            lastActivity: Date.now(),
          };

          set({
            user: mockUser,
            session: mockSession,
            isAuthenticated: true,
            loading: false,
            error: null,
            lastSync: Date.now(),
            needsSync: false,
          });

          console.log('✅ [GLOBAL-AUTH] Login realizado com sucesso:', mockUser);

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          
          set({
            loading: false,
            error: errorMessage,
            isAuthenticated: false,
          });

          console.error('❌ [GLOBAL-AUTH] Erro no login:', error);
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          console.log('🚪 [GLOBAL-AUTH] Iniciando logout...');

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            loading: false,
            error: null,
            needsSync: false,
          });

          // Limpar storage local
          localStorage.removeItem('force-offline-user');
          localStorage.removeItem('offline-user');
          sessionStorage.clear();

          console.log('✅ [GLOBAL-AUTH] Logout realizado com sucesso');
        } catch (error) {
          console.error('❌ [GLOBAL-AUTH] Erro no logout:', error);
        }
      },

      refreshSession: async () => {
        try {
          const { session } = get();
          
          if (!session || !session.isActive) {
            console.log('⚠️ [GLOBAL-AUTH] Nenhuma sessão ativa para renovar');
            return false;
          }

          if (Date.now() > session.expires_at) {
            console.log('⚠️ [GLOBAL-AUTH] Sessão expirada, fazendo logout...');
            await get().logout();
            return false;
          }

          // Renovar sessão
          const currentState = get();
          if (currentState.session) {
            set({
              session: {
                ...currentState.session,
                expires_at: Date.now() + SESSION_DURATION,
                lastActivity: Date.now(),
              },
              lastSync: Date.now(),
            });
          }

          console.log('✅ [GLOBAL-AUTH] Sessão renovada com sucesso');
          return true;
        } catch (error) {
          console.error('❌ [GLOBAL-AUTH] Erro ao renovar sessão:', error);
          return false;
        }
      },

      updateUser: (updates) => {
        const currentState = get();
        if (currentState.user) {
          set({
            user: { ...currentState.user, ...updates },
            lastSync: Date.now(),
            needsSync: true,
          });
        }
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      syncWithStorage: () => {
        set({
          lastSync: Date.now(),
          needsSync: false,
        });
      },

      forceSync: () => {
        set({
          lastSync: Date.now(),
          needsSync: false,
        });
      },

      // ========================================================================
      // UTILITÁRIOS
      // ========================================================================

      hasPermission: (permission) => {
        const { user } = get();
        return user ? user.permissions.includes(permission) : false;
      },

      isManager: () => {
        const { user } = get();
        return user ? user.cargo === 'gerente' : false;
      },

      isCorretor: () => {
        const { user } = get();
        return user ? user.cargo === 'corretor' : false;
      },

      getSessionExpiry: () => {
        const { session } = get();
        return session ? session.expires_at : null;
      },

      isSessionExpired: () => {
        const { session } = get();
        return session ? Date.now() > session.expires_at : true;
      },
    }),
    {
      name: 'global-auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            // Tentar localStorage primeiro
            const item = localStorage.getItem(name);
            if (item) return item;
            
            // Fallback para sessionStorage
            return sessionStorage.getItem(name);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // Salvar em ambos
            localStorage.setItem(name, value);
            sessionStorage.setItem(name, value);
          } catch (error) {
            console.error('❌ [GLOBAL-AUTH] Erro ao salvar no storage:', error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
            sessionStorage.removeItem(name);
          } catch (error) {
            console.error('❌ [GLOBAL-AUTH] Erro ao remover do storage:', error);
          }
        },
      })),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        lastSync: state.lastSync,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        console.log('🔄 [GLOBAL-AUTH] Migrando estado:', { version, persistedState });
        return persistedState;
      },
    }
  )
);

// ============================================================================
// HOOKS DE CONVENIÊNCIA
// ============================================================================

export const useGlobalAuth = () => {
  const store = useGlobalAuthStore();
  
  return {
    // Estado
    user: store.user,
    session: store.session,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    
    // Ações
    login: store.login,
    logout: store.logout,
    refreshSession: store.refreshSession,
    updateUser: store.updateUser,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
    
    // Utilitários
    hasPermission: store.hasPermission,
    isManager: store.isManager,
    isCorretor: store.isCorretor,
    getSessionExpiry: store.getSessionExpiry,
    isSessionExpired: store.isSessionExpired,
  };
};

// ============================================================================
// MIDDLEWARE DE SINCRONIZAÇÃO
// ============================================================================

export const setupGlobalAuthMiddleware = () => {
  // Monitor de atividade
  let activityTimer: NodeJS.Timeout | null = null;
  
  const resetActivityTimer = () => {
    if (activityTimer) {
      clearTimeout(activityTimer);
    }
    
    activityTimer = setTimeout(() => {
      const store = useGlobalAuthStore.getState();
      if (store.session && store.isAuthenticated) {
        console.log('⏰ [GLOBAL-AUTH] Inatividade detectada, renovando sessão...');
        store.refreshSession();
      }
    }, INACTIVITY_TIMEOUT);
  };

  // Monitor de conectividade
  const handleOnline = () => {
    useGlobalAuthStore.setState({ isOnline: true });
    console.log('🌐 [GLOBAL-AUTH] Conectividade restaurada');
  };

  const handleOffline = () => {
    useGlobalAuthStore.setState({ isOnline: false });
    console.log('📴 [GLOBAL-AUTH] Conectividade perdida');
  };

  // Sincronização periódica
  const syncInterval = setInterval(() => {
    const store = useGlobalAuthStore.getState();
    if (store.isAuthenticated && store.needsSync) {
      console.log('🔄 [GLOBAL-AUTH] Sincronizando estado...');
      store.syncWithStorage();
    }
  }, SYNC_INTERVAL);

  // Event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  document.addEventListener('mousedown', resetActivityTimer);
  document.addEventListener('keydown', resetActivityTimer);

  // Cleanup
  return () => {
    if (activityTimer) clearTimeout(activityTimer);
    clearInterval(syncInterval);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    document.removeEventListener('mousedown', resetActivityTimer);
    document.removeEventListener('keydown', resetActivityTimer);
  };
};

export default useGlobalAuthStore;
