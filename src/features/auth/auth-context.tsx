import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, supabaseUtils, type User } from '@/lib/supabase';
import { validateAndSanitize, loginSchema, type LoginData } from '@/lib/validations';

// 🎯 CONTEXTO DE AUTENTICAÇÃO UNIFICADO
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isManager: boolean;
  isCorretor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔐 PROVIDER DE AUTENTICAÇÃO
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🚀 INICIALIZAR AUTENTICAÇÃO
  useEffect(() => {
    // Verificar sessão existente
    const checkSession = async () => {
      try {
        const currentUser = await supabaseUtils.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const currentUser = await supabaseUtils.getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 🔑 FUNÇÃO DE LOGIN
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Validar dados de entrada
      const validation = validateAndSanitize(loginSchema, { email, password });
      if (!validation.success) {
        return { success: false, error: validation.errors?.[0] || 'Dados inválidos' };
      }

      // Autenticar com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.data!.email,
        password: validation.data!.password
      });

      if (error) {
        return { success: false, error: 'Email ou senha incorretos' };
      }

      if (data.user) {
        // Buscar perfil do usuário
        const currentUser = await supabaseUtils.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Log de auditoria
          await supabaseUtils.logAction(currentUser.id, 'login', {
            email: currentUser.email,
            role: currentUser.role
          });

          return { success: true };
        }
      }

      return { success: false, error: 'Erro ao carregar perfil do usuário' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  // 🚪 FUNÇÃO DE LOGOUT
  const logout = async (): Promise<void> => {
    try {
      if (user) {
        // Log de auditoria
        await supabaseUtils.logAction(user.id, 'logout', {
          email: user.email,
          role: user.role
        });
      }

      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  // 🔐 VERIFICAR PERMISSÕES
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Gerente tem todas as permissões
    if (user.role === 'gerente') return true;
    
    // Permissões específicas para corretor
    const corretorPermissions = [
      'view_own_leads',
      'edit_own_leads', 
      'create_leads',
      'view_own_tasks',
      'complete_tasks'
    ];
    
    return corretorPermissions.includes(permission);
  };

  // 🎯 HELPERS DE ROLE
  const isManager = user?.role === 'gerente';
  const isCorretor = user?.role === 'corretor';

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isManager,
    isCorretor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 🎯 HOOK PARA USAR AUTENTICAÇÃO
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// 🎯 HOOK PARA VERIFICAR PERMISSÕES
export function usePermissions() {
  const { hasPermission, isManager, isCorretor } = useAuth();
  
  return {
    hasPermission,
    isManager,
    isCorretor,
    canViewAllLeads: isManager,
    canEditAllLeads: isManager,
    canManageTeam: isManager,
    canViewReports: isManager,
    canViewOwnLeads: hasPermission('view_own_leads'),
    canEditOwnLeads: hasPermission('edit_own_leads'),
    canCreateLeads: hasPermission('create_leads')
  };
}

export default AuthProvider;

