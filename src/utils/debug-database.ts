import { supabase } from '@/integrations/supabase/client';

/**
 * Função para descobrir a estrutura real da tabela profiles
 */
export const debugProfilesTable = async () => {
  console.log('🔍 Debugando estrutura da tabela profiles...');
  
  // Tentar diferentes combinações mínimas
  const testCases = [
    // Caso 1: Apenas email
    {
      name: 'Apenas email',
      data: { email: 'test1@example.com' }
    },
    // Caso 2: Email + nome
    {
      name: 'Email + nome',
      data: { email: 'test2@example.com', nome: 'Test User 2' }
    },
    // Caso 3: Email + id (sem user_id)
    {
      name: 'Email + id',
      data: { id: crypto.randomUUID(), email: 'test3@example.com' }
    },
    // Caso 4: Email + user_id (sem id)
    {
      name: 'Email + user_id',
      data: { user_id: crypto.randomUUID(), email: 'test4@example.com' }
    },
    // Caso 5: Todos os campos básicos
    {
      name: 'Campos básicos',
      data: { 
        id: crypto.randomUUID(), 
        user_id: crypto.randomUUID(), 
        email: 'test5@example.com', 
        nome: 'Test User 5' 
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 Testando: ${testCase.name}`);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([testCase.data])
        .select()
        .single();

      if (error) {
        console.log(`❌ ${testCase.name} falhou:`, error.message);
      } else {
        console.log(`✅ ${testCase.name} funcionou!`, data);
        
        // Limpar o registro de teste
        await supabase
          .from('profiles')
          .delete()
          .eq('id', data.id);
        
        return { success: true, workingStructure: testCase, data };
      }
    } catch (err) {
      console.log(`❌ ${testCase.name} erro:`, err);
    }
  }
  
  console.log('❌ Nenhuma estrutura funcionou');
  return { success: false, error: 'Nenhuma estrutura de tabela funcionou' };
};

/**
 * Função para criar gerente usando a estrutura que funciona
 */
export const createGerenteWithWorkingStructure = async () => {
  const debugResult = await debugProfilesTable();
  
  if (!debugResult.success) {
    return { success: false, error: 'Não foi possível determinar estrutura da tabela' };
  }
  
  console.log('✅ Usando estrutura que funciona:', debugResult.workingStructure);
  
  // Criar gerente usando a estrutura que funciona
  const gerenteData = {
    email: 'cursos360.click@gmail.com',
    nome: 'Admin Gerente',
    cargo: 'gerente',
    ativo: true,
  };
  
  // Adicionar campos da estrutura que funciona
  if (debugResult.workingStructure.data.id !== undefined) {
    (gerenteData as any).id = crypto.randomUUID();
  }
  if (debugResult.workingStructure.data.user_id !== undefined) {
    (gerenteData as any).user_id = (gerenteData as any).id || crypto.randomUUID();
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([gerenteData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar gerente:', error);
      return { success: false, error };
    }

    console.log('✅ Gerente criado com sucesso:', data);
    
    // Criar role do gerente
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert([{ 
        user_id: data.id, 
        role: 'gerente' 
      }]);

    if (roleError) {
      console.error('❌ Erro ao criar role do gerente:', roleError);
      return { success: false, error: roleError };
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return { success: false, error };
  }
};


