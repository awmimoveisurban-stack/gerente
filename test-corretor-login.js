// 🧪 TESTE DE LOGIN DO CORRETOR
// Execute este script no console do navegador na página de login

async function testCorretorLogin() {
  console.log('🚀 TESTANDO LOGIN DO CORRETOR');
  console.log('---');

  try {
    // 1. Verificar se supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado. Certifique-se de estar na página de login.');
      return;
    }
    console.log('✅ Supabase carregado.');

    // 2. Testar login do corretor
    console.log('\n🔐 2. Testando login do corretor...');
    
    const corretorEmail = 'corretor@imobiliaria.com';
    const corretorPassword = '12345678';
    
    console.log(`Email: ${corretorEmail}`);
    console.log(`Senha: ${corretorPassword}`);
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: corretorEmail,
      password: corretorPassword
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      
      // Verificar tipos de erro
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('🔍 Possíveis causas:');
        console.log('- Email não existe');
        console.log('- Senha incorreta');
        console.log('- Email não confirmado');
      } else if (loginError.message.includes('Email not confirmed')) {
        console.log('🔍 Email não foi confirmado');
      }
      
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('Usuário:', loginData.user.email);

    // 3. Verificar roles do usuário
    console.log('\n👤 3. Verificando roles do usuário...');
    
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', loginData.user.id);

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
      return;
    }

    if (roles && roles.length > 0) {
      console.log('✅ Roles encontradas:', roles.map(r => r.role));
      
      if (roles.some(r => r.role === 'corretor')) {
        console.log('✅ Usuário tem role de corretor!');
      } else {
        console.log('❌ Usuário não tem role de corretor');
      }
    } else {
      console.log('❌ Nenhuma role encontrada para o usuário');
    }

    // 4. Verificar perfil
    console.log('\n📋 4. Verificando perfil...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else {
      console.log('✅ Perfil encontrado:', profile);
    }

    // 5. Verificar leads
    console.log('\n📊 5. Verificando leads...');
    
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', loginData.user.id);

    if (leadsError) {
      console.error('❌ Erro ao buscar leads:', leadsError);
    } else {
      console.log(`✅ ${leads.length} leads encontrados para o corretor`);
      if (leads.length > 0) {
        console.log('Primeiro lead:', leads[0].nome);
      }
    }

    // 6. Testar redirecionamento
    console.log('\n🔄 6. Testando redirecionamento...');
    
    // Simular redirecionamento baseado na role
    if (roles && roles.some(r => r.role === 'corretor')) {
      console.log('✅ Deveria redirecionar para /dashboard');
      console.log('URL atual:', window.location.href);
      
      // Se não estiver na página correta, redirecionar
      if (!window.location.pathname.includes('/dashboard')) {
        console.log('🔄 Redirecionando para /dashboard...');
        window.location.href = '/dashboard';
      }
    } else {
      console.log('❌ Não deveria redirecionar - role incorreta');
    }

    // 7. Resumo final
    console.log('\n🎯 RESUMO DO TESTE:');
    console.log(`- Login: ${loginError ? '❌ Falhou' : '✅ Sucesso'}`);
    console.log(`- Roles: ${roles && roles.length > 0 ? '✅ Encontradas' : '❌ Não encontradas'}`);
    console.log(`- Perfil: ${profileError ? '❌ Erro' : '✅ OK'}`);
    console.log(`- Leads: ${leadsError ? '❌ Erro' : `✅ ${leads.length} encontrados`}`);
    console.log(`- Redirecionamento: ${roles && roles.some(r => r.role === 'corretor') ? '✅ Correto' : '❌ Incorreto'}`);

    if (!loginError && roles && roles.some(r => r.role === 'corretor')) {
      console.log('\n🎉 LOGIN DO CORRETOR FUNCIONANDO PERFEITAMENTE!');
    } else {
      console.log('\n⚠️ LOGIN DO CORRETOR COM PROBLEMAS - Verificar configuração');
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testCorretorLogin();





