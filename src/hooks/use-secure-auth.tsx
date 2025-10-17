/**
 * 🔐 useSecureAuth Hook - Hook de Autenticação Seguro
 * 
 * Hook unificado para autenticação, autorização e segurança
 * Integra todos os componentes de segurança do sistema
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import { useSecureAuth as useSecureAuthContext } from '@/contexts/secure-auth-context';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { auditManager } from '@/lib/auth/audit-manager';

/**
 * ✅ Hook principal de autenticação segura
 */
export function useSecureAuth() {
  const auth = useSecureAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * 🔐 Login com validação completa
   */
  const secureLogin = useCallback(async (credentials: {
    email: string;
    login_nome?: string;
    password: string;
  }) => {
    try {
      const result = await auth.login(credentials);
      
      if (result.success) {
        // Redirecionar baseado no cargo
        if (auth.isManager()) {
          navigate('/gerente', { replace: true });
        } else if (auth.isCorretor()) {
          navigate('/corretor', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro no login seguro:', error);
      toast({
        title: '❌ Erro no Login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
      return { success: false, error: 'Erro interno' };
    }
  }, [auth, navigate, toast]);

  /**
   * 🔐 Logout com auditoria
   */
  const secureLogout = useCallback(async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('❌ Erro no logout seguro:', error);
      // Forçar logout mesmo com erro
      auth.logout();
    }
  }, [auth]);

  /**
   * 🔐 Verificar acesso a rota com redirecionamento
   */
  const checkRouteAccess = useCallback((route: string): boolean => {
    const hasAccess = auth.canAccessRoute(route);
    
    if (!hasAccess) {
      toast({
        title: '🚫 Acesso Negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
      
      // Redirecionar para página apropriada
      if (auth.isManager()) {
        navigate('/gerente', { replace: true });
      } else if (auth.isCorretor()) {
        navigate('/corretor', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
    
    return hasAccess;
  }, [auth, navigate, toast]);

  /**
   * 🔐 Executar ação com verificação de permissão
   */
  const executeWithPermission = useCallback(async (
    permission: string,
    action: () => Promise<any>,
    errorMessage: string = 'Permissão insuficiente'
  ): Promise<any | null> => {
    if (!auth.hasPermission(permission)) {
      toast({
        title: '🚫 Acesso Negado',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      return await action();
    } catch (error) {
      console.error('❌ Erro ao executar ação:', error);
      toast({
        title: '❌ Erro',
        description: 'Não foi possível executar a ação.',
        variant: 'destructive',
      });
      return null;
    }
  }, [auth, toast]);

  /**
   * 🔐 Log de ação do usuário
   */
  const logUserAction = useCallback(async (
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any> = {}
  ) => {
    if (!auth.user) return;
    
    try {
      await auditManager.logUserAction(
        auth.user,
        action,
        resourceType,
        resourceId,
        details
      );
    } catch (error) {
      console.error('❌ Erro ao registrar ação:', error);
    }
  }, [auth.user]);

  /**
   * 🔐 Verificar se pode criar lead
   */
  const canCreateLead = useCallback((): boolean => {
    return auth.hasPermission('leads:write:own') || auth.hasPermission('leads:write:all');
  }, [auth]);

  /**
   * 🔐 Verificar se pode editar lead
   */
  const canEditLead = useCallback((leadOwnerId: string): boolean => {
    if (auth.hasPermission('leads:write:all')) return true;
    if (auth.hasPermission('leads:write:own') && auth.user?.id === leadOwnerId) return true;
    return false;
  }, [auth]);

  /**
   * 🔐 Verificar se pode deletar lead
   */
  const canDeleteLead = useCallback((leadOwnerId: string): boolean => {
    if (auth.hasPermission('leads:delete:all')) return true;
    if (auth.hasPermission('leads:delete:own') && auth.user?.id === leadOwnerId) return true;
    return false;
  }, [auth]);

  /**
   * 🔐 Verificar se pode gerenciar usuários
   */
  const canManageUsers = useCallback((): boolean => {
    return auth.hasPermission('users:write:all');
  }, [auth]);

  /**
   * 🔐 Verificar se pode ver relatórios
   */
  const canViewReports = useCallback((): boolean => {
    return auth.hasPermission('reports:read:all');
  }, [auth]);

  /**
   * 🔐 Obter informações do usuário para exibição
   */
  const getUserDisplayInfo = useCallback(() => {
    if (!auth.user) return null;
    
    return {
      nome: auth.user.nome,
      email: auth.user.email,
      cargo: auth.user.cargo,
      isManager: auth.isManager(),
      isCorretor: auth.isCorretor(),
      permissions: auth.getCurrentPermissions(),
    };
  }, [auth]);

  return {
    // Estado
    user: auth.user,
    session: auth.session,
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated,

    // Autenticação
    login: secureLogin,
    logout: secureLogout,
    register: auth.register,

    // Autorização
    hasPermission: auth.hasPermission,
    isManager: auth.isManager,
    isCorretor: auth.isCorretor,
    canAccessRoute: checkRouteAccess,

    // Ações específicas
    canCreateLead,
    canEditLead,
    canDeleteLead,
    canManageUsers,
    canViewReports,

    // Utilitários
    executeWithPermission,
    logUserAction,
    getUserDisplayInfo,
    getCurrentUser: auth.getCurrentUser,
    getCurrentPermissions: auth.getCurrentPermissions,
    refreshSession: auth.refreshSession,
  };
}

/**
 * ✅ Hook para proteção de componentes
 */
export function useAuthGuard(requiredPermissions: string[] = []) {
  const auth = useSecureAuth();

  const isAuthorized = useCallback(() => {
    if (!auth.isAuthenticated) return false;
    
    if (requiredPermissions.length === 0) return true;
    
    return requiredPermissions.every(permission => 
      auth.hasPermission(permission)
    );
  }, [auth, requiredPermissions]);

  return {
    isAuthorized: isAuthorized(),
    loading: auth.loading,
    user: auth.user,
  };
}

/**
 * ✅ Hook para ações de lead com segurança
 */
export function useSecureLeadActions() {
  const auth = useSecureAuth();

  const createLead = useCallback(async (leadData: any) => {
    if (!auth.canCreateLead()) {
      return { success: false, error: 'Permissão insuficiente' };
    }

    try {
      // Implementar criação de lead
      // TODO: Integrar com API de leads
      
      await auth.logUserAction('create', 'lead', 'new', leadData);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao criar lead:', error);
      return { success: false, error: 'Erro interno' };
    }
  }, [auth]);

  const updateLead = useCallback(async (leadId: string, updates: any, leadOwnerId: string) => {
    if (!auth.canEditLead(leadOwnerId)) {
      return { success: false, error: 'Permissão insuficiente' };
    }

    try {
      // Implementar atualização de lead
      // TODO: Integrar com API de leads
      
      await auth.logUserAction('update', 'lead', leadId, updates);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar lead:', error);
      return { success: false, error: 'Erro interno' };
    }
  }, [auth]);

  const deleteLead = useCallback(async (leadId: string, leadOwnerId: string) => {
    if (!auth.canDeleteLead(leadOwnerId)) {
      return { success: false, error: 'Permissão insuficiente' };
    }

    try {
      // Implementar exclusão de lead
      // TODO: Integrar com API de leads
      
      await auth.logUserAction('delete', 'lead', leadId);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar lead:', error);
      return { success: false, error: 'Erro interno' };
    }
  }, [auth]);

  return {
    createLead,
    updateLead,
    deleteLead,
    canCreateLead: auth.canCreateLead(),
    canEditLead: auth.canEditLead,
    canDeleteLead: auth.canDeleteLead,
  };
}

/**
 * ✅ Hook para gerenciamento de usuários
 */
export function useSecureUserManagement() {
  const auth = useSecureAuth();

  const createUser = useCallback(async (userData: any) => {
    if (!auth.canManageUsers()) {
      return { success: false, error: 'Permissão insuficiente' };
    }

    try {
      const result = await auth.register(userData);
      
      if (result.success) {
        await auth.logUserAction('create', 'user', 'new', userData);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return { success: false, error: 'Erro interno' };
    }
  }, [auth]);

  const updateUser = useCallback(async (userId: string, updates: any) => {
    if (!auth.canManageUsers()) {
      return { success: false, error: 'Permissão insuficiente' };
    }

    try {
      // Implementar atualização de usuário
      // TODO: Integrar com API de usuários
      
      await auth.logUserAction('update', 'user', userId, updates);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      return { success: false, error: 'Erro interno' };
    }
  }, [auth]);

  const deleteUser = useCallback(async (userId: string) => {
    if (!auth.canManageUsers()) {
      return { success: false, error: 'Permissão insuficiente' };
    }

    try {
      // Implementar exclusão de usuário
      // TODO: Integrar com API de usuários
      
      await auth.logUserAction('delete', 'user', userId);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      return { success: false, error: 'Erro interno' };
    }
  }, [auth]);

  return {
    createUser,
    updateUser,
    deleteUser,
    canManageUsers: auth.canManageUsers(),
  };
}
