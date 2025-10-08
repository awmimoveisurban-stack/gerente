// Teste da Edge Function com autenticação
// Execute no console do navegador

async function testEdgeFunctionWithAuth() {
  console.log('🧪 Testando Edge Function com autenticação...');
  
  const supabaseUrl = 'https://bxtuynqauqasigcbocbm.supabase.co';
  const functionName = 'whatsapp-connect';
  
  try {
    // 1. Verificar se há token de autenticação
    console.log('\n📋 1. Verificando autenticação...');
    
    // Tentar diferentes formas de obter o token
    let authToken = null;
    
    // Verificar localStorage
    const localToken = localStorage.getItem('supabase.auth.token');
    if (localToken) {
      authToken = localToken;
      console.log('✅ Token encontrado no localStorage');
    }
    
    // Verificar sessionStorage
    const sessionToken = sessionStorage.getItem('supabase.auth.token');
    if (sessionToken) {
      authToken = sessionToken;
      console.log('✅ Token encontrado no sessionStorage');
    }
    
    // Verificar se há Supabase client
    if (window.supabase) {
      try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session?.access_token) {
          authToken = session.access_token;
          console.log('✅ Token obtido do Supabase client');
        }
      } catch (error) {
        console.log('⚠️ Erro ao obter token do Supabase client:', error.message);
      }
    }
    
    if (!authToken) {
      console.log('⚠️ Nenhum token de autenticação encontrado');
      console.log('\n💡 SOLUÇÕES:');
      console.log('1. 🔐 Fazer login no sistema');
      console.log('2. 🔐 Verificar se está autenticado');
      console.log('3. 🔐 Testar sem autenticação (se permitido)');
      
      // Testar sem autenticação para ver se funciona
      console.log('\n📋 Testando sem autenticação...');
      const responseNoAuth = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'test'
        })
      });
      
      console.log(`📊 Status sem auth: ${responseNoAuth.status}`);
      
      if (responseNoAuth.ok) {
        const data = await responseNoAuth.json();
        console.log('✅ Edge Function funciona sem autenticação!');
        console.log('📊 Resposta:', data);
        return { success: true, functionWorking: true, noAuth: true };
      } else {
        const errorText = await responseNoAuth.text();
        console.log('❌ Edge Function requer autenticação');
        console.log('📊 Erro:', errorText);
        return { success: false, requiresAuth: true };
      }
    }
    
    // 2. Testar com autenticação
    console.log('\n📋 2. Testando com autenticação...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'test'
      })
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Edge Function funcionando com autenticação!');
      console.log('📊 Resposta:', data);
      
      return { success: true, functionWorking: true, withAuth: true };
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Erro na Edge Function: ${response.status}`);
      console.log('📊 Erro:', errorText);
      
      if (response.status === 401) {
        console.log('\n🔧 DIAGNÓSTICO DO ERRO 401:');
        console.log('1. ❌ Token de autenticação inválido');
        console.log('2. ❌ Token expirado');
        console.log('3. ❌ Usuário não autenticado');
        
        console.log('\n💡 SOLUÇÕES:');
        console.log('1. 🔐 Fazer login no sistema');
        console.log('2. 🔐 Verificar se está autenticado');
        console.log('3. 🔐 Renovar token de autenticação');
        
      } else if (response.status === 403) {
        console.log('💡 Dica: Acesso negado - verificar permissões');
        
      } else {
        console.log(`💡 Dica: Erro ${response.status} - verificar configuração`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  return { success: false };
}

// Executar teste
testEdgeFunctionWithAuth().then(result => {
  if (result.success && result.functionWorking) {
    console.log('\n🎉 Edge Function funcionando!');
    if (result.withAuth) {
      console.log('✅ Autenticação funcionando');
    } else if (result.noAuth) {
      console.log('✅ Funciona sem autenticação');
    }
    console.log('🚀 Sistema pronto para uso!');
  } else if (result.requiresAuth) {
    console.log('\n⚠️ Edge Function requer autenticação');
    console.log('💡 Faça login no sistema e tente novamente');
  } else {
    console.log('\n⚠️ Problemas com Edge Function');
    console.log('💡 Verifique autenticação e configuração');
  }
});
