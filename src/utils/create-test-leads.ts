import { supabase } from '@/integrations/supabase/client';

// ✅ Dados de leads fictícios para teste
const leadsTeste = [
  {
    nome: 'Carlos Silva Santos',
    telefone: '(11) 99999-1111',
    email: 'carlos.silva@email.com',
    origem: 'whatsapp',
    status: 'novo',
    valor_interesse: 350000,
    tipo_imovel: 'apartamento',
    observacoes: 'Lead de teste - interessado em apartamento 2 quartos',
  },
  {
    nome: 'Ana Maria Oliveira',
    telefone: '(11) 99999-2222',
    email: 'ana.maria@email.com',
    origem: 'site',
    status: 'contato_iniciado',
    valor_interesse: 280000,
    tipo_imovel: 'casa',
    observacoes: 'Lead de teste - procura casa térrea',
  },
  {
    nome: 'Pedro Rodrigues Lima',
    telefone: '(11) 99999-3333',
    email: 'pedro.rodrigues@email.com',
    origem: 'indicacao',
    status: 'qualificado',
    valor_interesse: 450000,
    tipo_imovel: 'apartamento',
    observacoes: 'Lead de teste - interessado em apartamento 3 quartos',
  },
  {
    nome: 'Maria Fernanda Costa',
    telefone: '(11) 99999-4444',
    email: 'maria.fernanda@email.com',
    origem: 'manual',
    status: 'proposta_enviada',
    valor_interesse: 320000,
    tipo_imovel: 'casa',
    observacoes: 'Lead de teste - aguardando resposta da proposta',
  },
  {
    nome: 'João Carlos Ferreira',
    telefone: '(11) 99999-5555',
    email: 'joao.carlos@email.com',
    origem: 'whatsapp',
    status: 'novo',
    valor_interesse: 180000,
    tipo_imovel: 'terreno',
    observacoes: 'Lead de teste - interessado em terreno para construção',
  },
  {
    nome: 'Lucia Helena Santos',
    telefone: '(11) 99999-6666',
    email: 'lucia.helena@email.com',
    origem: 'site',
    status: 'contato_iniciado',
    valor_interesse: 420000,
    tipo_imovel: 'apartamento',
    observacoes: 'Lead de teste - procura apartamento com varanda',
  },
  {
    nome: 'Roberto Alves Silva',
    telefone: '(11) 99999-7777',
    email: 'roberto.alves@email.com',
    origem: 'indicacao',
    status: 'qualificado',
    valor_interesse: 550000,
    tipo_imovel: 'casa',
    observacoes: 'Lead de teste - interessado em casa com piscina',
  },
  {
    nome: 'Fernanda Oliveira Lima',
    telefone: '(11) 99999-8888',
    email: 'fernanda.oliveira@email.com',
    origem: 'manual',
    status: 'novo',
    valor_interesse: 290000,
    tipo_imovel: 'apartamento',
    observacoes: 'Lead de teste - primeira visita agendada',
  },
];

export const createTestLeads = async () => {
  console.log('🚀 Criando leads fictícios para teste...');
  
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
      console.log('⚠️ Não foi possível vincular leads ao gerente');
      return { success: false, error: 'Gerente não encontrado' };
    } else {
      gerenteId = gerente.id;
      console.log('✅ Gerente encontrado, vinculando leads ao ID:', gerenteId);
    }
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar gerente:', error);
    return { success: false, error: 'Erro ao buscar gerente' };
  }
  
  const results = [];
  
  for (const leadData of leadsTeste) {
    try {
      console.log(`📝 Criando lead: ${leadData.nome}`);
      
      const { error: leadError } = await supabase
        .from('leads')
        .insert([
          {
            id: crypto.randomUUID(),
            user_id: gerenteId, // ✅ Vincular ao gerente
            corretor: gerenteId, // ✅ Gerente como corretor responsável também
            nome: leadData.nome,
            telefone: leadData.telefone,
            email: leadData.email,
            imovel_interesse: leadData.tipo_imovel, // ✅ Usar coluna correta
            status: leadData.status,
            valor_interesse: leadData.valor_interesse,
            observacoes: leadData.observacoes + ' - Vinculado ao gerente cursos360.click@gmail.com',
            data_entrada: new Date().toISOString(),
            ultima_interacao: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any,
        ]);

      if (leadError) {
        console.error(`❌ Erro ao criar lead ${leadData.nome}:`, leadError);
        results.push({
          success: false,
          nome: leadData.nome,
          error: leadError,
        });
      } else {
        console.log(`✅ Lead ${leadData.nome} criado com sucesso`);
        results.push({
          success: true,
          nome: leadData.nome,
          telefone: leadData.telefone,
          email: leadData.email,
        });
      }
    } catch (error) {
      console.error(`❌ Erro inesperado ao criar lead ${leadData.nome}:`, error);
      results.push({
        success: false,
        nome: leadData.nome,
        error: error,
      });
    }
  }

  console.log('🎉 Processo de criação de leads concluído!');
  console.log('📋 Resumo dos leads criados:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.nome} - ${result.telefone} - ${result.email}`);
    } else {
      console.log(`❌ ${result.nome} - Erro: ${result.error}`);
    }
  });

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  return {
    success: successCount > 0,
    results,
    summary: {
      total: results.length,
      success: successCount,
      errors: errorCount,
    },
  };
};

// ✅ Função para limpar leads de teste
export const clearTestLeads = async () => {
  console.log('🧹 Limpando leads de teste...');
  
  try {
    const { error: leadsError } = await supabase
      .from('leads')
      .delete()
      .like('observacoes', '%Vinculado ao gerente cursos360.click@gmail.com%');

    if (leadsError) {
      console.error('❌ Erro ao limpar leads de teste:', leadsError);
      return { success: false, error: leadsError };
    } else {
      console.log('✅ Leads de teste removidos');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Erro inesperado ao limpar leads de teste:', error);
    return { success: false, error };
  }
};
