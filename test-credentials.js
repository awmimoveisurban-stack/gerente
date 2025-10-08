// 🧪 TESTE DE CREDENCIAIS
// Execute este script no console do navegador

async function testCredentials() {
  console.log('🚀 TESTE DE CREDENCIAIS DO CORRETOR');
  console.log('---');

  try {
    // 1. Verificar se supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado');
      return;
    }
    console.log('✅ Supabase carregado');

    // 2. Testar diferentes combinações de credenciais
    console.log('\n🔐 Testando diferentes combinações de credenciais...');
    
    const testCredentials = [
      { email: 'corretor@imobiliaria.com', password: '12345678', desc: 'Credenciais principais' },
      { email: 'corretor@imobiliaria.com', password: '123456', desc: 'Senha alternativa 1' },
      { email: 'corretor@imobiliaria.com', password: 'admin123', desc: 'Senha alternativa 2' },
      { email: 'corretor@imobiliaria.com', password: 'password', desc: 'Senha alternativa 3' },
      { email: 'corretor@imobiliaria.com', password: 'corretor123', desc: 'Senha alternativa 4' },
    ];

    let successfulLogin = null;

    for (const cred of testCredentials) {
      console.log(`\n🔍 Testando: ${cred.desc}`);
      console.log(`Email: ${cred.email}`);
      console.log(`Senha: ${cred.password}`);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cred.email,
          password: cred.password
        });

        if (error) {
          console.log(`❌ Erro: ${error.message}`);
          console.log(`Código: ${error.status}`);
          
          // Verificar tipos de erro
          if (error.message.includes('Invalid login credentials')) {
            console.log('🔍 Credenciais inválidas');
          } else if (error.message.includes('Email not confirmed')) {
            console.log('🔍 Email não confirmado');
          } else if (error.message.includes('Too many requests')) {
            console.log('🔍 Muitas tentativas');
          }
        } else {
          console.log('✅ Login bem-sucedido!');
          console.log('Usuário:', data.user.email);
          console.log('ID:', data.user.id);
          console.log('Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não');
          
          successfulLogin = cred;
          break;
        }
      } catch (err) {
        console.log(`❌ Exceção: ${err.message}`);
      }
      
      // Pequena pausa entre tentativas
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3. Se login foi bem-sucedido, verificar dados
    if (successfulLogin) {
      console.log('\n🎉 LOGIN BEM-SUCEDIDO!');
      console.log(`Credenciais que funcionaram: ${successfulLogin.desc}`);
      console.log(`Email: ${successfulLogin.email}`);
      console.log(`Senha: ${successfulLogin.password}`);
      
      // Verificar roles
      console.log('\n👤 Verificando roles...');
      
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id);

      if (rolesError) {
        console.error('❌ Erro ao buscar roles:', rolesError);
      } else {
        console.log('✅ Roles encontradas:', roles.map(r => r.role));
      }

      // Verificar leads
      console.log('\n📊 Verificando leads...');
      
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id);

      if (leadsError) {
        console.error('❌ Erro ao buscar leads:', leadsError);
      } else {
        console.log(`✅ ${leads.length} leads encontrados`);
      }
      
    } else {
      console.log('\n❌ NENHUMA CREDENCIAL FUNCIONOU');
      console.log('🔍 Possíveis problemas:');
      console.log('- Usuário não existe no banco');
      console.log('- Senha não foi criptografada corretamente');
      console.log('- Email não foi confirmado');
      console.log('- Problema na configuração do Supabase');
    }

    // 4. Resumo final
    console.log('\n🎯 RESUMO DO TESTE:');
    if (successfulLogin) {
      console.log('✅ Login funcionando');
      console.log(`✅ Credenciais corretas: ${successfulLogin.desc}`);
      console.log('✅ Sistema configurado corretamente');
    } else {
      console.log('❌ Login não funcionando');
      console.log('❌ Credenciais inválidas');
      console.log('❌ Sistema precisa ser reconfigurado');
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testCredentials();





