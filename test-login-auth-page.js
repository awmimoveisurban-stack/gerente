// TESTE DE LOGIN NA PAGINA DE AUTENTICACAO
// Execute este script no console do navegador na pagina /auth

async function testLoginOnAuthPage() {
  console.log('TESTE DE LOGIN NA PAGINA DE AUTENTICACAO');
  console.log('---');

  try {
    // 1. Verificar se estamos na página de auth
    console.log('URL atual:', window.location.href);
    console.log('Pagina:', window.location.pathname);
    
    if (!window.location.pathname.includes('/auth')) {
      console.log('AVISO: Voce nao esta na pagina de autenticacao');
      console.log('Vá para: http://127.0.0.1:3011/auth');
      return;
    }

    // 2. Aguardar a página carregar completamente
    console.log('\nAguardando pagina carregar completamente...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Verificar se Supabase está disponível
    console.log('\nVerificando Supabase...');
    
    let supabaseClient = null;
    
    // Tentar diferentes formas de acessar o Supabase
    if (typeof supabase !== 'undefined') {
      console.log('OK: Supabase carregado via import');
      supabaseClient = supabase;
    } else if (window.supabase) {
      console.log('OK: Supabase encontrado em window.supabase');
      supabaseClient = window.supabase;
    } else if (window.__supabase) {
      console.log('OK: Supabase encontrado em window.__supabase');
      supabaseClient = window.__supabase;
    } else {
      // Tentar acessar via React DevTools ou outros métodos
      console.log('Tentando acessar Supabase via React...');
      
      // Aguardar mais um pouco
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (typeof supabase !== 'undefined') {
        console.log('OK: Supabase carregado apos espera');
        supabaseClient = supabase;
      } else {
        console.log('ERRO: Supabase nao encontrado');
        console.log('\nSOLUCOES:');
        console.log('1. Recarregue a pagina (Ctrl+F5)');
        console.log('2. Aguarde a pagina carregar completamente');
        console.log('3. Execute o script novamente');
        console.log('4. Se persistir, execute o script SQL para corrigir o usuario');
        return;
      }
    }

    // 4. Testar login do corretor
    console.log('\nTestando login do corretor...');
    console.log('Email: corretor@imobiliaria.com');
    console.log('Senha: 12345678');
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
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
        console.log('Execute no Supabase Dashboard -> SQL Editor');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('\nSOLUCAO: Execute o script SQL para confirmar o email');
        console.log('Arquivo: setup-corretor-complete.sql');
        console.log('Execute no Supabase Dashboard -> SQL Editor');
      } else if (error.message.includes('400')) {
        console.log('\nSOLUCAO: Erro 400 - Execute o script SQL para recriar o usuario');
        console.log('Arquivo: fix-invalid-credentials.sql');
        console.log('Execute no Supabase Dashboard -> SQL Editor');
      }
      return;
    }

    console.log('OK: Login realizado com sucesso!');
    console.log('Usuario:', data.user.email);
    console.log('ID:', data.user.id);
    console.log('Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Nao');

    // 5. Verificar roles
    console.log('\nVerificando roles...');
    
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id);

    if (rolesError) {
      console.error('ERRO ao buscar roles:', rolesError);
    } else {
      console.log('OK: Roles encontradas:', roles.map(r => r.role));
    }

    // 6. Verificar leads
    console.log('\nVerificando leads...');
    
    const { data: leads, error: leadsError } = await supabaseClient
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
    console.log('Ou aguarde o redirecionamento automatico');

  } catch (error) {
    console.error('ERRO geral:', error);
    console.log('\nPOSSIVEIS SOLUCOES:');
    console.log('1. Recarregue a pagina (Ctrl+F5)');
    console.log('2. Aguarde a pagina carregar completamente');
    console.log('3. Execute o script SQL para corrigir o usuario');
    console.log('4. Verifique se esta na pagina correta: http://127.0.0.1:3011/auth');
  }
}

// Executar teste
testLoginOnAuthPage();





