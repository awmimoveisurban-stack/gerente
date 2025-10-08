// Script para diagnosticar e resolver problemas de conexão
// Execute no console do navegador

async function troubleshootConnection() {
  console.log('🔧 Diagnosticando problemas de conexão...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  // Verificar status atual
  console.log('\n📋 Verificando status atual...');
  try {
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
      
      if (connectionState === 'connecting') {
        console.log('⏳ Status: connecting (há muito tempo)');
        console.log('💡 Vou tentar reiniciar a conexão...');
        
        // Tentar reiniciar a instância
        console.log('\n🔄 Tentando reiniciar a instância...');
        try {
          const restartResponse = await fetch(`https://api.urbanautobot.com/instance/restart/${instanceName}`, {
            method: 'PUT',
            headers: {
              'apikey': apiKey,
              'Content-Type': 'application/json'
            }
          });
          
          const restartText = await restartResponse.text();
          console.log(`Restart Status: ${restartResponse.status}`);
          console.log(`Restart Response: ${restartText}`);
          
          if (restartResponse.ok) {
            console.log('✅ Instância reiniciada com sucesso!');
            console.log('⏳ Aguarde 10 segundos e execute o script de verificação novamente');
            
            // Aguardar 10 segundos
            console.log('\n⏳ Aguardando 10 segundos...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Verificar status após reinício
            console.log('\n📋 Verificando status após reinício...');
            const newStateResponse = await fetch(`https://api.urbanautobot.com/instance/connectionState/${instanceName}`, {
              method: 'GET',
              headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json'
              }
            });
            
            if (newStateResponse.ok) {
              const newStateData = await newStateResponse.json();
              const newConnectionState = newStateData.instance?.state;
              console.log(`📊 Novo status: ${newConnectionState}`);
              
              if (newConnectionState === 'open') {
                console.log('✅ WhatsApp conectado após reinício!');
                return { success: true, connected: true, method: 'restart' };
              } else if (newConnectionState === 'close') {
                console.log('⚠️ Status mudou para close após reinício');
                console.log('💡 Pode ser necessário escanear o QR Code novamente');
                return { success: false, needNewQR: true };
              } else {
                console.log(`📊 Status: ${newConnectionState}`);
              }
            }
          } else {
            console.log('⚠️ Erro ao reiniciar instância');
          }
        } catch (error) {
          console.log(`❌ Erro ao reiniciar: ${error.message}`);
        }
        
      } else if (connectionState === 'close') {
        console.log('⚠️ Status: close');
        console.log('💡 Pode ser necessário escanear o QR Code novamente');
        return { success: false, needNewQR: true };
        
      } else if (connectionState === 'open') {
        console.log('✅ Status: open - WhatsApp conectado!');
        return { success: true, connected: true, method: 'already_connected' };
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar status: ${error.message}`);
  }
  
  // Se chegou até aqui, oferecer opções
  console.log('\n🔧 OPÇÕES DE TROUBLESHOOTING:');
  console.log('1. Execute o script de recriação para obter novo QR Code');
  console.log('2. Verifique se seu WhatsApp está funcionando normalmente');
  console.log('3. Tente conectar em outro dispositivo');
  console.log('4. Verifique sua conexão com a internet');
  console.log('5. Aguarde mais alguns minutos e tente novamente');
  
  return { success: false, needTroubleshooting: true };
}

// Executar diagnóstico
troubleshootConnection().then(result => {
  if (result.success && result.connected) {
    console.log('\n🎉 SUCESSO! WhatsApp conectado!');
    console.log('✅ Instância empresa-whatsapp está pronta');
    console.log('🚀 Sistema pronto para próxima fase!');
  } else if (result.needNewQR) {
    console.log('\n⚠️ Necessário novo QR Code');
    console.log('💡 Execute o script de recriação para obter novo QR Code');
  } else {
    console.log('\n⚠️ Problemas de conexão detectados');
    console.log('💡 Siga as opções de troubleshooting acima');
  }
});
