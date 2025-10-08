// Script para verificar conexão automaticamente até conectar
// Execute no console do navegador

async function autoCheckConnection() {
  console.log('🧪 Verificando conexão automaticamente...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  let attempts = 0;
  const maxAttempts = 20; // 20 tentativas (1 minuto)
  
  const checkConnection = async () => {
    attempts++;
    console.log(`\n📋 Tentativa ${attempts}/${maxAttempts} - Verificando status...`);
    
    try {
      const stateResponse = await fetch(`https://api.urbanautobot.com/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (stateResponse.ok) {
        const stateText = await stateResponse.text();
        const stateData = JSON.parse(stateText);
        
        if (stateData.instance && stateData.instance.state) {
          const connectionState = stateData.instance.state;
          console.log(`📊 Status: ${connectionState}`);
          
          if (connectionState === 'open') {
            console.log('✅ WhatsApp conectado com sucesso!');
            console.log('🎉 Instância pronta para envio de mensagens');
            
            // Verificar instâncias para confirmar
            console.log('\n📋 Verificando lista de instâncias...');
            const fetchResponse = await fetch('https://api.urbanautobot.com/instance/fetchInstances', {
              method: 'GET',
              headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json'
              }
            });
            
            if (fetchResponse.ok) {
              const fetchText = await fetchResponse.text();
              const data = JSON.parse(fetchText);
              const empresaInstance = data.find(inst => 
                inst.name === 'empresa-whatsapp'
              );
              
              if (empresaInstance) {
                console.log('✅ Instância empresa-whatsapp confirmada na lista!');
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
            console.log('⏳ Ainda conectando... aguarde...');
            
          } else if (connectionState === 'close') {
            console.log('⚠️ Conexão fechada. Pode ser necessário escanear o QR Code novamente.');
            
          } else {
            console.log(`📊 Status: ${connectionState}`);
          }
        }
      } else {
        console.log(`⚠️ Erro ao verificar status: ${stateResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    // Se ainda não conectou e não excedeu o limite, tentar novamente
    if (attempts < maxAttempts) {
      console.log('⏳ Aguardando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      return checkConnection();
    } else {
      console.log('\n⚠️ Timeout: Não foi possível conectar em 1 minuto');
      console.log('💡 Verifique se o QR Code foi escaneado corretamente');
      console.log('💡 Tente executar o script de recriação novamente');
      return { success: false, timeout: true };
    }
  };
  
  return checkConnection();
}

// Executar verificação automática
autoCheckConnection().then(result => {
  if (result.success && result.connected) {
    console.log('\n🎉 SUCESSO! WhatsApp conectado!');
    console.log('✅ Instância empresa-whatsapp está pronta');
    console.log('🚀 Sistema pronto para próxima fase!');
  } else if (result.timeout) {
    console.log('\n⏳ Timeout atingido');
    console.log('💡 Tente executar o script de recriação novamente');
  } else {
    console.log('\n⚠️ Falha na conexão');
    console.log('💡 Verificar logs e tentar novamente');
  }
});
