// 🚀 SCRIPT FINAL DE TESTE - EDGE FUNCTION COMPLETA
// Execute este script no console do navegador na página /gerente/whatsapp

async function finalTest() {
  console.log('🚀 TESTE FINAL DA EDGE FUNCTION');
  console.log('📋 Verificando se tudo está funcionando');
  console.log('---');
  
  try {
    // 1. Verificar autenticação
    console.log('🔐 1. Verificando autenticação...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado');
      console.log('💡 Faça login primeiro');
      return;
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);
    console.log('✅ Token válido:', session.access_token ? 'Sim' : 'Não');
    
    // 2. Testar Edge Function básica
    console.log('\n🧪 2. Testando Edge Function básica...');
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
    
    console.log('📊 Status:', testResponse.status);
    const testData = await testResponse.text();
    console.log('📊 Resposta:', testData);
    
    // Interpretar resultado
    if (testResponse.status === 404) {
      console.log('❌ Edge Function não existe (404)');
      console.log('💡 CRIAR EDGE FUNCTION NO DASHBOARD');
      console.log('🔗 https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/functions');
      return;
    }
    
    if (testResponse.status === 500) {
      console.log('⚠️ Edge Function existe mas com erro (500)');
      console.log('💡 CONFIGURAR ENVIRONMENT VARIABLES');
      console.log('🔧 Adicionar EVOLUTION_API_URL e EVOLUTION_API_KEY');
      return;
    }
    
    if (testResponse.ok) {
      console.log('✅ Edge Function funcionando!');
      
      // 3. Testar conexão WhatsApp
      console.log('\n🔗 3. Testando conexão WhatsApp...');
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
        
        // Verificar se tem QR Code
        try {
          const connectJson = JSON.parse(connectData);
          if (connectJson.qrcode) {
            console.log('📱 QR Code gerado com sucesso!');
            console.log('🔗 QR Code disponível no frontend');
          }
        } catch (e) {
          console.log('⚠️ Erro ao parsear resposta');
        }
      } else {
        console.log('⚠️ Problema na conexão WhatsApp');
        console.log('💡 Verificar Evolution API configuration');
      }
    }
    
    // 4. Testar frontend
    console.log('\n🖥️ 4. Testando frontend...');
    try {
      // Simular clique no botão conectar
      const connectButton = document.querySelector('button[onclick*="handleConnect"]') || 
                           document.querySelector('button:contains("Conectar WhatsApp")');
      
      if (connectButton) {
        console.log('✅ Botão conectar encontrado');
        console.log('💡 Clique no botão para testar');
      } else {
        console.log('⚠️ Botão conectar não encontrado');
        console.log('💡 Verificar se está na página correta');
      }
    } catch (e) {
      console.log('⚠️ Erro ao testar frontend');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Verificar conexão com internet');
  }
}

// Executar teste final
finalTest();





