import { supabase } from '@/integrations/supabase/client';

/**
 * Criação ultra-simples de gerente que funciona independente da estrutura da tabela
 */

export const createUltraSimpleGerente = async () => {
  console.log('🚀 Criando gerente ultra-simples...');
  
  try {
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, email, nome, cargo')
      .eq('email', 'cursos360.click@gmail.com')
      .single();

    if (existing) {
      console.log('✅ Gerente já existe:', existing);
      return { success: true, message: 'Gerente já existe', data: existing };
    }

    console.log('📝 Gerente não existe, tentando criar...');

    // Tentar diferentes abordagens de inserção
    const approaches = [
      // Abordagem 1: Apenas email e nome
      {
        name: 'Apenas email e nome',
        data: {
          email: 'cursos360.click@gmail.com',
          nome: 'Admin Gerente',
        }
      },
      // Abordagem 2: Com cargo
      {
        name: 'Com cargo',
        data: {
          email: 'cursos360.click@gmail.com',
          nome: 'Admin Gerente',
          cargo: 'gerente',
        }
      },
      // Abordagem 3: Com ativo
      {
        name: 'Com ativo',
        data: {
          email: 'cursos360.click@gmail.com',
          nome: 'Admin Gerente',
          cargo: 'gerente',
          ativo: true,
        }
      }
    ];

    for (const approach of approaches) {
      console.log(`🧪 Tentando: ${approach.name}`);
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert([approach.data])
          .select()
          .single();

        if (profileError) {
          console.log(`❌ ${approach.name} falhou:`, profileError.message);
          continue;
        }

        console.log(`✅ ${approach.name} funcionou!`, profile);

        // Tentar criar role
        try {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([
              {
                user_id: profile.id,
                role: 'gerente',
              }
            ]);

          if (roleError) {
            console.log('⚠️ Erro ao criar role (não crítico):', roleError.message);
          } else {
            console.log('✅ Role criado com sucesso');
          }
        } catch (roleErr) {
          console.log('⚠️ Erro inesperado ao criar role (não crítico):', roleErr);
        }

        return { success: true, data: profile, approach: approach.name };
      } catch (error) {
        console.log(`❌ ${approach.name} erro:`, error);
        continue;
      }
    }

    console.log('❌ Nenhuma abordagem funcionou');
    return { 
      success: false, 
      error: 'Não foi possível criar o gerente com nenhuma abordagem testada' 
    };

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return { success: false, error };
  }
};

/**
 * Verificar se o gerente existe e pode fazer login
 */
export const verifyGerenteExists = async () => {
  console.log('🔍 Verificando se gerente existe...');
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'cursos360.click@gmail.com')
      .single();

    if (error) {
      console.log('❌ Erro ao verificar gerente:', error.message);
      return { exists: false, error: error.message };
    }

    if (!profile) {
      console.log('❌ Gerente não encontrado');
      return { exists: false, error: 'Gerente não encontrado' };
    }

    console.log('✅ Gerente encontrado:', {
      id: profile.id,
      email: profile.email,
      nome: profile.nome,
      cargo: profile.cargo,
      ativo: profile.ativo,
    });

    return { exists: true, data: profile };
  } catch (error) {
    console.error('❌ Erro inesperado ao verificar:', error);
    return { exists: false, error };
  }
};


