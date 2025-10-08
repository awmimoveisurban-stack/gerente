// TESTE BASICO DE LOGIN
// Execute este script no console do navegador

async function testBasicLogin() {
  console.log('TESTE BASICO DE LOGIN');
  console.log('---');

  try {
    // Verificar se supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('ERRO: Supabase nao carregado');
      return;
    }
    console.log('OK: Supabase carregado');

    // Testar login do corretor
    console.log('\nTestando login do corretor...');
    console.log('Email: corretor@imobiliaria.com');
    console.log('Senha: 12345678');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'corretor@imobiliaria.com',
      password: '12345678'
    });

    if (error) {
      console.error('ERRO no login:', error.message);
      console.log('Codigo do erro:', error.status);
      return;
    }

    console.log('OK: Login realizado com sucesso!');
    console.log('Usuario:', data.user.email);
    console.log('ID:', data.user.id);

    // Verificar roles
    console.log('\nVerificando roles...');
    
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id);

    if (rolesError) {
      console.error('ERRO ao buscar roles:', rolesError);
    } else {
      console.log('OK: Roles encontradas:', roles.map(r => r.role));
    }

    // Verificar leads
    console.log('\nVerificando leads...');
    
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', data.user.id);

    if (leadsError) {
      console.error('ERRO ao buscar leads:', leadsError);
    } else {
      console.log('OK:', leads.length, 'leads encontrados');
    }

    console.log('\nLOGIN FUNCIONANDO PERFEITAMENTE!');

  } catch (error) {
    console.error('ERRO geral:', error);
  }
}

// Executar teste
testBasicLogin();





