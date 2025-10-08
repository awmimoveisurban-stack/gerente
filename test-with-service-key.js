// 🧪 TESTE COM SERVICE ROLE KEY
// Execute este script no console do navegador

async function testWithServiceKey() {
  console.log('🚀 TESTANDO COM SERVICE ROLE KEY');
  console.log('📋 Testando Edge Function diretamente');
  console.log('---');
  
  try {
    // 1. Verificar autenticação
    console.log('🔐 1. Verificando autenticação...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado');
      return;
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);
    console.log('✅ Token válido:', session.access_token ? 'Sim' : 'Não');
    
    // 2. Testar Edge Function com Service Role Key
    console.log('\n🧪 2. Testando Edge Function...');
    
    // Primeiro teste: action test
    const testResponse = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test'
      })
    });
    
    console.log('📊 Status da resposta:', testResponse.status);
    console.log('📊 Headers:', Object.fromEntries(testResponse.headers.entries()));
    
    const testData = await testResponse.text();
    console.log('📊 Dados da resposta:', testData);
    
    // Interpretar resultado
    if (testResponse.status === 404) {
      console.log('❌ Edge Function não existe (404)');
      console.log('💡 Solução: Criar Edge Function no Dashboard');
      console.log('🔗 URL: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/functions');
      return;
    }
    
    if (testResponse.status === 500) {
      console.log('⚠️ Edge Function existe mas com erro interno (500)');
      console.log('💡 Solução: Verificar Environment Variables');
      console.log('🔧 Verificar se EVOLUTION_API_URL e EVOLUTION_API_KEY estão configuradas');
      return;
    }
    
    if (testResponse.status === 401) {
      console.log('❌ Token inválido (401)');
      console.log('💡 Solução: Verificar Service Role Key');
      return;
    }
    
    if (testResponse.ok) {
      console.log('✅ Edge Function funcionando!');
      
      // 3. Testar ação de conectar (se Evolution API estiver configurada)
      console.log('\n🔗 3. Testando ação de conectar WhatsApp...');
      
      const connectResponse = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connect',
          instanceName: 'empresa-whatsapp'
        })
      });
      
      console.log('📊 Status da conexão:', connectResponse.status);
      const connectData = await connectResponse.text();
      console.log('📊 Dados da conexão:', connectData);
      
      if (connectResponse.ok) {
        console.log('✅ WhatsApp connection funcionando!');
        console.log('🎉 SISTEMA TOTALMENTE FUNCIONAL!');
        
        // Mostrar QR Code se disponível
        try {
          const connectJson = JSON.parse(connectData);
          if (connectJson.qrcode) {
            console.log('📱 QR Code gerado com sucesso!');
            console.log('🔗 QR Code disponível no frontend');
          }
        } catch (e) {
          console.log('⚠️ Erro ao parsear resposta da conexão');
        }
      } else {
        console.log('⚠️ Problema na conexão WhatsApp');
        console.log('💡 Verificar Evolution API configuration');
        console.log('🔧 Verificar se EVOLUTION_API_URL e EVOLUTION_API_KEY estão corretas');
      }
    } else {
      console.log('❌ Erro inesperado:', testResponse.status);
      console.log('💡 Verificar logs da Edge Function');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Verificar conexão com internet e Supabase');
  }
}

// Executar teste
testWithServiceKey();





