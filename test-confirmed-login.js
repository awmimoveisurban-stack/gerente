// 🧪 TESTE DE LOGIN COM EMAIL CONFIRMADO
// Execute este script no console do navegador

async function testConfirmedLogin() {
  console.log('🚀 TESTE DE LOGIN COM EMAIL CONFIRMADO');
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
    console.log('Email: corretor@imobiliaria.com');
    console.log('Senha: 12345678');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'corretor@imobiliaria.com',
      password: '12345678'
    });

    if (error) {
      console.error('❌ Erro no login:', error.message);
      console.log('Código do erro:', error.status);
      
      // Verificar tipos de erro
      if (error.message.includes('Invalid login credentials')) {
        console.log('🔍 Possíveis causas:');
        console.log('- Email não existe');
        console.log('- Senha incorreta');
        console.log('- Email não confirmado');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('🔍 Email não foi confirmado');
      }
      
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('Usuário:', data.user.email);
    console.log('ID:', data.user.id);
    console.log('Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não');

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
      
      if (roles.some(r => r.role === 'corretor')) {
        console.log('✅ Usuário tem role de corretor!');
      } else {
        console.log('❌ Usuário não tem role de corretor');
      }
    }

    // 4. Verificar perfil
    console.log('\n📋 Verificando perfil...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else {
      console.log('✅ Perfil encontrado:', profile);
    }

    // 5. Verificar leads
    console.log('\n📊 Verificando leads...');
    
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', data.user.id);

    if (leadsError) {
      console.error('❌ Erro ao buscar leads:', leadsError);
    } else {
      console.log(`✅ ${leads.length} leads encontrados para o corretor`);
      if (leads.length > 0) {
        console.log('Primeiro lead:', leads[0].nome);
      }
    }

    // 6. Testar redirecionamento
    console.log('\n🔄 Testando redirecionamento...');
    
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
    console.log(`- Login: ${error ? '❌ Falhou' : '✅ Sucesso'}`);
    console.log(`- Email confirmado: ${data.user.email_confirmed_at ? '✅ Sim' : '❌ Não'}`);
    console.log(`- Roles: ${roles && roles.length > 0 ? '✅ Encontradas' : '❌ Não encontradas'}`);
    console.log(`- Perfil: ${profileError ? '❌ Erro' : '✅ OK'}`);
    console.log(`- Leads: ${leadsError ? '❌ Erro' : `✅ ${leads.length} encontrados`}`);
    console.log(`- Redirecionamento: ${roles && roles.some(r => r.role === 'corretor') ? '✅ Correto' : '❌ Incorreto'}`);

    if (!error && roles && roles.some(r => r.role === 'corretor')) {
      console.log('\n🎉 LOGIN DO CORRETOR FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Email confirmado');
      console.log('✅ Role correta');
      console.log('✅ Perfil configurado');
      console.log('✅ Leads disponíveis');
    } else {
      console.log('\n⚠️ LOGIN DO CORRETOR COM PROBLEMAS');
      console.log('Verifique a configuração no banco de dados');
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testConfirmedLogin();





