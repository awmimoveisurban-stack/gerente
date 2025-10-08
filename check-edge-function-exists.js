// Script para verificar se Edge Function existe
// Execute este script no console do navegador

async function checkEdgeFunctionExists() {
  console.log('🔍 Verificando se Edge Function existe...');
  
  try {
    // Obter token de autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado');
      return;
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);
    
    // Testar diferentes endpoints
    const endpoints = [
      'whatsapp-connect',
      'whatsapp-simple'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🔍 Testando endpoint: ${endpoint}`);
      
      try {
        const response = await fetch(`https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'test'
          })
        });
        
        console.log(`📊 Status para ${endpoint}:`, response.status);
        
        if (response.status === 404) {
          console.log(`❌ ${endpoint} não existe (404)`);
        } else if (response.status === 500) {
          console.log(`⚠️ ${endpoint} existe mas com erro interno (500)`);
        } else if (response.ok) {
          console.log(`✅ ${endpoint} existe e funcionando`);
        } else {
          console.log(`⚠️ ${endpoint} existe mas com status: ${response.status}`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao testar ${endpoint}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
checkEdgeFunctionExists();





