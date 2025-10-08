// Teste imediato da Edge Function
// Execute no console do navegador

async function testEdgeFunctionNow() {
  console.log('🧪 Testando Edge Function agora...');
  
  const supabaseUrl = 'https://bxtuynqauqasigcbocbm.supabase.co';
  const functionName = 'whatsapp-connect';
  
  try {
    // 1. Teste básico sem autenticação
    console.log('\n📋 1. Teste básico sem autenticação...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'test'
      })
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Edge Function funcionando!');
      console.log('📊 Resposta:', data);
      
      return { success: true, functionWorking: true };
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Erro na Edge Function: ${response.status}`);
      console.log('📊 Erro:', errorText);
      
      if (response.status === 500) {
        console.log('\n🔧 DIAGNÓSTICO DO ERRO 500:');
        console.log('1. ❌ Variáveis de ambiente não configuradas');
        console.log('2. ❌ Edge Function não deployada corretamente');
        console.log('3. ❌ Código da função com erro');
        
        console.log('\n💡 SOLUÇÕES:');
        console.log('1. 🔧 Configurar variáveis de ambiente no Supabase');
        console.log('2. 🔧 Redeploy da Edge Function');
        console.log('3. 🔧 Verificar código da função');
        
      } else if (response.status === 401) {
        console.log('💡 Dica: Erro de autenticação - testando sem auth');
        
      } else if (response.status === 404) {
        console.log('💡 Dica: Edge Function não encontrada - verificar se foi criada');
        
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
testEdgeFunctionNow().then(result => {
  if (result.success) {
    console.log('\n🎉 Edge Function funcionando!');
    console.log('✅ Sistema pronto para uso!');
  } else {
    console.log('\n⚠️ Problemas com Edge Function');
    console.log('💡 Siga as instruções de correção acima');
  }
});
