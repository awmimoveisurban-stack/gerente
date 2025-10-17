// Redirect users based on auth status and role
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useUnifiedRoles } from '@/hooks/use-unified-roles';
import { GlobalLoading } from '@/components/global-loading';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useUnifiedAuth();
  const { hasRole, loading: rolesLoading } = useUnifiedRoles();
  const loading = authLoading || rolesLoading;

  const hasRedirected = useRef(false);

  // ✅ DEBUG: Logs para diagnosticar problema
  console.log('🏠 [INDEX] Estado atual:', {
    user: user?.email || 'null',
    authLoading,
    rolesLoading,
    loading,
    hasRedirected: hasRedirected.current,
  });

  // ✅ DEBUG: Log quando rolesLoading muda
  useEffect(() => {
    console.log('🔄 [INDEX] rolesLoading mudou para:', rolesLoading);
    if (!rolesLoading) {
      console.log('✅ [INDEX] rolesLoading virou false!');
      console.log('🎯 [INDEX] Agora pode redirecionar para login!');
    }
  }, [rolesLoading]);

  // ✅ DEBUG: Log quando loading muda
  useEffect(() => {
    console.log('🔄 [INDEX] Loading mudou para:', loading);
    if (!loading) {
      console.log('✅ [INDEX] Loading virou false!');
      console.log('🎯 [INDEX] Agora pode redirecionar!');
    }
  }, [loading]);

  useEffect(() => {
    console.log('🏠 [INDEX] useEffect executado:', {
      hasRedirected: hasRedirected.current,
      loading,
      user: user?.email || 'null',
      authLoading,
      rolesLoading,
    });

    if (hasRedirected.current) {
      console.log('🏠 [INDEX] Já redirecionado, saindo');
      return;
    }

    if (!loading) {
      hasRedirected.current = true;
      console.log('🏠 [INDEX] Loading completo, redirecionando...');

      if (user) {
        const isGerente = hasRole('gerente');
        const isCorretor = hasRole('corretor');

        console.log('🏠 [INDEX] User logado, verificando roles:', {
          isGerente,
          isCorretor,
        });

        // ✅ FIX: Verificar se já está em uma página válida antes de redirecionar
        const currentPath = window.location.pathname;
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
          console.log('🏠 [INDEX] Redirecionando para /gerente');
          navigate('/gerente', { replace: true });
        } else if (isCorretor && !corretorPages.includes(currentPath)) {
          console.log('🏠 [INDEX] Redirecionando para /corretor');
          navigate('/corretor', { replace: true });
        } else if (!isGerente && !isCorretor) {
          console.log(
            '🏠 [INDEX] Sem role definido, redirecionando para /login'
          );
          navigate('/login', { replace: true });
        } else {
          console.log(
            '🏠 [INDEX] Usuário já está na página correta:',
            currentPath
          );
        }
      } else {
        console.log('🏠 [INDEX] Sem user, redirecionando para /login');
        navigate('/login', { replace: true });
      }
    } else {
      console.log('🏠 [INDEX] Ainda carregando, aguardando...');
    }
  }, [navigate, user, loading]); // ✅ Remover hasRole das dependências

  return (
    <GlobalLoading
      message={
        user ? 'Carregando seu dashboard...' : 'Redirecionando para o login...'
      }
    />
  );
};

export default Index;
