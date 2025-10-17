import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { recoverFromCorruptedTokens, clearAllAuthTokens, autoFixAuthTokens, forceClearAllAuth } from '@/utils/auth-token-manager';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, cargo?: 'corretor' | 'gerente') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// ✅ DEBUG: Contar listeners ativos
let authListenerCount = 0;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, nome, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        // ✅ FIX: Converter dados do banco para UserProfile
        const profileData: UserProfile = {
          id: (data as any).id,
          email: (data as any).email,
          full_name: (data as any).full_name || (data as any).nome || (data as any).email.split('@')[0],
          avatar_url: (data as any).avatar_url || undefined,
          created_at: (data as any).created_at,
          updated_at: (data as any).updated_at
        };
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // ✅ DEBUG: Incrementar contador
    authListenerCount++;

    // ✅ FIX: Verificar e corrigir tokens automaticamente na inicialização
    const initializeAuth = () => {
      try {
        const hasValidTokens = autoFixAuthTokens();
        if (!hasValidTokens) {
          console.log('🔧 [AUTH] Tokens inválidos na inicialização, limpando...');
          forceClearAllAuth();
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização de auth:', error);
        forceClearAllAuth();
      }
    };

    // Executar verificação inicial
    initializeAuth();

    // ✅ OTIMIZAÇÃO: Verificar cache local primeiro (instantâneo)
    const checkLocalSession = () => {
      try {
        // Verificar múltiplas chaves possíveis do localStorage
        const keys = [
          'sb-bxtuynqauqasigcbocbm-auth-token',
          'supabase.auth.token',
          'sb-auth-token'
        ];
        
        for (const key of keys) {
          const localSession = localStorage.getItem(key);
          if (localSession) {
            const parsed = JSON.parse(localSession);
            if (parsed?.currentSession?.access_token || parsed?.access_token) {
              return true; // Tem sessão em cache
            }
          }
        }
        
        // Verificar também sessionStorage
        for (const key of keys) {
          const sessionData = sessionStorage.getItem(key);
          if (sessionData) {
            const parsed = JSON.parse(sessionData);
            if (parsed?.currentSession?.access_token || parsed?.access_token) {
              return true; // Tem sessão em cache
            }
          }
        }
      } catch (e) {
        // Ignorar erros de parse
      }
      return false;
    };

    const hasLocalSession = checkLocalSession();
    
    // ✅ OTIMIZAÇÃO: Se não tem cache local, assumir sem sessão imediatamente
    if (!hasLocalSession) {
      // ✅ FIX: Evitar logs excessivos em produção
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [AUTH] Sem cache local - usuário não está logado');
      }
      // ✅ OTIMIZAÇÃO: Só definir se ainda não está definido
      if (session !== null) setSession(null);
      if (user !== null) setUser(null);
      if (loading !== false) setLoading(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [AUTH] Sistema inicializado - redirecionando para login');
      }
      return;
    }

    console.log('🔍 Verificando sessão com cache local...');

    // ✅ Timeout reduzido para 2s (mais responsivo)
    const sessionTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ Timeout na verificação de sessão - assumindo sem sessão');
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    }, 2000);
    
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        clearTimeout(sessionTimeout);
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        clearTimeout(sessionTimeout);
        console.error('Erro ao obter sessão:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      });

    // Set up auth state listener for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 [AUTH] Event:', event, { hasSession: !!session, email: session?.user?.email });
        
        // ✅ OTIMIZAÇÃO: Limpar timeout se há sessão válida
        if (session) {
          clearTimeout(sessionTimeout);
        }
        
        // ✅ FIX: Tratar erros de refresh token
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 [AUTH] Token refreshed successfully');
        }
        
        // ✅ FIX: Tratar erros de refresh token
        if (event === 'SIGNED_OUT' && session === null) {
          console.log('🚪 [AUTH] Usuário deslogado');
          
          // Verificar se foi por erro de refresh token
          const hasValidTokens = autoFixAuthTokens();
          
          if (!hasValidTokens) {
            console.log('🔧 [AUTH] Tokens inválidos detectados, limpando...');
            forceClearAllAuth();
          }
          
          toast({
            title: "Sessão expirada",
            description: "Faça login novamente para continuar.",
            variant: "default",
          });
        }
        
        console.log('🔐 [AUTH] Setando user...', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔐 [AUTH] Fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        // ✅ FIX: Garantir que loading seja false após processar auth change
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('🔐 [AUTH] setLoading(false) após', event);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authListenerCount--;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, cargo: 'corretor' | 'gerente' = 'corretor') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: email.split('@')[0],
          cargo: cargo
        }
      }
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    // ✅ FIX: Criar perfil e role com error handling
    if (data.user) {
      try {
        // Criar perfil automaticamente
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          nome: email.split('@')[0],
          full_name: email.split('@')[0],
          cargo: cargo,
          ativo: true
        } as any);

        if (profileError) {
          console.error('❌ Erro ao criar perfil:', profileError);
          throw new Error('Falha ao criar perfil de usuário');
        }

        // Criar role automaticamente
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: cargo
        });

        if (roleError) {
          console.error('❌ Erro ao criar role:', roleError);
          throw new Error('Falha ao criar permissões de usuário');
        }

        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
        });
      } catch (setupError: any) {
        // Se falhar ao criar perfil/role, mostrar erro
        toast({
          title: "Erro ao finalizar cadastro",
          description: setupError.message || "Tente novamente mais tarde",
          variant: "destructive",
        });

        // Retornar erro customizado
        return { error: setupError };
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AUTH] signIn iniciado para:', email);
    
    try {
      // ✅ FIX: Limpar tokens corrompidos antes do login
      const { clearAllAuthTokens } = await import('@/utils/auth-token-manager');
      clearAllAuthTokens();
      console.log('🧹 [AUTH] Tokens limpos antes do login');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // ✅ Normalizar email
        password,
      });

      console.log('🔐 [AUTH] signIn resultado:', { 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        email: data?.user?.email,
        error: error?.message,
        errorCode: error?.status
      });

      if (error) {
        console.error('🔐 [AUTH] signIn ERRO DETALHADO:', {
          message: error.message,
          status: error.status,
          name: error.name,
          email: email
        });
        
        // ✅ FIX: Mensagens de erro mais específicas
        let errorMessage = error.message;
        
        if (error.status === 400) {
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
          } else if (error.message.includes('Too many requests')) {
            errorMessage = "Muitas tentativas de login. Aguarde alguns minutos.";
          } else {
            errorMessage = "Erro de autenticação. Verifique suas credenciais.";
          }
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }

      // ✅ CRÍTICO: Setar user/session IMEDIATAMENTE após login bem-sucedido
      if (data?.session && data?.user) {
        console.log('🔐 [AUTH] ✅ SETANDO user/session IMEDIATAMENTE!');
        setSession(data.session);
        setUser(data.user);
        
        console.log('🔐 [AUTH] Buscando profile do usuário...');
        await fetchProfile(data.user.id);
        
        console.log('🔐 [AUTH] setLoading(false) - Login completo!');
        setLoading(false);
      }

      return { error: null };
    } catch (networkError: any) {
      console.error('🔐 [AUTH] Erro de rede no login:', networkError);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua internet.",
        variant: "destructive",
      });
      return { error: networkError };
    }
    // Fallback (não deve chegar aqui, mas retorna erro nulo por segurança)
    return { error: null };
  };

  const signOut = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      
      // ✅ LIMPEZA COMPLETA DE CACHE
      const { clearAllCache } = await import('@/utils/clear-cache');
      const result = clearAllCache();
      console.log('🧹 [LOGOUT] Cache completo limpo:', result);
      
      // ✅ LIMPEZA DE TOKENS DE AUTENTICAÇÃO
      clearAllAuthTokens();
      console.log('🧹 [LOGOUT] Tokens de autenticação limpos');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro ao fazer logout:', error);
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log('✅ Logout bem-sucedido');
      
      // Forçar limpeza do estado
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Você saiu do sistema",
        description: "Até logo!",
      });
      
      // Redirecionar para login
      window.location.href = '/login';
    } catch (error: any) {
      console.error('❌ Erro inesperado no logout:', error);
      // Mesmo com erro, limpar estado local
      clearAllAuthTokens();
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema.",
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};