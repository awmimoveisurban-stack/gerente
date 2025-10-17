import { supabase } from '@/integrations/supabase/client';

/**
 * Sistema de autenticação simplificado para teste
 * Funciona apenas com email, sem depender de colunas que podem não existir
 */

export const simpleAuthLogin = async (email: string, password: string) => {
  console.log('🔐 Tentando login simplificado:', email);
  
  try {
    // Buscar usuário apenas por email (sem senha por enquanto)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('ativo', true)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar usuário:', profileError);
      return {
        success: false,
        error: `Erro ao buscar usuário: ${profileError.message}`,
      };
    }

    if (!profiles) {
      console.log('❌ Usuário não encontrado');
      return {
        success: false,
        error: 'Usuário não encontrado',
      };
    }

    console.log('✅ Usuário encontrado:', profiles);

    // Por enquanto, aceitar qualquer senha para usuários existentes
    // TODO: Implementar verificação de senha quando a coluna senha existir
    
    // Verificar se tem cargo de gerente
    if (profiles.cargo === 'gerente') {
      console.log('✅ Login de gerente bem-sucedido');
      return {
        success: true,
        user: {
          id: profiles.id,
          email: profiles.email,
          nome: profiles.nome || profiles.full_name || 'Admin',
          cargo: profiles.cargo,
          ativo: profiles.ativo,
          created_at: profiles.created_at,
          permissions: [
            'leads:read:all',
            'leads:write:all',
            'leads:delete:all',
            'users:read:all',
            'users:write:all',
            'users:delete:all',
            'reports:read:all',
            'settings:write',
            'audit:read',
          ],
        },
      };
    } else {
      console.log('❌ Usuário não é gerente');
      return {
        success: false,
        error: 'Acesso negado. Apenas gerentes podem fazer login.',
      };
    }

  } catch (error) {
    console.error('❌ Erro inesperado no login:', error);
    return {
      success: false,
      error: `Erro inesperado: ${error}`,
    };
  }
};

/**
 * Função para criar um gerente simples (sem senha hash)
 */
export const createSimpleGerente = async () => {
  console.log('🚀 Criando gerente simples...');
  
  try {
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'cursos360.click@gmail.com')
      .single();

    if (existing) {
      console.log('✅ Gerente já existe');
      return { success: true, message: 'Gerente já existe' };
    }

    // Criar gerente com estrutura mínima (sem ID para deixar o banco gerar)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          email: 'cursos360.click@gmail.com',
          nome: 'Admin Gerente',
          cargo: 'gerente',
          ativo: true,
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Erro ao criar gerente:', profileError);
      return { success: false, error: profileError };
    }

    console.log('✅ Gerente criado:', profile);

    // Criar role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([
        {
          user_id: profile.id,
          role: 'gerente',
        }
      ]);

    if (roleError) {
      console.error('❌ Erro ao criar role:', roleError);
    }

    return { success: true, data: profile };
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return { success: false, error };
  }
};
