// Script para criar a instância empresa-whatsapp com a integração correta
// Execute no console do navegador

async function createEmpresaWhatsapp() {
  console.log('🧪 Criando instância empresa-whatsapp...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  // Criar instância com a integração correta baseada nas instâncias existentes
  console.log('\n📋 Criando instância empresa-whatsapp...');
  try {
    const createResponse = await fetch('https://api.urbanautobot.com/instance/create', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: instanceName,
        integration: 'WHATSAPP-BAILEYS', // Valor correto baseado nas instâncias existentes
        webhook: 'https://webhook.site/test',
        webhook_by_events: true,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      })
    });
    
    const createText = await createResponse.text();
    console.log(`Status: ${createResponse.status}`);
    console.log(`Response: ${createText}`);
    
    if (createResponse.ok) {
      console.log('✅ Instância empresa-whatsapp criada com sucesso!');
      
      // Conectar e obter QR Code
      console.log('\n🔗 Conectando e obtendo QR Code...');
      const connectResponse = await fetch('https://api.urbanautobot.com/instance/connect', {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      const connectText = await connectResponse.text();
      console.log(`Connect Status: ${connectResponse.status}`);
      console.log(`Connect Response: ${connectText}`);
      
      if (connectResponse.ok) {
        const connectData = JSON.parse(connectText);
        console.log('✅ Conexão estabelecida!');
        
        if (connectData.base64 || connectData.qrcode) {
          console.log('✅ QR Code disponível para escaneamento!');
          console.log('📱 Próximo passo: Escanear QR Code com WhatsApp');
          
          // Mostrar QR Code se disponível
          if (connectData.base64) {
            console.log('📱 QR Code Base64:', connectData.base64);
          }
          if (connectData.qrcode) {
            console.log('📱 QR Code:', connectData.qrcode);
          }
        } else {
          console.log('⚠️ QR Code não encontrado na resposta');
          console.log('📊 Dados completos:', connectData);
        }
        
        return { success: true, instanceName, qrData: connectData };
      } else {
        console.log('⚠️ Erro ao conectar instância');
      }
    } else {
      console.log(`❌ Erro ao criar instância: ${createResponse.status}`);
      console.log('💡 Pode ser que a instância já existe com nome diferente');
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Verificar se a instância foi criada
  console.log('\n📋 Verificando se a instância foi criada...');
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
        console.log('✅ Instância empresa-whatsapp encontrada!');
        console.log('📊 Status:', empresaInstance.connectionStatus);
        console.log('📊 Token:', empresaInstance.token);
        console.log('📊 Integração:', empresaInstance.integration);
        
        return { success: true, instanceName: 'empresa-whatsapp', existing: true };
      } else {
        console.log('⚠️ Instância empresa-whatsapp não encontrada');
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar: ${error.message}`);
  }
  
  return { success: false };
}

// Executar criação
createEmpresaWhatsapp().then(result => {
  if (result.success) {
    console.log('\n🎉 Instância empresa-whatsapp configurada!');
    console.log('Nome:', result.instanceName);
    
    if (result.qrData) {
      console.log('✅ QR Code obtido - pronto para escaneamento!');
    } else if (result.existing) {
      console.log('✅ Instância já existe - verificar status de conexão');
    }
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Se há QR Code: Escanear com WhatsApp');
    console.log('2. Configurar Edge Function no Supabase');
    console.log('3. Testar envio de mensagens');
  } else {
    console.log('\n⚠️ Falha ao configurar instância');
    console.log('💡 Verificar logs e tentar novamente');
  }
});
