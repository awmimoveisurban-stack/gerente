// TESTE DE LOGIN COM ESPERA DO SUPABASE
// Execute este script no console do navegador

async function waitForSupabase() {
  console.log('Aguardando Supabase carregar...');
  
  // Aguardar até 10 segundos
  for (let i = 0; i < 100; i++) {
    if (typeof supabase !== 'undefined') {
      console.log('OK: Supabase carregado!');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('ERRO: Supabase nao carregou apos 10 segundos');
  return false;
}

async function testLoginWithWait() {
  console.log('TESTE DE LOGIN COM ESPERA');
  console.log('---');

  try {
    // Aguardar Supabase carregar
    const supabaseLoaded = await waitForSupabase();
    if (!supabaseLoaded) {
      console.log('Tentando carregar Supabase manualmente...');
      
      // Tentar acessar supabase de outras formas
      if (window.supabase) {
        console.log('OK: Supabase encontrado em window.supabase');
      } else if (window.__supabase) {
        console.log('OK: Supabase encontrado em window.__supabase');
      } else {
        console.log('ERRO: Supabase nao encontrado em nenhum lugar');
        console.log('Verifique se voce esta na pagina correta');
        return;
      }
    }

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
      
      // Verificar tipos de erro
      if (error.message.includes('Invalid login credentials')) {
        console.log('Credenciais invalidas - execute o script SQL para corrigir');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('Email nao confirmado - execute o script SQL para confirmar');
      }
      return;
    }

    console.log('OK: Login realizado com sucesso!');
    console.log('Usuario:', data.user.email);
    console.log('ID:', data.user.id);
    console.log('Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Nao');

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
testLoginWithWait();





