import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useUserRoles, AppRole } from '@/hooks/use-user-roles';
import { GlobalLoading } from '@/components/global-loading';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export const RoleBasedRedirect = ({ children, allowedRoles }: RoleBasedRedirectProps) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading, hasRole } = useUserRoles();
  const navigate = useNavigate();
  const loading = authLoading || rolesLoading;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <GlobalLoading message="Verificando permissões..." />;
  }

  if (!user) {
    return null;
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));
    
    if (!hasAllowedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};