// Script de debug para investigar problema com leads
console.log('🔍 Iniciando debug do problema de leads...');

// Função para testar conexão Supabase
async function testSupabaseConnection() {
  try {
    console.log('📡 Testando conexão com Supabase...');
    
    // Verificar se supabase está disponível
    if (typeof window !== 'undefined' && window.supabase) {
      console.log('✅ Supabase encontrado no window');
    } else {
      console.log('❌ Supabase não encontrado no window');
      console.log('🔍 Verificando imports...');
      
      // Tentar acessar via módulo
      try {
        const { supabase } = await import('/src/integrations/supabase/client.js');
        console.log('✅ Supabase encontrado via import');
        window.supabase = supabase;
      } catch (error) {
        console.error('❌ Erro ao importar Supabase:', error);
      }
    }
    
    if (!window.supabase) {
      console.log('❌ Supabase não disponível');
      return;
    }
    
    // Testar autenticação
    console.log('🔐 Testando autenticação...');
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError);
      return;
    }
    
    if (!user) {
      console.log('❌ Usuário não autenticado');
      return;
    }
    
    console.log('✅ Usuário autenticado:', user.email);
    
    // Testar consulta simples
    console.log('📊 Testando consulta simples...');
    const { data: simpleData, error: simpleError } = await window.supabase
      .from('leads')
      .select('count(*)')
      .single();
    
    if (simpleError) {
      console.error('❌ Erro na consulta simples:', simpleError);
    } else {
      console.log('✅ Consulta simples funcionou. Total de leads:', simpleData?.count || 0);
    }
    
    // Testar consulta com filtro por user_id
    console.log('👤 Testando consulta por user_id...');
    const { data: userData, error: userError } = await window.supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .limit(5);
    
    if (userError) {
      console.error('❌ Erro na consulta por user_id:', userError);
    } else {
      console.log('✅ Consulta por user_id funcionou. Leads encontrados:', userData?.length || 0);
      if (userData?.length > 0) {
        console.log('📋 Primeiro lead:', userData[0]);
      }
    }
    
    // Testar consulta sem filtros (para gerentes)
    console.log('👨‍💼 Testando consulta sem filtros (gerente)...');
    const { data: allData, error: allError } = await window.supabase
      .from('leads')
      .select('*')
      .limit(5);
    
    if (allError) {
      console.error('❌ Erro na consulta sem filtros:', allError);
    } else {
      console.log('✅ Consulta sem filtros funcionou. Leads encontrados:', allData?.length || 0);
      if (allData?.length > 0) {
        console.log('📋 Primeiro lead:', allData[0]);
      }
    }
    
    // Testar políticas RLS
    console.log('🛡️ Testando políticas RLS...');
    const { data: policiesData, error: policiesError } = await window.supabase
      .rpc('is_gerente', { user_uuid: user.id });
    
    if (policiesError) {
      console.error('❌ Erro ao verificar função is_gerente:', policiesError);
    } else {
      console.log('✅ Função is_gerente retornou:', policiesData);
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testSupabaseConnection();

// Adicionar função global para testes manuais
window.debugLeads = testSupabaseConnection;





