import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-context';
import { GlobalLoading } from '@/components/global-loading';

/**
 * Componente que redireciona /dashboard para o dashboard correto baseado no role
 */
export const DashboardRedirect = () => {
  const navigate = useNavigate();
  const { user, loading, isManager, isCorretor } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || loading) return;

    hasRedirected.current = true;

    if (isManager) {
      navigate('/gerente', { replace: true });
    } else if (isCorretor) {
      navigate('/corretor', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [loading, isManager, isCorretor, navigate]);

  return <GlobalLoading message='Carregando dashboard...' />;
};
