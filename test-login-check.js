// TESTE DE LOGIN COM VERIFICACAO DE CONTEXTO
// Execute este script no console do navegador

async function testLoginWithCheck() {
  console.log('TESTE DE LOGIN COM VERIFICACAO');
  console.log('---');

  try {
    // 1. Verificar se estamos na página correta
    console.log('URL atual:', window.location.href);
    console.log('Dominio:', window.location.hostname);
    
    if (!window.location.hostname.includes('localhost') && 
        !window.location.hostname.includes('127.0.0.1') && 
        !window.location.hostname.includes('supabase')) {
      console.log('AVISO: Voce pode nao estar na pagina correta');
    }

    // 2. Verificar se Supabase está disponível
    console.log('\nVerificando Supabase...');
    
    if (typeof supabase !== 'undefined') {
      console.log('OK: Supabase carregado via import');
    } else if (window.supabase) {
      console.log('OK: Supabase encontrado em window.supabase');
      // Usar window.supabase se disponível
      window.supabase = window.supabase;
    } else {
      console.log('ERRO: Supabase nao encontrado');
      console.log('Verifique se voce esta na pagina da aplicacao');
      console.log('Tente recarregar a pagina e executar novamente');
      return;
    }

    // 3. Testar login do corretor
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
        console.log('\nSOLUCAO: Execute o script SQL para corrigir as credenciais');
        console.log('Arquivo: fix-invalid-credentials.sql');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('\nSOLUCAO: Execute o script SQL para confirmar o email');
        console.log('Arquivo: setup-corretor-complete.sql');
      } else if (error.message.includes('400')) {
        console.log('\nSOLUCAO: Erro 400 - Execute o script SQL para recriar o usuario');
        console.log('Arquivo: fix-invalid-credentials.sql');
      }
      return;
    }

    console.log('OK: Login realizado com sucesso!');
    console.log('Usuario:', data.user.email);
    console.log('ID:', data.user.id);
    console.log('Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Nao');

    // 4. Verificar roles
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

    // 5. Verificar leads
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
    console.log('Agora voce pode testar manualmente na pagina de login');

  } catch (error) {
    console.error('ERRO geral:', error);
    console.log('\nPOSSIVEIS SOLUCOES:');
    console.log('1. Recarregue a pagina e tente novamente');
    console.log('2. Execute o script SQL para corrigir o usuario');
    console.log('3. Verifique se esta na pagina correta da aplicacao');
  }
}

// Executar teste
testLoginWithCheck();





