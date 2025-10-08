// Quick status check para verificar se WhatsApp conectou
// Execute no console do navegador

async function quickStatusCheck() {
  console.log('🧪 Verificação rápida do status...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  try {
    // Verificar status da conexão
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
      
      console.log(`📊 Status atual: ${connectionState}`);
      
      if (connectionState === 'open') {
        console.log('✅ WhatsApp conectado com sucesso!');
        
        // Verificar instâncias para obter detalhes
        const fetchResponse = await fetch('https://api.urbanautobot.com/instance/fetchInstances', {
          method: 'GET',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          const empresaInstance = data.find(inst => inst.name === 'empresa-whatsapp');
          
          if (empresaInstance) {
            console.log('✅ Instância empresa-whatsapp confirmada!');
            console.log('📊 Status:', empresaInstance.connectionStatus);
            console.log('📊 Token:', empresaInstance.token);
            console.log('📊 Integração:', empresaInstance.integration);
            
            console.log('\n🎉 PRÓXIMOS PASSOS:');
            console.log('1. ✅ WhatsApp conectado');
            console.log('2. ⚙️ Configurar Edge Function no Supabase');
            console.log('3. 🔧 Configurar variáveis de ambiente');
            console.log('4. 🧪 Testar envio de mensagens');
            
            return { success: true, connected: true, instance: empresaInstance };
          }
        }
        
      } else if (connectionState === 'connecting') {
        console.log('⏳ Ainda conectando...');
        console.log('💡 Aguarde mais alguns segundos');
        
      } else if (connectionState === 'close') {
        console.log('⚠️ Conexão fechada');
        console.log('💡 Pode ser necessário escanear o QR Code novamente');
        
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

// Executar verificação rápida
quickStatusCheck().then(result => {
  if (result.success && result.connected) {
    console.log('\n🎉 SUCESSO! WhatsApp conectado!');
    console.log('✅ Instância empresa-whatsapp está pronta');
    console.log('🚀 Sistema pronto para próxima fase!');
  } else {
    console.log('\n⏳ Aguardando conexão...');
    console.log('💡 Execute este script novamente em alguns segundos');
  }
});
