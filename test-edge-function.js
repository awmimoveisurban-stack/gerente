// Teste da Edge Function
// Execute no console do navegador APÓS configurar a Edge Function

async function testEdgeFunction() {
  console.log('🧪 Testando Edge Function...');
  
  const supabaseUrl = 'https://bxtuynqauqasigcbocbm.supabase.co';
  const functionName = 'whatsapp-connect';
  
  try {
    // 1. Teste básico da função
    console.log('\n📋 1. Teste básico da Edge Function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || 'test-token'}`
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
      
      // 2. Teste de status
      console.log('\n📋 2. Teste de status da instância...');
      
      const statusResponse = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || 'test-token'}`
        },
        body: JSON.stringify({
          action: 'status',
          instanceName: 'empresa-whatsapp'
        })
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('✅ Status da instância obtido!');
        console.log('📊 Status:', statusData);
        
        return { success: true, functionWorking: true };
      } else {
        console.log(`⚠️ Erro ao obter status: ${statusResponse.status}`);
      }
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Erro na Edge Function: ${response.status}`);
      console.log('📊 Erro:', errorText);
      
      if (response.status === 401) {
        console.log('💡 Dica: Verifique se você está logado no Supabase');
      } else if (response.status === 404) {
        console.log('💡 Dica: Edge Function não encontrada - verifique se foi criada e deployada');
      } else if (response.status === 500) {
        console.log('💡 Dica: Erro interno - verifique as variáveis de ambiente');
      }
    }
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  return { success: false };
}

// Executar teste
testEdgeFunction().then(result => {
  if (result.success) {
    console.log('\n🎉 Edge Function funcionando!');
    console.log('✅ Sistema pronto para uso!');
  } else {
    console.log('\n⚠️ Problemas com Edge Function');
    console.log('💡 Verifique a configuração e tente novamente');
  }
});