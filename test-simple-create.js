// Script para testar criação simples sem integration
// Execute no console do navegador

async function testSimpleCreate() {
  console.log('🧪 Testando criação simples...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'teste-simple-' + Date.now();
  
  // Teste 1: Payload mínimo sem integration
  console.log('\n📋 Teste 1: Payload mínimo');
  try {
    const response1 = await fetch('https://api.urbanautobot.com/instance/create', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName
      })
    });
    
    const text1 = await response1.text();
    console.log(`Status: ${response1.status}`);
    console.log(`Response: ${text1}`);
    
    if (response1.ok) {
      console.log('✅ Payload mínimo funciona!');
      return { success: true, method: 'minimal', instanceName };
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 2: Endpoint alternativo
  console.log('\n📋 Teste 2: Endpoint alternativo /instance/createInstance');
  try {
    const response2 = await fetch('https://api.urbanautobot.com/instance/createInstance', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName
      })
    });
    
    const text2 = await response2.text();
    console.log(`Status: ${response2.status}`);
    console.log(`Response: ${text2}`);
    
    if (response2.ok) {
      console.log('✅ Endpoint alternativo funciona!');
      return { success: true, method: 'alternative', instanceName };
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 3: Com webhook mas sem integration
  console.log('\n📋 Teste 3: Com webhook sem integration');
  try {
    const response3 = await fetch('https://api.urbanautobot.com/instance/create', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName,
        webhook: 'https://webhook.site/test'
      })
    });
    
    const text3 = await response3.text();
    console.log(`Status: ${response3.status}`);
    console.log(`Response: ${text3}`);
    
    if (response3.ok) {
      console.log('✅ Com webhook funciona!');
      return { success: true, method: 'webhook', instanceName };
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 4: Verificar se já existe instância empresa-whatsapp
  console.log('\n📋 Teste 4: Verificando instância existente empresa-whatsapp');
  try {
    const response4 = await fetch('https://api.urbanautobot.com/instance/fetchInstances', {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const text4 = await response4.text();
    console.log(`Status: ${response4.status}`);
    console.log(`Response: ${text4}`);
    
    if (response4.ok) {
      const data = JSON.parse(text4);
      console.log('📊 Instâncias existentes:', data);
      
      // Procurar por empresa-whatsapp
      const empresaInstance = data.data?.find(inst => 
        inst.instance?.instanceName === 'empresa-whatsapp'
      );
      
      if (empresaInstance) {
        console.log('✅ Instância empresa-whatsapp já existe!');
        console.log('📊 Status:', empresaInstance.instance?.connectionState);
        return { success: true, method: 'existing', instanceName: 'empresa-whatsapp' };
      } else {
        console.log('⚠️ Instância empresa-whatsapp não existe');
      }
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Teste 5: Tentar criar empresa-whatsapp diretamente
  console.log('\n📋 Teste 5: Criando empresa-whatsapp diretamente');
  try {
    const response5 = await fetch('https://api.urbanautobot.com/instance/create', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: 'empresa-whatsapp'
      })
    });
    
    const text5 = await response5.text();
    console.log(`Status: ${response5.status}`);
    console.log(`Response: ${text5}`);
    
    if (response5.ok) {
      console.log('✅ empresa-whatsapp criada!');
      return { success: true, method: 'empresa-whatsapp', instanceName: 'empresa-whatsapp' };
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  return { success: false };
}

// Executar teste
testSimpleCreate().then(result => {
  if (result.success) {
    console.log('\n🎉 Método que funciona encontrado!');
    console.log('Método:', result.method);
    console.log('Instância:', result.instanceName);
    
    // Se funcionou, testar conectividade
    if (result.instanceName) {
      console.log('\n🔗 Testando conectividade...');
      fetch('https://api.urbanautobot.com/instance/connect', {
        method: 'POST',
        headers: {
          'apikey': 'cfd9b746ea9e400dc8f4d3e8d57b0180',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instanceName: result.instanceName
        })
      }).then(async r => {
        const text = await r.text();
        console.log(`Connect Status: ${r.status}`);
        console.log(`Connect Response: ${text}`);
      });
    }
  } else {
    console.log('\n⚠️ Nenhum método funcionou');
  }
});
