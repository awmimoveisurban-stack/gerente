import { supabase } from '@/integrations/supabase/client';

// ✅ Dados do gerente de teste
const gerenteTeste = {
  nome: 'Admin Gerente',
  login_nome: 'admin',
  senha: 'Ac@130204@',
  email: 'cursos360.click@gmail.com',
  telefone: '(11) 99999-0000',
  cargo: 'gerente',
  ativo: true,
};

export const createTestGerente = async () => {
  console.log('🚀 Criando gerente de teste...');
  
  try {
    // Gerar ID único para o profile
    const profileId = crypto.randomUUID();
    
    console.log(`📝 Criando gerente: ${gerenteTeste.nome} (${gerenteTeste.login_nome})`);
    
    // ✅ Criar profile do gerente (tentando inserção mínima)
    let profileError = null;
    let profile = null;
    
    // Tentativa 1: Apenas id e email (mínimo absoluto)
    try {
      const result1 = await supabase
        .from('profiles')
        .insert([
          {
            id: profileId,
            email: gerenteTeste.email,
          }
        ])
        .select()
        .single();
      
      if (result1.error) {
        console.log('❌ Tentativa 1 falhou:', result1.error.message);
        
        // Tentativa 2: Com user_id
        const result2 = await supabase
          .from('profiles')
          .insert([
            {
              id: profileId,
              user_id: profileId,
              email: gerenteTeste.email,
            }
          ])
          .select()
          .single();
        
        if (result2.error) {
          console.log('❌ Tentativa 2 falhou:', result2.error.message);
          
          // Tentativa 3: Sem id, deixar o banco gerar
          const result3 = await supabase
            .from('profiles')
            .insert([
              {
                email: gerenteTeste.email,
                nome: gerenteTeste.nome,
              }
            ])
            .select()
            .single();
          
          profile = result3.data;
          profileError = result3.error;
        } else {
          profile = result2.data;
          profileError = result2.error;
        }
      } else {
        profile = result1.data;
        profileError = result1.error;
      }
    } catch (error) {
      profileError = error;
    }

    if (profileError) {
      console.error(`❌ Erro ao criar profile do gerente:`, profileError);
      return { success: false, error: profileError };
    }

    // ✅ Criar role do gerente
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{ 
        user_id: profileId, 
        role: 'gerente' 
      }]);

    if (roleError) {
      console.error(`❌ Erro ao criar role do gerente:`, roleError);
      return { success: false, error: roleError };
    }

    console.log(`✅ Gerente ${gerenteTeste.nome} criado com sucesso!`);
    
    return {
      success: true,
      nome: gerenteTeste.nome,
      login_nome: gerenteTeste.login_nome,
      senha: gerenteTeste.senha,
      email: gerenteTeste.email,
    };

  } catch (error) {
    console.error(`❌ Erro inesperado ao criar gerente:`, error);
    return { success: false, error };
  }
};

// ✅ Função para verificar se o gerente já existe
export const checkGerenteExists = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('cargo', 'gerente')
      .eq('email', 'cursos360.click@gmail.com')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Erro ao verificar gerente existente:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('❌ Erro inesperado ao verificar gerente:', error);
    return false;
  }
};
