// Verificação imediata do status WhatsApp
// Execute no console do navegador

async function verificarStatusAgora() {
  console.log('🧪 Verificação imediata do status WhatsApp...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  try {
    // Verificar status da conexão
    console.log('\n📋 Verificando status da conexão...');
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
        console.log('🎉 WhatsApp conectado com sucesso!');
        console.log('✅ Instância pronta para envio de mensagens');
        
        // Verificar detalhes da instância
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
          const empresaInstance = data.find(inst => inst.name === instanceName);
          
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
            
            console.log('\n🚀 SISTEMA PRONTO PARA CONFIGURAÇÃO!');
            
            return { success: true, connected: true, instance: empresaInstance };
          }
        }
        
      } else if (connectionState === 'connecting') {
        console.log('⏳ WhatsApp ainda conectando...');
        console.log('💡 Isso é normal e pode levar alguns minutos');
        
        // Verificar detalhes da instância para contexto
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
          const empresaInstance = data.find(inst => inst.name === instanceName);
          
          if (empresaInstance) {
            console.log('📊 Instância empresa-whatsapp encontrada:');
            console.log('Status:', empresaInstance.connectionStatus);
            console.log('Token:', empresaInstance.token);
            console.log('Integração:', empresaInstance.integration);
            
            console.log('\n💡 INFORMAÇÕES IMPORTANTES:');
            console.log('- Status "connecting" é normal após escanear QR Code');
            console.log('- Conexão pode levar 30 segundos a 3 minutos');
            console.log('- Você pode aguardar ou configurar outras partes do sistema');
            
            console.log('\n🔧 OPÇÕES:');
            console.log('1. ⏳ Aguardar conexão (recomendado)');
            console.log('2. 🔧 Configurar Edge Function enquanto aguarda');
            console.log('3. 📋 Preparar variáveis de ambiente');
            
            return { success: true, connected: false, instance: empresaInstance };
          }
        }
        
      } else if (connectionState === 'close') {
        console.log('⚠️ WhatsApp desconectado');
        console.log('💡 Pode ser necessário escanear o QR Code novamente');
        
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
  
  return { success: false };
}

// Executar verificação
verificarStatusAgora().then(result => {
  if (result.success && result.connected) {
    console.log('\n🎉 SUCESSO! WhatsApp conectado!');
    console.log('✅ Instância empresa-whatsapp está pronta');
    console.log('🚀 Sistema pronto para próxima fase!');
    console.log('\n📋 Próximos passos:');
    console.log('1. ✅ WhatsApp conectado');
    console.log('2. ⚙️ Configurar Edge Function no Supabase');
    console.log('3. 🔧 Configurar variáveis de ambiente');
    console.log('4. 🧪 Testar envio de mensagens');
  } else if (result.success && !result.connected) {
    console.log('\n⏳ WhatsApp ainda conectando...');
    console.log('💡 Você pode aguardar ou configurar outras partes');
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. ⏳ Aguardar conexão WhatsApp');
    console.log('2. 🔧 Configurar Edge Function no Supabase');
    console.log('3. 🔧 Configurar variáveis de ambiente');
  } else {
    console.log('\n⚠️ Problema na verificação');
    console.log('💡 Verifique logs e tente novamente');
  }
});
