/**
 * 🔐 Página de Autenticação V2
 *
 * Design moderno, impactante e fácil de manter
 * Componentes separados para melhor organização
 *
 * @version 2.0.0
 * @author Sistema URBAN CRM
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useUnifiedRoles } from '@/hooks/use-unified-roles';
import { useToast } from '@/hooks/use-toast';
import { LoginHeader } from '@/components/auth/LoginHeader';
import { LoginCard } from '@/components/auth/LoginCard';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginFooter } from '@/components/auth/LoginFooter';
import { ROUTES } from '@/config/routes';

export default function AuthV2() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useUnifiedAuth();
  const { hasRole, loading: rolesLoading, roles } = useUnifiedRoles();

  // ✅ Handler de login com validação completa
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      // Validação básica
      if (!email || !password) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Por favor, preencha email e senha.',
          variant: 'destructive',
        });
        throw new Error('Campos obrigatórios');
      }

      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: 'Email inválido',
          description: 'Por favor, insira um email válido.',
          variant: 'destructive',
        });
        throw new Error('Email inválido');
      }

      // Validação de senha
      if (password.length < 6) {
        toast({
          title: 'Senha muito curta',
          description: 'A senha deve ter pelo menos 6 caracteres.',
          variant: 'destructive',
        });
        throw new Error('Senha muito curta');
      }

      try {
        const result = await login({
          email,
          password
        });

        if (!result.success) {
          throw new Error(result.error || 'Erro no login');
        }

        toast({
          title: 'Login realizado!',
          description: 'Bem-vindo ao URBAN CRM',
        });
      } catch (error: any) {
        console.error('❌ Erro no login:', error);

        // Mensagens de erro específicas
        let errorMessage =
          'Credenciais inválidas. Verifique seu email e senha.';

        if (error?.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error?.message?.includes('Email not confirmed')) {
          errorMessage =
            'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (error?.message?.includes('Too many requests')) {
          errorMessage =
            'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
        } else if (error?.message && !error.message.includes('Campos')) {
          errorMessage = error.message;
        }

        if (!error.message?.includes('Campos')) {
          toast({
            title: 'Erro no login',
            description: errorMessage,
            variant: 'destructive',
          });
        }

        throw error;
      }
    },
    [login, toast]
  );

  // ✅ Redirecionamento automático baseado em role
  useEffect(() => {
    // ✅ OTIMIZAÇÃO: Evitar logs excessivos
    if (!user || rolesLoading || authLoading) {
      return;
    }

    const isGerente = hasRole('gerente');
    const isCorretor = hasRole('corretor');

    console.log('🔍 [AUTH-V2] Verificando roles:', {
      isGerente,
      isCorretor,
      roles: roles,
      email: user.email,
    });

    // ✅ OTIMIZAÇÃO: Verificar se já está na página correta
    const currentPath = window.location.pathname;

    // ✅ FIX: Não redirecionar se já está em uma página válida
    const gerentePages = [
      '/gerente',
      '/todos-leads',
      '/gerente-equipe',
      '/gerente-relatorios',
      '/gerente-performance',
      '/whatsapp',
      '/configuracoes',
    ];
    const corretorPages = ['/corretor', '/leads', '/relatorios'];

    if (isGerente && !gerentePages.includes(currentPath)) {
      console.log('➡️ [AUTH-V2] Redirecionando GERENTE para /gerente');
      navigate(ROUTES.GERENTE_DASHBOARD, { replace: true });
    } else if (isCorretor && !corretorPages.includes(currentPath)) {
      console.log('➡️ [AUTH-V2] Redirecionando CORRETOR para /corretor');
      navigate(ROUTES.CORRETOR_DASHBOARD, { replace: true });
    } else if (!isGerente && !isCorretor) {
      console.warn('⚠️ [AUTH-V2] Usuário sem role definido:', user.email);
    } else {
      console.log(
        '✅ [AUTH-V2] Usuário já está na página correta:',
        currentPath
      );
    }
  }, [user, rolesLoading, authLoading, navigate, hasRole]);

  // ✅ Timeout de segurança: se roles não carregar em 3s, redirecionar mesmo assim
  useEffect(() => {
    if (!user) return;

    // ✅ OTIMIZAÇÃO: Não executar timeout se roles já estão carregados
    if (!rolesLoading && !authLoading && roles.length > 0) {
      console.log('✅ [AUTH-V2] Roles já carregadas, pulando timeout');
      return;
    }

    // ✅ OTIMIZAÇÃO: Não executar timeout se já redirecionou
    if (window.location.pathname !== '/login') {
      console.log('✅ [AUTH-V2] Já redirecionado, pulando timeout');
      return;
    }

    // ✅ OTIMIZAÇÃO: Não executar timeout se roles já estão carregados
    if (!rolesLoading && !authLoading && roles.length > 0) {
      console.log('✅ [AUTH-V2] Roles já carregados, pulando timeout', {
        roles,
      });
      return;
    }

    console.log('⏰ [AUTH-V2] Timeout iniciado...', {
      rolesLoading,
      authLoading,
      rolesCount: roles.length,
    });

    const timeout = setTimeout(() => {
      // ✅ VERIFICAR NOVAMENTE SE ROLES JÁ CARREGARAM
      if (!rolesLoading && !authLoading && roles.length > 0) {
        console.log(
          '✅ [AUTH-V2] Roles carregaram durante timeout, cancelando'
        );
        return;
      }

      console.log('⏰ [AUTH-V2] TIMEOUT ATINGIDO! Forçando redirect...');

      const isGerente = hasRole('gerente');
      const isCorretor = hasRole('corretor');

      console.log('⏰ [AUTH-V2] Roles no timeout:', {
        isGerente,
        isCorretor,
        email: user.email,
      });

      if (isGerente) {
        console.log('➡️ [AUTH-V2] TIMEOUT: Redirecionando GERENTE');
        navigate(ROUTES.GERENTE_DASHBOARD, { replace: true });
      } else if (isCorretor) {
        console.log('➡️ [AUTH-V2] TIMEOUT: Redirecionando CORRETOR');
        navigate(ROUTES.CORRETOR_DASHBOARD, { replace: true });
      } else if (user.email?.includes('gerente')) {
        console.log('➡️ [AUTH-V2] TIMEOUT: Redirecionando GERENTE (email)');
        navigate(ROUTES.GERENTE_DASHBOARD, { replace: true });
      } else if (user.email?.includes('corretor')) {
        console.log('➡️ [AUTH-V2] TIMEOUT: Redirecionando CORRETOR (email)');
        navigate(ROUTES.CORRETOR_DASHBOARD, { replace: true });
      } else {
        console.error('❌ [AUTH-V2] TIMEOUT: SEM ROLE E SEM EMAIL MATCH!');
      }
    }, 5000); // ✅ AUMENTAR TIMEOUT PARA 5 SEGUNDOS

    return () => {
      console.log('🧹 [AUTH-V2] Limpando timeout');
      clearTimeout(timeout);
    };
  }, [user, rolesLoading, authLoading, navigate, hasRole]);

  return (
    <div className='min-h-screen relative overflow-hidden'>
      {/* Background com gradiente animado */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950'>
        {/* Efeito de grid */}
        <div
          className='absolute inset-0 opacity-[0.03] dark:opacity-[0.05]'
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Círculos decorativos */}
        <div className='absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      {/* Conteúdo */}
      <div className='relative z-10 flex items-center justify-center min-h-screen p-4 py-12'>
        <div className='w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
          {/* Header */}
          <LoginHeader />

          {/* Card de Login */}
          <LoginCard>
            <LoginForm
              onSubmit={handleLogin}
              isLoading={authLoading || rolesLoading}
            />
          </LoginCard>

          {/* Footer */}
          <LoginFooter />
        </div>
      </div>
    </div>
  );
}
