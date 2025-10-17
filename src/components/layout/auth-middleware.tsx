/**
 * 🔐 Auth Middleware - Middleware de Validação de Autenticação
 * 
 * Componente que valida e protege rotas baseado no estado de autenticação
 * Implementa validação automática de sessão e redirecionamento
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface AuthMiddlewareProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('gerente' | 'corretor')[];
  redirectTo?: string;
  fallback?: ReactNode;
}

interface RouteConfig {
  path: string;
  requireAuth: boolean;
  allowedRoles?: ('gerente' | 'corretor')[];
  redirectTo?: string;
}

// ============================================================================
// CONFIGURAÇÃO DE ROTAS
// ============================================================================

const ROUTE_CONFIG: RouteConfig[] = [
  // Rotas públicas
  { path: '/login', requireAuth: false },
  { path: '/corretor-login', requireAuth: false },
  { path: '/admin-test-data', requireAuth: false },
  { path: '/offline-auth-test', requireAuth: false },
  { path: '/force-offline-test', requireAuth: false },
  { path: '/user-context-debug', requireAuth: false },
  { path: '/auth-system-test', requireAuth: false },
  { path: '/navigation-debug', requireAuth: false },
  
  // Rotas de gerente
  { 
    path: '/gerente-dashboard', 
    requireAuth: true, 
    allowedRoles: ['gerente'],
    redirectTo: '/login'
  },
  { 
    path: '/gerente-equipe', 
    requireAuth: true, 
    allowedRoles: ['gerente'],
    redirectTo: '/login'
  },
  { 
    path: '/todos-leads', 
    requireAuth: true, 
    allowedRoles: ['gerente'],
    redirectTo: '/login'
  },
  { 
    path: '/gerente', 
    requireAuth: true, 
    allowedRoles: ['gerente'],
    redirectTo: '/login'
  },
  
  // Rotas de corretor
  { 
    path: '/leads', 
    requireAuth: true, 
    allowedRoles: ['corretor', 'gerente'],
    redirectTo: '/corretor-login'
  },
  { 
    path: '/corretor-dashboard', 
    requireAuth: true, 
    allowedRoles: ['corretor'],
    redirectTo: '/corretor-login'
  },
  
  // Rotas compartilhadas
  { 
    path: '/profile', 
    requireAuth: true, 
    allowedRoles: ['corretor', 'gerente'],
    redirectTo: '/login'
  },
  { 
    path: '/configuracoes', 
    requireAuth: true, 
    allowedRoles: ['corretor', 'gerente'],
    redirectTo: '/login'
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function AuthMiddleware({ 
  children, 
  requireAuth = true, 
  allowedRoles, 
  redirectTo,
  fallback 
}: AuthMiddlewareProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { 
    isAuthenticated, 
    user, 
    loading, 
    isSessionExpired,
    logout 
  } = useUnifiedAuth();

  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ============================================================================
  // VALIDAÇÃO DE ROTA
  // ============================================================================

  const getRouteConfig = (path: string): RouteConfig | undefined => {
    return ROUTE_CONFIG.find(config => {
      // Match exato ou prefixo
      return path === config.path || path.startsWith(config.path + '/');
    });
  };

  const validateRoute = (path: string) => {
    const config = getRouteConfig(path);
    
    if (!config) {
      // Rota não configurada, usar props do componente
      return {
        requireAuth: requireAuth,
        allowedRoles: allowedRoles,
        redirectTo: redirectTo
      };
    }

    return {
      requireAuth: config.requireAuth,
      allowedRoles: config.allowedRoles,
      redirectTo: config.redirectTo
    };
  };

  // ============================================================================
  // VALIDAÇÃO DE AUTENTICAÇÃO
  // ============================================================================

  useEffect(() => {
    const performValidation = async () => {
      try {
        setIsValidating(true);
        setValidationError(null);

        console.log('🔍 [AUTH-MIDDLEWARE] Validando rota:', location.pathname);

        const routeConfig = validateRoute(location.pathname);
        console.log('📋 [AUTH-MIDDLEWARE] Configuração da rota:', routeConfig);

        // 1. Verificar se requer autenticação
        if (routeConfig.requireAuth) {
          console.log('🔐 [AUTH-MIDDLEWARE] Rota requer autenticação');

          // Verificar se está carregando
          if (loading) {
            console.log('⏳ [AUTH-MIDDLEWARE] Aguardando carregamento...');
            return;
          }

          // Verificar se está autenticado
          if (!isAuthenticated || !user) {
            console.log('❌ [AUTH-MIDDLEWARE] Usuário não autenticado');
            
            const redirectPath = routeConfig.redirectTo || '/login';
            console.log('🔄 [AUTH-MIDDLEWARE] Redirecionando para:', redirectPath);
            
            navigate(redirectPath, { replace: true });
            return;
          }

          // Verificar se a sessão expirou
          if (isSessionExpired()) {
            console.log('⚠️ [AUTH-MIDDLEWARE] Sessão expirada');
            
            await logout();
            
            toast({
              title: 'Sessão expirada',
              description: 'Faça login novamente para continuar.',
              variant: 'destructive',
            });

            const redirectPath = routeConfig.redirectTo || '/login';
            navigate(redirectPath, { replace: true });
            return;
          }

          // Verificar roles permitidos
          if (routeConfig.allowedRoles && routeConfig.allowedRoles.length > 0) {
            const userRole = user.cargo;
            const isAllowed = routeConfig.allowedRoles.includes(userRole);

            if (!isAllowed) {
              console.log('🚫 [AUTH-MIDDLEWARE] Role não permitido:', userRole);
              
              setValidationError(`Acesso negado. Role '${userRole}' não é permitido nesta rota.`);
              
              // Redirecionar baseado no role do usuário
              if (userRole === 'gerente') {
                navigate('/gerente-dashboard', { replace: true });
              } else {
                navigate('/leads', { replace: true });
              }
              return;
            }
          }

          console.log('✅ [AUTH-MIDDLEWARE] Validação aprovada');
        } else {
          console.log('🔓 [AUTH-MIDDLEWARE] Rota pública, validação aprovada');
        }

        setIsValidating(false);
      } catch (error) {
        console.error('❌ [AUTH-MIDDLEWARE] Erro na validação:', error);
        setValidationError('Erro interno na validação de acesso');
        setIsValidating(false);
      }
    };

    performValidation();
  }, [
    location.pathname, 
    isAuthenticated, 
    user, 
    loading, 
    isSessionExpired,
    requireAuth,
    allowedRoles,
    redirectTo,
    navigate,
    logout,
    toast
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Mostrar loading durante validação
  if (isValidating || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Validando acesso...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro de validação
  if (validationError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">🚫</div>
          <p className="text-red-600 font-medium">Acesso Negado</p>
          <p className="text-gray-600 text-sm mt-1">{validationError}</p>
        </div>
      </div>
    );
  }

  // Mostrar fallback se fornecido
  if (fallback) {
    return <>{fallback}</>;
  }

  // Renderizar children se validação passou
  return <>{children}</>;
}

// ============================================================================
// COMPONENTES ESPECIALIZADOS
// ============================================================================

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: ('gerente' | 'corretor')[];
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, roles, fallback }: ProtectedRouteProps) {
  return (
    <AuthMiddleware 
      requireAuth={true} 
      allowedRoles={roles}
      fallback={fallback}
    >
      {children}
    </AuthMiddleware>
  );
}

interface ManagerRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ManagerRoute({ children, fallback }: ManagerRouteProps) {
  return (
    <AuthMiddleware 
      requireAuth={true} 
      allowedRoles={['gerente']}
      redirectTo="/login"
      fallback={fallback}
    >
      {children}
    </AuthMiddleware>
  );
}

interface CorretorRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function CorretorRoute({ children, fallback }: CorretorRouteProps) {
  return (
    <AuthMiddleware 
      requireAuth={true} 
      allowedRoles={['corretor', 'gerente']}
      redirectTo="/corretor-login"
      fallback={fallback}
    >
      {children}
    </AuthMiddleware>
  );
}

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  return (
    <AuthMiddleware requireAuth={false}>
      {children}
    </AuthMiddleware>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AuthMiddleware;
