import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ✅ Interface completa exportada
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  nome?: string;
  cargo?: string;
  telefone?: string;
  login_nome?: string; // ✅ Nome de login para corretores
  senha?: string; // ✅ Senha para corretores
  created_at?: string;
  ativo?: boolean;
  performance?: {
    leadsTotal: number;
    vendasFechadas: number;
    taxaConversao: number;
    valorVendido: number;
  };
  user_id?: string;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) {
        console.error('Erro ao buscar profiles:', error);
        setProfiles([]);
      } else {
        // Mapear full_name para nome (compatibilidade)
        const mappedData = (data || []).map(p => ({
          ...p,
          nome: p.full_name,
        }));
        setProfiles(mappedData);
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar profiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // ✅ Métodos CRUD
  const createProfile = useCallback(
    async (profileData: Partial<Profile>) => {
      try {
        if (!profileData?.nome && !profileData?.full_name) {
          throw new Error('Nome é obrigatório para criar um membro');
        }

        if (!profileData?.login_nome) {
          throw new Error('Nome de login é obrigatório para corretores');
        }

        if (!profileData?.email) {
          throw new Error('Email é obrigatório para corretores');
        }

        if (!profileData?.senha) {
          throw new Error('Senha é obrigatória para corretores');
        }

        // ✅ Nova estratégia: Criar profile com login/senha próprios
        const nome = profileData.nome || profileData.full_name || '';
        const loginNome = profileData.login_nome || '';
        const senha = profileData.senha || '';
        const email = profileData.email || '';
        
        // Gerar ID único para o profile
        const profileId = crypto.randomUUID();

        // ✅ Criar profile diretamente na tabela profiles
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: profileId,
              email: email,
              full_name: nome,
              nome: nome,
              login_nome: loginNome,
              senha: senha, // ✅ Senha será armazenada (em produção, usar hash)
              cargo: profileData.cargo || 'corretor',
              telefone: profileData.telefone || '',
              ativo: true,
              created_at: new Date().toISOString(),
            } as any,
          ])
          .select()
          .single();

        if (profileError) throw profileError;

        // ✅ Vincular role diretamente
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ 
            user_id: profileId, 
            role: profileData.cargo || 'corretor' 
          }]);

        if (roleError) throw roleError;

        toast({
          title: '✅ Membro Adicionado',
          description: `${nome} foi adicionado à equipe com login: ${loginNome}`,
        });

        await fetchProfiles();
        return { data: newProfile, error: null };
      } catch (error: any) {
        console.error('Erro ao criar profile:', error);
        toast({
          title: '❌ Erro ao Adicionar Membro',
          description: error.message || 'Ocorreu um erro ao adicionar o membro à equipe.',
          variant: 'destructive',
        });
        return { data: null, error };
      }
    },
    [fetchProfiles, toast]
  );

  const updateProfile = useCallback(
    async (id: string, updates: Partial<Profile>) => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: updates.nome || updates.full_name,
            // Adicione outros campos conforme necessário
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: '✅ Perfil Atualizado',
          description: 'As alterações foram salvas!',
        });

        await fetchProfiles();
        return { error: null };
      } catch (error: any) {
        console.error('Erro ao atualizar profile:', error);
        toast({
          title: '❌ Erro ao Atualizar',
          description: error.message || 'Ocorreu um erro.',
          variant: 'destructive',
        });
        return { error };
      }
    },
    [fetchProfiles, toast]
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);

        if (error) throw error;

        toast({
          title: '✅ Perfil Removido',
          description: 'O perfil foi removido com sucesso!',
        });

        await fetchProfiles();
        return { error: null };
      } catch (error: any) {
        console.error('Erro ao deletar profile:', error);
        toast({
          title: '❌ Erro ao Remover',
          description: error.message || 'Ocorreu um erro.',
          variant: 'destructive',
        });
        return { error };
      }
    },
    [fetchProfiles, toast]
  );

  const toggleProfileStatus = useCallback(
    async (id: string) => {
      try {
        // Buscar status atual
        const profile = profiles.find(p => p.id === id);
        if (!profile) throw new Error('Perfil não encontrado');

        const { error } = await supabase
          .from('profiles')
          .update({ ativo: !profile.ativo })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: '✅ Status Alterado',
          description: `Perfil ${profile.ativo ? 'desativado' : 'ativado'} com sucesso!`,
        });

        await fetchProfiles();
        return { error: null };
      } catch (error: any) {
        console.error('Erro ao alterar status:', error);
        toast({
          title: '❌ Erro ao Alterar Status',
          description: error.message || 'Ocorreu um erro.',
          variant: 'destructive',
        });
        return { error };
      }
    },
    [profiles, fetchProfiles, toast]
  );

  const refetch = useCallback(async () => {
    await fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    toggleProfileStatus,
    refetch,
  };
}
