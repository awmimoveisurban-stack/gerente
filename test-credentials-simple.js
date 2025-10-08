// TESTE DE CREDENCIAIS
// Execute este script no console do navegador

async function testCredentials() {
  console.log('TESTE DE CREDENCIAIS DO CORRETOR');
  console.log('---');

  try {
    // 1. Verificar se supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('ERRO: Supabase nao esta carregado');
      return;
    }
    console.log('OK: Supabase carregado');

    // 2. Testar diferentes combinações de credenciais
    console.log('\nTestando diferentes combinacoes de credenciais...');
    
    const testCredentials = [
      { email: 'corretor@imobiliaria.com', password: '12345678', desc: 'Credenciais principais' },
      { email: 'corretor@imobiliaria.com', password: '123456', desc: 'Senha alternativa 1' },
      { email: 'corretor@imobiliaria.com', password: 'admin123', desc: 'Senha alternativa 2' },
      { email: 'corretor@imobiliaria.com', password: 'password', desc: 'Senha alternativa 3' },
      { email: 'corretor@imobiliaria.com', password: 'corretor123', desc: 'Senha alternativa 4' },
    ];

    let successfulLogin = null;

    for (const cred of testCredentials) {
      console.log('\nTestando: ' + cred.desc);
      console.log('Email: ' + cred.email);
      console.log('Senha: ' + cred.password);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cred.email,
          password: cred.password
        });

        if (error) {
          console.log('ERRO: ' + error.message);
          console.log('Codigo: ' + error.status);
          
          // Verificar tipos de erro
          if (error.message.includes('Invalid login credentials')) {
            console.log('Credenciais invalidas');
          } else if (error.message.includes('Email not confirmed')) {
            console.log('Email nao confirmado');
          } else if (error.message.includes('Too many requests')) {
            console.log('Muitas tentativas');
          }
        } else {
          console.log('OK: Login bem-sucedido!');
          console.log('Usuario: ' + data.user.email);
          console.log('ID: ' + data.user.id);
          console.log('Email confirmado: ' + (data.user.email_confirmed_at ? 'Sim' : 'Nao'));
          
          successfulLogin = cred;
          break;
        }
      } catch (err) {
        console.log('EXCECAO: ' + err.message);
      }
      
      // Pequena pausa entre tentativas
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3. Se login foi bem-sucedido, verificar dados
    if (successfulLogin) {
      console.log('\nLOGIN BEM-SUCEDIDO!');
      console.log('Credenciais que funcionaram: ' + successfulLogin.desc);
      console.log('Email: ' + successfulLogin.email);
      console.log('Senha: ' + successfulLogin.password);
      
      // Verificar roles
      console.log('\nVerificando roles...');
      
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id);

      if (rolesError) {
        console.error('ERRO ao buscar roles: ' + rolesError.message);
      } else {
        console.log('OK: Roles encontradas: ' + roles.map(r => r.role));
      }

      // Verificar leads
      console.log('\nVerificando leads...');
      
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id);

      if (leadsError) {
        console.error('ERRO ao buscar leads: ' + leadsError.message);
      } else {
        console.log('OK: ' + leads.length + ' leads encontrados');
      }
      
    } else {
      console.log('\nNENHUMA CREDENCIAL FUNCIONOU');
      console.log('Possiveis problemas:');
      console.log('- Usuario nao existe no banco');
      console.log('- Senha nao foi criptografada corretamente');
      console.log('- Email nao foi confirmado');
      console.log('- Problema na configuracao do Supabase');
    }

    // 4. Resumo final
    console.log('\nRESUMO DO TESTE:');
    if (successfulLogin) {
      console.log('OK: Login funcionando');
      console.log('OK: Credenciais corretas: ' + successfulLogin.desc);
      console.log('OK: Sistema configurado corretamente');
    } else {
      console.log('ERRO: Login nao funcionando');
      console.log('ERRO: Credenciais invalidas');
      console.log('ERRO: Sistema precisa ser reconfigurado');
    }

  } catch (error) {
    console.error('ERRO geral no teste: ' + error.message);
  }
}

// Executar teste
testCredentials();
