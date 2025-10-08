// Monitor aprimorado com feedback detalhado
// Execute no console do navegador

async function enhancedMonitor() {
  console.log('🧪 Monitor aprimorado da conexão WhatsApp...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  let attempts = 0;
  const maxAttempts = 60; // 60 tentativas (3 minutos)
  const startTime = Date.now();
  
  const checkConnection = async () => {
    attempts++;
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    
    console.log(`\n📋 Tentativa ${attempts}/${maxAttempts} - Verificando status...`);
    console.log(`⏱️ Tempo decorrido: ${elapsedTime}s`);
    
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
        
        console.log(`📊 Status: ${connectionState}`);
        
        if (connectionState === 'open') {
          console.log('🎉 WhatsApp conectado com sucesso!');
          console.log('✅ Instância pronta para envio de mensagens');
          
          // Verificar instâncias para obter detalhes completos
          console.log('\n📋 Verificando detalhes da instância...');
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
              console.log('📊 Número de mensagens:', empresaInstance._count?.Message || 'N/A');
              console.log('📊 Número de contatos:', empresaInstance._count?.Contact || 'N/A');
              
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
          
          // Dicas progressivas baseadas no tempo
          if (attempts > 10) {
            console.log('💡 Dica: Conexões WhatsApp podem demorar até 3 minutos');
          }
          if (attempts > 20) {
            console.log('💡 Dica: Certifique-se de que seu WhatsApp está funcionando normalmente');
          }
          if (attempts > 30) {
            console.log('💡 Dica: Verifique sua conexão com a internet');
          }
          if (attempts > 40) {
            console.log('💡 Dica: Tente conectar em outro dispositivo se disponível');
          }
          
        } else if (connectionState === 'close') {
          console.log('⚠️ Conexão fechada');
          console.log('💡 Pode ser necessário escanear o QR Code novamente');
          
          // Oferecer opção de recriar
          console.log('\n🔧 OPÇÕES DE TROUBLESHOOTING:');
          console.log('1. Execute o script de recriação para obter novo QR Code');
          console.log('2. Verifique se seu WhatsApp está funcionando');
          console.log('3. Tente conectar novamente');
          
          return { success: false, connectionClosed: true };
          
        } else {
          console.log(`📊 Status: ${connectionState}`);
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
      console.log('\n⚠️ Timeout: Não foi possível conectar em 3 minutos');
      console.log('\n🔧 OPÇÕES DE TROUBLESHOOTING:');
      console.log('1. Execute o script de recriação para obter novo QR Code');
      console.log('2. Verifique se seu WhatsApp está funcionando normalmente');
      console.log('3. Tente conectar em outro dispositivo');
      console.log('4. Verifique sua conexão com a internet');
      console.log('5. Aguarde mais alguns minutos e tente novamente');
      
      return { success: false, timeout: true };
    }
  };
  
  return checkConnection();
}

// Executar monitor aprimorado
enhancedMonitor().then(result => {
  if (result.success && result.connected) {
    console.log('\n🎉 SUCESSO! WhatsApp conectado!');
    console.log('✅ Instância empresa-whatsapp está pronta');
    console.log('🚀 Sistema pronto para próxima fase!');
  } else if (result.connectionClosed) {
    console.log('\n⚠️ Conexão fechada');
    console.log('💡 Execute o script de recriação para tentar novamente');
  } else if (result.timeout) {
    console.log('\n⏳ Timeout atingido');
    console.log('💡 Tente executar o script de recriação novamente');
  } else {
    console.log('\n⚠️ Falha na conexão');
    console.log('💡 Verificar logs e tentar novamente');
  }
});
