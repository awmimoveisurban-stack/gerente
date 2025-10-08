import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';

export type AppRole = 'corretor' | 'gerente';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const useUserRoles = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRoles = async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setRoles(data?.map(r => r.role) || []);
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isCorretor = hasRole('corretor');
  const isGerente = hasRole('gerente');

  useEffect(() => {
    fetchRoles();
  }, [user]);

  return {
    roles,
    loading,
    hasRole,
    isCorretor,
    isGerente,
    refetch: fetchRoles,
  };
};
