import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/use-user-roles';
import { GlobalLoading } from '@/components/global-loading';

/**
 * Componente que redireciona /dashboard para o dashboard correto baseado no role
 */
export const DashboardRedirect = () => {
  const navigate = useNavigate();
  const { hasRole, loading } = useUserRoles();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || loading) return;

    hasRedirected.current = true;

    const isGerente = hasRole('gerente');
    const isCorretor = hasRole('corretor');

    if (isGerente) {
      navigate('/gerente', { replace: true });
    } else if (isCorretor) {
      navigate('/corretor', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [loading, hasRole, navigate]);

  return <GlobalLoading message='Carregando dashboard...' />;
};
