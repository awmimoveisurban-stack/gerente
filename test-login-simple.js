// 🧪 TESTE SIMPLES DE LOGIN
// Execute este script no console do navegador

async function testLoginSimple() {
  console.log('🚀 TESTE SIMPLES DE LOGIN');
  console.log('---');

  try {
    // 1. Verificar se supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado');
      return;
    }
    console.log('✅ Supabase carregado');

    // 2. Testar login do corretor
    console.log('\n🔐 Testando login do corretor...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'corretor@imobiliaria.com',
      password: '12345678'
    });

    if (error) {
      console.error('❌ Erro no login:', error.message);
      console.log('Código do erro:', error.status);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('Usuário:', data.user.email);
    console.log('ID:', data.user.id);

    // 3. Verificar roles
    console.log('\n👤 Verificando roles...');
    
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id);

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
    } else {
      console.log('✅ Roles encontradas:', roles.map(r => r.role));
    }

    // 4. Verificar leads
    console.log('\n📊 Verificando leads...');
    
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', data.user.id);

    if (leadsError) {
      console.error('❌ Erro ao buscar leads:', leadsError);
    } else {
      console.log(`✅ ${leads.length} leads encontrados`);
    }

    console.log('\n🎉 LOGIN FUNCIONANDO PERFEITAMENTE!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testLoginSimple();





