// Script para verificar status da conexão após escanear QR Code
// Execute no console do navegador

async function checkConnectionStatus() {
  console.log('🧪 Verificando status da conexão WhatsApp...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  // Verificar status da conexão
  console.log('\n📋 Verificando status da conexão...');
  try {
    const stateResponse = await fetch(`https://api.urbanautobot.com/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const stateText = await stateResponse.text();
    console.log(`Status: ${stateResponse.status}`);
    console.log(`Response: ${stateText}`);
    
    if (stateResponse.ok) {
      const stateData = JSON.parse(stateText);
      console.log('📊 Estado da conexão:', stateData);
      
      if (stateData.instance && stateData.instance.state) {
        const connectionState = stateData.instance.state;
        
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
          
          const fetchText = await fetchResponse.text();
          if (fetchResponse.ok) {
            const data = JSON.parse(fetchText);
            const empresaInstance = data.find(inst => 
              inst.name === 'empresa-whatsapp'
            );
            
            if (empresaInstance) {
              console.log('✅ Instância empresa-whatsapp confirmada na lista!');
              console.log('📊 Status:', empresaInstance.connectionStatus);
              console.log('📊 Token:', empresaInstance.token);
              console.log('📊 Integração:', empresaInstance.integration);
              
              return { success: true, connected: true, instance: empresaInstance };
            }
          }
          
        } else if (connectionState === 'close') {
          console.log('⚠️ WhatsApp ainda não conectado');
          console.log('💡 Escaneie o QR Code com seu WhatsApp');
          
        } else {
          console.log(`📊 Status da conexão: ${connectionState}`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar status: ${error.message}`);
  }
  
  // Verificar lista de instâncias
  console.log('\n📋 Verificando lista de instâncias...');
  try {
    const fetchResponse = await fetch('https://api.urbanautobot.com/instance/fetchInstances', {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const fetchText = await fetchResponse.text();
    if (fetchResponse.ok) {
      const data = JSON.parse(fetchText);
      const empresaInstance = data.find(inst => 
        inst.name === 'empresa-whatsapp'
      );
      
      if (empresaInstance) {
        console.log('📊 Instância empresa-whatsapp encontrada:');
        console.log('Status:', empresaInstance.connectionStatus);
        console.log('Token:', empresaInstance.token);
        console.log('Integração:', empresaInstance.integration);
        
        if (empresaInstance.connectionStatus === 'open') {
          console.log('✅ WhatsApp conectado!');
          return { success: true, connected: true, instance: empresaInstance };
        } else {
          console.log('⚠️ WhatsApp ainda não conectado');
          return { success: true, connected: false, instance: empresaInstance };
        }
      } else {
        console.log('⚠️ Instância empresa-whatsapp não encontrada');
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar instâncias: ${error.message}`);
  }
  
  return { success: false };
}

// Executar verificação
checkConnectionStatus().then(result => {
  if (result.success) {
    if (result.connected) {
      console.log('\n🎉 SUCESSO! WhatsApp conectado!');
      console.log('✅ Instância empresa-whatsapp está pronta');
      console.log('📱 Próximos passos:');
      console.log('1. ✅ Configurar Edge Function no Supabase');
      console.log('2. ✅ Configurar variáveis de ambiente');
      console.log('3. ✅ Testar envio de mensagens');
      console.log('4. ✅ Implementar funcionalidades do sistema');
    } else {
      console.log('\n⏳ Aguardando conexão...');
      console.log('💡 Escaneie o QR Code com seu WhatsApp');
      console.log('💡 Execute este script novamente após escanear');
    }
  } else {
    console.log('\n⚠️ Erro ao verificar status');
    console.log('💡 Verificar logs e tentar novamente');
  }
});
