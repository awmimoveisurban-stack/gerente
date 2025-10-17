import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/structured-logger';

const logger = createLogger('useCorretores');

export interface Corretor {
  user_id: string;
  email: string;
  nome: string;
  ativo?: boolean;
}

export const useCorretores = () => {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCorretores = useCallback(async () => {
    try {
      setLoading(true);
      logger.info('🔍 Buscando lista de corretores...');

      // Buscar corretores através de user_roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(
          `
          user_id,
          profiles(
            email,
            nome,
            ativo
          )
        `
        )
        .eq('role', 'corretor');

      if (rolesError) {
        logger.error(
          '❌ Erro ao buscar corretores via user_roles:',
          rolesError
        );

        // Fallback: buscar diretamente da tabela profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('email, nome, ativo')
          .eq('cargo', 'corretor');

        if (profilesError) {
          logger.error(
            '❌ Erro ao buscar corretores via profiles:',
            profilesError
          );
          setCorretores([]);
          return;
        }

        const corretoresFromProfiles = (profilesData || []).map(profile => ({
          user_id: profile.email, // Usar email como ID temporário
          email: profile.email,
          nome: profile.nome || profile.email,
          ativo: profile.ativo !== false,
        }));

        setCorretores(corretoresFromProfiles);
        logger.info(
          `✅ ${corretoresFromProfiles.length} corretores encontrados via profiles`
        );
        return;
      }

      // Processar dados de user_roles
      const corretoresFromRoles = (rolesData || [])
        .map(role => ({
          user_id: role.user_id,
          email: role.profiles.email,
          nome: role.profiles.nome || role.profiles.email,
          ativo: role.profiles.ativo !== false,
        }))
        .filter(corretor => corretor.email && corretor.nome); // Filtrar dados inválidos

      setCorretores(corretoresFromRoles);
      logger.info(
        `✅ ${corretoresFromRoles.length} corretores encontrados via user_roles`
      );
    } catch (error) {
      logger.error('❌ Erro inesperado ao buscar corretores:', error);
      setCorretores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCorretores();
  }, [fetchCorretores]);

  return {
    corretores,
    loading,
    refetch: fetchCorretores,
  };
};
