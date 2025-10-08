// Script baseado na estrutura exata das instâncias existentes
// Execute no console do navegador

async function testExactStructure() {
  console.log('🧪 Testando com estrutura exata das instâncias existentes...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  // Teste 1: Payload mínimo baseado na estrutura existente
  console.log('\n📋 Teste 1: Payload mínimo');
  try {
    const response1 = await fetch('https://api.urbanautobot.com/instance/create', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: instanceName
      })
    });
    
    const text1 = await response1.text();
    console.log(`Status: ${response1.status}`);
    console.log(`Response: ${text1}`);
    
    if (response1.ok) {
      console.log('✅ Payload mínimo funciona!');
      return { success: true, method: 'minimal' };
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 2: Com integration apenas
  console.log('\n📋 Teste 2: Com integration apenas');
  try {
    const response2 = await fetch('https://api.urbanautobot.com/instance/create', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: instanceName,
        integration: 'WHATSAPP-BAILEYS'
      })
    });
    
    const text2 = await response2.text();
    console.log(`Status: ${response2.status}`);
    console.log(`Response: ${text2}`);
    
    if (response2.ok) {
      console.log('✅ Com integration funciona!');
      return { success: true, method: 'integration' };
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 3: Endpoint alternativo
  console.log('\n📋 Teste 3: Endpoint alternativo');
  try {
    const response3 = await fetch('https://api.urbanautobot.com/instance/createInstance', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: instanceName
      })
    });
    
    const text3 = await response3.text();
    console.log(`Status: ${response3.status}`);
    console.log(`Response: ${text3}`);
    
    if (response3.ok) {
      console.log('✅ Endpoint alternativo funciona!');
      return { success: true, method: 'alternative' };
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 4: Verificar se podemos usar uma instância existente
  console.log('\n📋 Teste 4: Verificando instâncias disponíveis para uso');
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
      console.log('📊 Instâncias disponíveis:');
      
      data.forEach((inst, index) => {
        console.log(`${index + 1}. Nome: ${inst.name}`);
        console.log(`   Status: ${inst.connectionStatus}`);
        console.log(`   Token: ${inst.token}`);
        console.log(`   Integração: ${inst.integration}`);
        console.log('---');
      });
      
      // Sugerir usar uma instância existente se disponível
      const availableInstance = data.find(inst => 
        inst.connectionStatus === 'open' && inst.name !== 'empresa-whatsapp'
      );
      
      if (availableInstance) {
        console.log(`💡 Sugestão: Usar instância existente "${availableInstance.name}"`);
        console.log('   Status: Conectada e disponível');
        console.log('   Token:', availableInstance.token);
        
        // Testar conectividade da instância existente
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
        
        if (connectResponse.ok) {
          const connectData = JSON.parse(connectText);
          if (connectData.base64 || connectData.qrcode) {
            console.log('✅ QR Code disponível!');
            return { success: true, method: 'existing', instanceName: availableInstance.name, qrData: connectData };
          }
        }
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar instâncias: ${error.message}`);
  }
  
  // Teste 5: Tentar criar com nome diferente
  console.log('\n📋 Teste 5: Criando com nome diferente');
  const altInstanceName = 'empresa-whatsapp-' + Date.now();
  try {
    const response5 = await fetch('https://api.urbanautobot.com/instance/create', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: altInstanceName
      })
    });
    
    const text5 = await response5.text();
    console.log(`Status: ${response5.status}`);
    console.log(`Response: ${text5}`);
    
    if (response5.ok) {
      console.log(`✅ Instância "${altInstanceName}" criada!`);
      return { success: true, method: 'alternative-name', instanceName: altInstanceName };
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  return { success: false };
}

// Executar teste
testExactStructure().then(result => {
  if (result.success) {
    console.log('\n🎉 Método que funciona encontrado!');
    console.log('Método:', result.method);
    
    if (result.instanceName) {
      console.log('Instância:', result.instanceName);
    }
    
    if (result.qrData) {
      console.log('✅ QR Code disponível!');
      console.log('📱 Próximo passo: Escanear QR Code');
    }
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Se há QR Code: Escanear com WhatsApp');
    console.log('2. Atualizar Edge Function com o nome da instância');
    console.log('3. Testar envio de mensagens');
  } else {
    console.log('\n⚠️ Nenhum método funcionou');
    console.log('💡 Considerar usar uma instância existente ou contatar suporte da API');
  }
});
