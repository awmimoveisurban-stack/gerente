// Teste de envio de mensagem WhatsApp
// Execute no console do navegador APÓS WhatsApp conectar

async function sendTestMessage() {
  console.log('🧪 Teste de envio de mensagem WhatsApp...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  try {
    // 1. Verificar se WhatsApp está conectado
    console.log('\n📋 1. Verificando status da conexão...');
    const stateResponse = await fetch(`https://api.urbanautobot.com/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (stateResponse.ok) {
      const stateData = await stateResponse.json();
      const connectionState = stateData.instance?.state;
      
      console.log(`📊 Status da conexão: ${connectionState}`);
      
      if (connectionState === 'open') {
        console.log('✅ WhatsApp conectado - pronto para enviar mensagem');
        
        // 2. Enviar mensagem de teste
        console.log('\n📋 2. Enviando mensagem de teste...');
        
        const messagePayload = {
          number: "5511999999999", // Substitua pelo número de teste
          text: "🧪 Mensagem de teste do sistema WhatsApp - Evolution API funcionando!"
        };
        
        const sendResponse = await fetch(`https://api.urbanautobot.com/message/sendText/${instanceName}`, {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messagePayload)
        });
        
        console.log(`📊 Status do envio: ${sendResponse.status}`);
        
        if (sendResponse.ok) {
          const sendData = await sendResponse.json();
          console.log('✅ Mensagem enviada com sucesso!');
          console.log('📊 Resposta:', sendData);
          
          return { success: true, messageSent: true };
        } else {
          const errorText = await sendResponse.text();
          console.log(`❌ Erro ao enviar mensagem: ${sendResponse.status}`);
          console.log('📊 Erro:', errorText);
          
          return { success: false, messageSent: false };
        }
        
      } else if (connectionState === 'connecting') {
        console.log('⏳ WhatsApp ainda conectando...');
        console.log('💡 Aguarde a conexão ser estabelecida');
        
      } else if (connectionState === 'close') {
        console.log('⚠️ WhatsApp desconectado');
        console.log('💡 Reconecte antes de enviar mensagens');
        
      } else {
        console.log(`📊 Status: ${connectionState}`);
      }
    } else {
      console.log(`⚠️ Erro ao verificar status: ${stateResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  return { success: false };
}

// Executar teste de envio
sendTestMessage().then(result => {
  if (result.success && result.messageSent) {
    console.log('\n🎉 SUCESSO! Mensagem enviada!');
    console.log('✅ Sistema WhatsApp funcionando perfeitamente!');
  } else {
    console.log('\n⚠️ Não foi possível enviar mensagem');
    console.log('💡 Verifique se WhatsApp está conectado');
  }
});
