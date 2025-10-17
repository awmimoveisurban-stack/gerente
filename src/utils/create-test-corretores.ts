import { supabase } from '@/integrations/supabase/client';

// ✅ Dados fictícios de corretores para teste
const corretoresTeste = [
  {
    nome: 'João Silva Santos',
    login_nome: 'joao.silva',
    senha: '1234',
    email: 'joao.silva@imobiliaria.com',
    telefone: '(11) 99999-1111',
    cargo: 'corretor',
    ativo: true,
  },
  {
    nome: 'Maria Oliveira Costa',
    login_nome: 'maria.oliveira',
    senha: '1234',
    email: 'maria.oliveira@imobiliaria.com',
    telefone: '(11) 99999-2222',
    cargo: 'corretor',
    ativo: true,
  },
  {
    nome: 'Pedro Rodrigues Lima',
    login_nome: 'pedro.rodrigues',
    senha: '1234',
    email: 'pedro.rodrigues@imobiliaria.com',
    telefone: '(11) 99999-3333',
    cargo: 'corretor',
    ativo: true,
  },
  {
    nome: 'Ana Paula Ferreira',
    login_nome: 'ana.paula',
    senha: '1234',
    email: 'ana.paula@imobiliaria.com',
    telefone: '(11) 99999-4444',
    cargo: 'corretor',
    ativo: true,
  },
  {
    nome: 'Carlos Eduardo Santos',
    login_nome: 'carlos.eduardo',
    senha: '1234',
    email: 'carlos.eduardo@imobiliaria.com',
    telefone: '(11) 99999-5555',
    cargo: 'corretor',
    ativo: true,
  },
];

export const createTestCorretores = async () => {
  console.log('🚀 Criando corretores fictícios para teste...');
  
  // ✅ Buscar o ID do gerente cursos30.click@gmail.com
  let gerenteId = null;
  try {
    const { data: gerente, error: gerenteError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'cursos360.click@gmail.com')
      .eq('cargo', 'gerente')
      .single();

    if (gerenteError) {
      console.error('❌ Erro ao buscar gerente:', gerenteError);
      console.log('⚠️ Criando leads sem vínculo com gerente');
    } else {
      gerenteId = gerente.id;
      console.log('✅ Gerente encontrado, vinculando leads ao ID:', gerenteId);
    }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar gerente:', error);
  }
  
  const results = [];
  
  for (const corretorData of corretoresTeste) {
    try {
      // Gerar ID único para o profile
      const profileId = crypto.randomUUID();
      
      console.log(`📝 Criando corretor: ${corretorData.nome} (${corretorData.login_nome})`);
      
      // ✅ Criar profile (usando apenas colunas básicas)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: profileId,
            user_id: profileId, // ✅ Usar o mesmo ID como user_id
            email: corretorData.email,
            nome: corretorData.nome,
            cargo: corretorData.cargo,
            ativo: corretorData.ativo,
          } as any,
        ])
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Erro ao criar profile ${corretorData.nome}:`, profileError);
        continue;
      }

      // ✅ Criar role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: profileId, 
          role: 'corretor' 
        }]);

      if (roleError) {
        console.error(`❌ Erro ao criar role ${corretorData.nome}:`, roleError);
        continue;
      }

      // ✅ Criar alguns leads fictícios para cada corretor
      const leadsFicticios = [
        {
          nome: `Cliente ${Math.floor(Math.random() * 100)}`,
          telefone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
          email: `cliente${Math.floor(Math.random() * 100)}@email.com`,
          origem: ['whatsapp', 'site', 'indicacao', 'manual'][Math.floor(Math.random() * 4)],
          status: ['novo', 'contato_iniciado', 'qualificado', 'proposta_enviada'][Math.floor(Math.random() * 4)],
          valor_interesse: Math.floor(Math.random() * 500000) + 200000,
          tipo_imovel: ['apartamento', 'casa', 'terreno'][Math.floor(Math.random() * 3)],
          observacoes: `Lead criado para teste - corretor ${corretorData.nome}`,
        }
      ];

      for (const leadData of leadsFicticios) {
        try {
          const { error: leadError } = await supabase
            .from('leads')
            .insert([
              {
                id: crypto.randomUUID(),
                user_id: gerenteId || profileId, // ✅ Vincular ao gerente se disponível
                corretor: profileId, // ✅ Manter o corretor responsável
                nome: leadData.nome,
                telefone: leadData.telefone,
                email: leadData.email,
                imovel_interesse: leadData.tipo_imovel, // ✅ Usar coluna correta
                status: leadData.status,
                valor_interesse: leadData.valor_interesse,
                observacoes: leadData.observacoes + (gerenteId ? ' - Vinculado ao gerente cursos360.click@gmail.com' : ''),
                data_entrada: new Date().toISOString(),
                ultima_interacao: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as any,
            ]);

          if (leadError) {
            console.error(`❌ Erro ao criar lead para ${corretorData.nome}:`, leadError);
          } else {
            console.log(`✅ Lead criado para ${corretorData.nome}`);
          }
        } catch (leadErr) {
          console.error(`❌ Erro inesperado ao criar lead para ${corretorData.nome}:`, leadErr);
        }
      }

      results.push({
        success: true,
        nome: corretorData.nome,
        login_nome: corretorData.login_nome,
        senha: corretorData.senha,
      });

      console.log(`✅ Corretor ${corretorData.nome} criado com sucesso!`);
      
    } catch (error) {
      console.error(`❌ Erro inesperado ao criar ${corretorData.nome}:`, error);
      results.push({
        success: false,
        nome: corretorData.nome,
        error: error,
      });
    }
  }

  console.log('🎉 Processo de criação de corretores concluído!');
  console.log('📋 Resumo dos corretores criados:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.nome} - Login: ${result.login_nome} - Senha: ${result.senha}`);
    } else {
      console.log(`❌ ${result.nome} - Erro: ${result.error}`);
    }
  });

  return results;
};

// ✅ Função para limpar dados de teste (opcional)
export const clearTestData = async () => {
  console.log('🧹 Limpando dados de teste...');
  
  try {
    // Deletar leads de teste
    const { error: leadsError } = await supabase
      .from('leads')
      .delete()
      .like('observacoes', '%Lead criado para teste%');

    if (leadsError) {
      console.error('❌ Erro ao limpar leads de teste:', leadsError);
    } else {
      console.log('✅ Leads de teste removidos');
    }

    // Deletar roles de teste
    const { error: rolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('role', 'corretor');

    if (rolesError) {
      console.error('❌ Erro ao limpar roles de teste:', rolesError);
    } else {
      console.log('✅ Roles de teste removidos');
    }

    // Deletar profiles de teste
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .eq('cargo', 'corretor');

    if (profilesError) {
      console.error('❌ Erro ao limpar profiles de teste:', profilesError);
    } else {
      console.log('✅ Profiles de teste removidos');
    }

    console.log('🎉 Dados de teste limpos com sucesso!');
  } catch (error) {
    console.error('❌ Erro inesperado ao limpar dados de teste:', error);
  }
};
