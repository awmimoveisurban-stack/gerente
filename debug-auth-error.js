// 🧪 DIAGNÓSTICO DO ERRO DE AUTENTICAÇÃO
// Execute este script no console do navegador

async function debugAuthError() {
  console.log('🔍 DIAGNÓSTICO DO ERRO DE AUTENTICAÇÃO');
  console.log('---');

  try {
    // 1. Verificar se supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado');
      return;
    }
    console.log('✅ Supabase carregado');

    // 2. Verificar configuração do cliente
    console.log('\n📋 2. Verificando configuração do cliente...');
    console.log('URL:', supabase.supabaseUrl);
    console.log('Key:', supabase.supabaseKey ? '✅ Presente' : '❌ Ausente');
    console.log('Auth config:', supabase.auth);

    // 3. Verificar se o usuário corretor existe no banco
    console.log('\n👤 3. Verificando usuário corretor no banco...');
    
    // Tentar fazer uma consulta direta (sem autenticação)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('email', 'corretor@imobiliaria.com');

    if (usersError) {
      console.error('❌ Erro ao consultar usuários:', usersError);
    } else {
      console.log('Usuários encontrados:', users);
      if (users && users.length > 0) {
        console.log('✅ Usuário corretor existe no banco');
      } else {
        console.log('❌ Usuário corretor não existe no banco');
      }
    }

    // 4. Testar login com diferentes combinações
    console.log('\n🔐 4. Testando diferentes combinações de login...');
    
    const testCredentials = [
      { email: 'corretor@imobiliaria.com', password: '12345678', desc: 'Credenciais corretas' },
      { email: 'corretor@imobiliaria.com', password: '123456', desc: 'Senha alternativa' },
      { email: 'corretor@imobiliaria.com', password: 'admin123', desc: 'Senha admin' },
    ];

    for (const cred of testCredentials) {
      console.log(`\nTestando: ${cred.desc}`);
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
        } else {
          console.log('✅ Login bem-sucedido!');
          console.log('Usuário:', data.user?.email);
          break;
        }
      } catch (err) {
        console.log(`❌ Exceção: ${err.message}`);
      }
    }

    // 5. Verificar configuração de autenticação do Supabase
    console.log('\n⚙️ 5. Verificando configuração de autenticação...');
    
    try {
      const { data: authConfig, error: configError } = await supabase.auth.getSession();
      if (configError) {
        console.log('❌ Erro na configuração de auth:', configError);
      } else {
        console.log('✅ Configuração de auth OK');
        console.log('Sessão atual:', authConfig.session ? 'Ativa' : 'Inativa');
      }
    } catch (err) {
      console.log('❌ Erro ao verificar configuração:', err);
    }

    // 6. Verificar se há problemas de CORS ou rede
    console.log('\n🌐 6. Testando conectividade...');
    
    try {
      const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/auth/v1/settings', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Conectividade com Supabase OK');
      } else {
        console.log(`❌ Problema de conectividade: ${response.status}`);
      }
    } catch (err) {
      console.log('❌ Erro de rede:', err.message);
    }

    // 7. Resumo do diagnóstico
    console.log('\n🎯 RESUMO DO DIAGNÓSTICO:');
    console.log('Execute este script e verifique:');
    console.log('1. Se o usuário corretor existe no banco');
    console.log('2. Se alguma combinação de login funcionou');
    console.log('3. Se há problemas de conectividade');
    console.log('4. Se a configuração do Supabase está correta');

  } catch (error) {
    console.error('❌ Erro geral no diagnóstico:', error);
  }
}

// Executar diagnóstico
debugAuthError();
