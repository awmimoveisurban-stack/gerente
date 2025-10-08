// Teste da Edge Function atual
// Execute no console do navegador

async function testCurrentEdgeFunction() {
  console.log('🧪 Testando Edge Function atual...');
  
  if (!window.supabase) {
    console.log('❌ Supabase client não encontrado');
    return;
  }
  
  const { data: { session }, error } = await window.supabase.auth.getSession();
  
  if (error || !session) {
    console.log('❌ Erro na sessão:', error);
    return;
  }
  
  console.log('✅ Sessão ativa:', session.user?.email);
  
  // Testar Edge Function com ação de conexão
  console.log('\n📋 Testando Edge Function atual...');
  
  const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ action: 'connect' })
  });
  
  console.log('Edge Function Status:', response.status);
  const data = await response.text();
  console.log('Response:', data);
  
  if (response.status === 200) {
    console.log('🎉 Edge Function funcionando corretamente!');
  } else if (response.status === 500) {
    console.log('⚠️ Edge Function com erro 500 - precisa ser corrigida');
    console.log('💡 Deploy a versão corrigida via Dashboard');
  } else {
    console.log('⚠️ Edge Function com problemas');
  }
}
testCurrentEdgeFunction();
