// Script baseado na documentação oficial da Evolution API
// Execute no console do navegador

async function testOfficialDocs() {
  console.log('🧪 Testando baseado na documentação oficial Evolution API');
  console.log('📋 Documentação: https://doc.evolution-api.com/v1/api-reference/get-information');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  // Teste 1: Verificar se a instância já existe
  console.log('\n📋 Teste 1: Verificando instâncias existentes');
  try {
    const fetchResponse = await fetch('https://api.urbanautobot.com/instance/fetchInstances', {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const fetchText = await fetchResponse.text();
    console.log(`Status: ${fetchResponse.status}`);
    console.log(`Response: ${fetchText}`);
    
    if (fetchResponse.ok) {
      const data = JSON.parse(fetchText);
      console.log('📊 Instâncias existentes:', data);
      
      // Procurar por empresa-whatsapp
      const empresaInstance = data.data?.find(inst => 
        inst.instance?.instanceName === 'empresa-whatsapp'
      );
      
      if (empresaInstance) {
        console.log('✅ Instância empresa-whatsapp já existe!');
        console.log('📊 Status da conexão:', empresaInstance.instance?.connectionState);
        
        // Se já existe, testar conectividade
        console.log('\n🔗 Testando conectividade da instância existente...');
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
        
        return { success: true, method: 'existing', instanceName: 'empresa-whatsapp' };
      } else {
        console.log('⚠️ Instância empresa-whatsapp não existe, tentando criar...');
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar instâncias: ${error.message}`);
  }
  
  // Teste 2: Criar instância baseada na documentação oficial
  console.log('\n📋 Teste 2: Criando instância baseada na documentação oficial');
  try {
    const createResponse = await fetch('https://api.urbanautobot.com/instance/create', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: instanceName,
        webhook: 'https://webhook.site/test',
        webhook_by_events: true,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      })
    });
    
    const createText = await createResponse.text();
    console.log(`Status: ${createResponse.status}`);
    console.log(`Response: ${createText}`);
    
    if (createResponse.ok) {
      console.log('✅ Instância criada com sucesso!');
      
      // Teste 3: Conectar e obter QR Code
      console.log('\n🔗 Teste 3: Conectando e obtendo QR Code...');
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
          console.log('📱 Escaneie o QR Code com seu WhatsApp');
        } else {
          console.log('⚠️ QR Code não encontrado na resposta');
        }
        
        return { success: true, method: 'created', instanceName, qrData: connectData };
      } else {
        console.log('⚠️ Erro ao conectar instância');
      }
    } else {
      console.log(`❌ Erro ao criar instância: ${createResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 4: Verificar estado da conexão
  console.log('\n📋 Teste 4: Verificando estado da conexão');
  try {
    const stateResponse = await fetch(`https://api.urbanautobot.com/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const stateText = await stateResponse.text();
    console.log(`State Status: ${stateResponse.status}`);
    console.log(`State Response: ${stateText}`);
    
    if (stateResponse.ok) {
      const stateData = JSON.parse(stateText);
      console.log('📊 Estado da conexão:', stateData);
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar estado: ${error.message}`);
  }
  
  return { success: false };
}

// Executar teste baseado na documentação oficial
testOfficialDocs().then(result => {
  if (result.success) {
    console.log('\n🎉 Teste baseado na documentação oficial concluído!');
    console.log('Método:', result.method);
    console.log('Instância:', result.instanceName);
    
    if (result.qrData) {
      console.log('✅ QR Code obtido com sucesso!');
      console.log('📱 Próximo passo: Escanear QR Code com WhatsApp');
    }
  } else {
    console.log('\n⚠️ Teste não foi bem-sucedido');
    console.log('💡 Verificar configurações da API e redeploy da Edge Function');
  }
});
