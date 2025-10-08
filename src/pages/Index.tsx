// Redirect users based on auth status and role
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useUserRoles } from "@/hooks/use-user-roles";
import { GlobalLoading } from "@/components/global-loading";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasRole, loading: rolesLoading } = useUserRoles();
  const loading = authLoading || rolesLoading;
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on user role
        if (hasRole('gerente')) {
          navigate("/gerente", { replace: true });
        } else if (hasRole('corretor')) {
          navigate("/corretor", { replace: true });
        } else {
          navigate("/auth", { replace: true });
        }
      } else {
        navigate("/auth", { replace: true });
      }
    }
  }, [navigate, user, loading, hasRole]);

  return (
    <GlobalLoading 
      message={user ? "Carregando seu dashboard..." : "Redirecionando para o login..."} 
    />
  );
};

export default Index;
