/**
 * 🔐 Unified Auth Context - Contexto Unificado de Autenticação
 * 
 * Contexto React que integra o gerenciador global de autenticação
 * com persistência robusta e sincronização automática
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useGlobalAuth, setupGlobalAuthMiddleware, GlobalUser, GlobalSession } from '@/lib/auth/global-auth-manager';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface LoginCredentials {
  email: string;
  password: string;
}

interface UnifiedAuthContextType {
  // Estado principal
  user: GlobalUser | null;
  session: GlobalSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Ações de autenticação
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (updates: Partial<GlobalUser>) => void;

  // Controle de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Utilitários
  hasPermission: (permission: string) => boolean;
  isManager: () => boolean;
  isCorretor: () => boolean;
  getSessionExpiry: () => number | null;
  isSessionExpired: () => boolean;

  // Debug e monitoramento
  forceSync: () => void;
  getDebugInfo: () => any;
}

interface UnifiedAuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Estado do contexto
  const [isInitialized, setIsInitialized] = useState(false);
  const [middlewareCleanup, setMiddlewareCleanup] = useState<(() => void) | null>(null);

  // Hook do gerenciador global
  const globalAuth = useGlobalAuth();

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 [UNIFIED-AUTH] Inicializando contexto...');
        
        // Configurar middleware
        const cleanup = setupGlobalAuthMiddleware();
        setMiddlewareCleanup(cleanup);

        // Verificar sessão existente
        if (globalAuth.isAuthenticated && globalAuth.user) {
          console.log('✅ [UNIFIED-AUTH] Sessão existente encontrada:', globalAuth.user);
          
          // Verificar se a sessão não expirou
          if (!globalAuth.isSessionExpired()) {
            console.log('✅ [UNIFIED-AUTH] Sessão válida, continuando...');
          } else {
            console.log('⚠️ [UNIFIED-AUTH] Sessão expirada, fazendo logout...');
            await globalAuth.logout();
          }
        } else {
          console.log('ℹ️ [UNIFIED-AUTH] Nenhuma sessão encontrada');
        }

        setIsInitialized(true);
        console.log('✅ [UNIFIED-AUTH] Contexto inicializado com sucesso');
      } catch (error) {
        console.error('❌ [UNIFIED-AUTH] Erro na inicialização:', error);
        setIsInitialized(true); // Continuar mesmo com erro
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      if (middlewareCleanup) {
        middlewareCleanup();
      }
    };
  }, []);

  // ============================================================================
  // MONITORAMENTO DE ROTAS
  // ============================================================================

  useEffect(() => {
    if (!isInitialized) return;

    const handleRouteChange = () => {
      console.log('🧭 [UNIFIED-AUTH] Mudança de rota detectada:', location.pathname);
      
      // Verificar se precisa renovar sessão
      if (globalAuth.isAuthenticated && globalAuth.isSessionExpired()) {
        console.log('⚠️ [UNIFIED-AUTH] Sessão expirada durante navegação');
        globalAuth.logout();
        navigate('/login', { replace: true });
        return;
      }

      // Atualizar atividade da sessão
      if (globalAuth.session) {
        globalAuth.updateUser({ lastLogin: new Date().toISOString() });
      }
    };

    handleRouteChange();
  }, [location.pathname, isInitialized, globalAuth.isAuthenticated]);

  // ============================================================================
  // AÇÕES DE AUTENTICAÇÃO
  // ============================================================================

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 [UNIFIED-AUTH] Iniciando login...', { email: credentials.email });
      
      globalAuth.setLoading(true);
      globalAuth.clearError();

      const result = await globalAuth.login(credentials);

      if (result.success) {
        console.log('✅ [UNIFIED-AUTH] Login realizado com sucesso');
        
        toast({
          title: '✅ Login realizado com sucesso',
          description: `Bem-vindo(a), ${globalAuth.user?.nome || 'Usuário'}!`,
        });

        // Redirecionar baseado no role
        if (globalAuth.isManager()) {
          navigate('/gerente-dashboard', { replace: true });
        } else {
          navigate('/leads', { replace: true });
        }
      } else {
        console.log('❌ [UNIFIED-AUTH] Login falhou:', result.error);
        
        toast({
          title: '❌ Erro no login',
          description: result.error || 'Credenciais inválidas',
          variant: 'destructive',
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      console.error('❌ [UNIFIED-AUTH] Erro no login:', error);
      globalAuth.setError(errorMessage);
      
      toast({
        title: '❌ Erro no login',
        description: errorMessage,
        variant: 'destructive',
      });

      return { success: false, error: errorMessage };
    } finally {
      globalAuth.setLoading(false);
    }
  }, [globalAuth, navigate, toast]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🚪 [UNIFIED-AUTH] Iniciando logout...');
      
      await globalAuth.logout();
      
      toast({
        title: '👋 Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });

      // Redirecionar para login
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ [UNIFIED-AUTH] Erro no logout:', error);
      
      // Forçar logout mesmo com erro
      await globalAuth.logout();
      navigate('/login', { replace: true });
    }
  }, [globalAuth, navigate, toast]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 [UNIFIED-AUTH] Renovando sessão...');
      return await globalAuth.refreshSession();
    } catch (error) {
      console.error('❌ [UNIFIED-AUTH] Erro ao renovar sessão:', error);
      return false;
    }
  }, [globalAuth]);

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  const getDebugInfo = useCallback(() => {
    return {
      isInitialized,
      user: globalAuth.user,
      session: globalAuth.session,
      isAuthenticated: globalAuth.isAuthenticated,
      loading: globalAuth.loading,
      error: globalAuth.error,
      sessionExpiry: globalAuth.getSessionExpiry(),
      isSessionExpired: globalAuth.isSessionExpired(),
      currentRoute: location.pathname,
      timestamp: new Date().toISOString(),
    };
  }, [isInitialized, globalAuth, location.pathname]);

  // ============================================================================
  // CONTEXTO VALUE
  // ============================================================================

  const contextValue: UnifiedAuthContextType = {
    // Estado
    user: globalAuth.user,
    session: globalAuth.session,
    isAuthenticated: globalAuth.isAuthenticated,
    loading: globalAuth.loading || !isInitialized,
    error: globalAuth.error,

    // Ações
    login,
    logout,
    refreshSession,
    updateUser: globalAuth.updateUser,
    setLoading: globalAuth.setLoading,
    setError: globalAuth.setError,
    clearError: globalAuth.clearError,

    // Utilitários
    hasPermission: globalAuth.hasPermission,
    isManager: globalAuth.isManager,
    isCorretor: globalAuth.isCorretor,
    getSessionExpiry: globalAuth.getSessionExpiry,
    isSessionExpired: globalAuth.isSessionExpired,

    // Debug
    forceSync: globalAuth.forceSync,
    getDebugInfo,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useUnifiedAuth(): UnifiedAuthContextType {
  const context = useContext(UnifiedAuthContext);
  
  if (context === undefined) {
    throw new Error('useUnifiedAuth deve ser usado dentro de um UnifiedAuthProvider');
  }
  
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default UnifiedAuthProvider;
export type { UnifiedAuthContextType, LoginCredentials };


