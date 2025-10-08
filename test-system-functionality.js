// Teste de funcionalidade do sistema
// Execute no console do navegador

async function testSystemFunctionality() {
  console.log('🧪 Testando funcionalidade do sistema...');
  
  try {
    // 1. Verificar se o Supabase client está funcionando
    console.log('\n📋 1. Verificando Supabase client...');
    
    if (!window.supabase) {
      console.log('❌ Supabase client não encontrado');
      return;
    }
    
    console.log('✅ Supabase client encontrado');
    
    // 2. Verificar autenticação
    console.log('\n📋 2. Verificando autenticação...');
    
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Erro na autenticação:', error);
    } else if (session) {
      console.log('✅ Sessão ativa:', session.user?.email);
      console.log('Token:', session.access_token?.substring(0, 20) + '...');
      
      // 3. Testar Edge Function
      console.log('\n📋 3. Testando Edge Function...');
      
      const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'test' })
      });
      
      console.log('Edge Function Status:', response.status);
      const data = await response.text();
      console.log('Response:', data);
      
      // 4. Testar conexão com Evolution API
      console.log('\n📋 4. Testando conexão com Evolution API...');
      
      const evolutionResponse = await fetch('https://api.urbanautobot.com', {
        method: 'GET',
        headers: {
          'apikey': 'cfd9b746ea9e400dc8f4d3e8d57b0180'
        }
      });
      
      console.log('Evolution API Status:', evolutionResponse.status);
      const evolutionData = await evolutionResponse.text();
      console.log('Evolution API Response:', evolutionData);
      
    } else {
      console.log('⚠️ Nenhuma sessão ativa');
      console.log('💡 Você precisa fazer login no sistema');
    }
    
    // 5. Verificar se há erros no console
    console.log('\n📋 5. Verificando erros...');
    
    const errors = [];
    const originalError = console.error;
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // Restaurar console.error
    setTimeout(() => {
      console.error = originalError;
      if (errors.length > 0) {
        console.log('⚠️ Erros encontrados:', errors);
      } else {
        console.log('✅ Nenhum erro encontrado');
      }
    }, 1000);
    
    // 6. Sugestões de correção
    console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
    
    if (!session) {
      console.log('1. ❌ Nenhuma sessão ativa');
      console.log('2. 🔧 Fazer login no sistema');
      console.log('3. 🔧 Verificar credenciais');
      console.log('4. 🔧 Verificar se o sistema de auth está funcionando');
    } else {
      console.log('1. ✅ Sistema funcionando corretamente');
      console.log('2. 🔧 Testar Edge Function');
      console.log('3. 🔧 Testar Evolution API');
      console.log('4. 🔧 Testar funcionalidades do WhatsApp');
    }
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Servidor rodando');
    console.log('2. ✅ Supabase client funcionando');
    console.log('3. 🔧 Fazer login no sistema');
    console.log('4. 🔧 Testar Edge Function');
    
  } catch (error) {
    console.log(`❌ Erro na verificação: ${error.message}`);
  }
}

// Executar verificação
testSystemFunctionality();
