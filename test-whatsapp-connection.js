// Teste completo da conexão WhatsApp
// Execute no console do navegador

async function testWhatsAppConnection() {
  console.log('🧪 Teste completo da conexão WhatsApp...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  try {
    // 1. Verificar instâncias existentes
    console.log('\n📋 1. Verificando instâncias existentes...');
    const fetchResponse = await fetch('https://api.urbanautobot.com/instance/fetchInstances', {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (fetchResponse.ok) {
      const data = await fetchResponse.json();
      console.log(`✅ Instâncias encontradas: (${data.length})`);
      
      const empresaInstance = data.find(inst => inst.name === instanceName);
      if (empresaInstance) {
        console.log('✅ Instância empresa-whatsapp encontrada!');
        console.log('📊 Status:', empresaInstance.connectionStatus);
        console.log('📊 Token:', empresaInstance.token);
        console.log('📊 Integração:', empresaInstance.integration);
        
        // 2. Verificar status da conexão
        console.log('\n📋 2. Verificando status da conexão...');
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
            console.log('🎉 WhatsApp conectado com sucesso!');
            console.log('✅ Instância pronta para envio de mensagens');
            
            console.log('\n🎉 PRÓXIMOS PASSOS:');
            console.log('1. ✅ WhatsApp conectado');
            console.log('2. ⚙️ Configurar Edge Function no Supabase');
            console.log('3. 🔧 Configurar variáveis de ambiente');
            console.log('4. 🧪 Testar envio de mensagens');
            
            return { success: true, connected: true, instance: empresaInstance };
            
          } else if (connectionState === 'connecting') {
            console.log('⏳ WhatsApp ainda conectando...');
            console.log('💡 Aguarde mais alguns segundos');
            
          } else if (connectionState === 'close') {
            console.log('⚠️ WhatsApp desconectado');
            console.log('💡 Pode ser necessário escanear o QR Code novamente');
            
          } else {
            console.log(`📊 Status: ${connectionState}`);
          }
        } else {
          console.log(`⚠️ Erro ao verificar status: ${stateResponse.status}`);
        }
        
      } else {
        console.log('⚠️ Instância empresa-whatsapp não encontrada');
        console.log('💡 Execute o script de recriação');
      }
      
    } else {
      console.log(`❌ Erro ao buscar instâncias: ${fetchResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  return { success: false };
}

// Executar teste
testWhatsAppConnection().then(result => {
  if (result.success && result.connected) {
    console.log('\n🎉 SUCESSO! WhatsApp conectado!');
    console.log('✅ Sistema pronto para próxima fase!');
  } else {
    console.log('\n⏳ Aguardando conexão ou precisa de configuração');
    console.log('💡 Execute os scripts de configuração necessários');
  }
});
