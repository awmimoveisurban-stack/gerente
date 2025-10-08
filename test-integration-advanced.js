// Script para testar mais variantes de integração baseado na Evolution API 2.3.2
// Execute no console do navegador

async function testAdvancedIntegrationVariants() {
  console.log('🧪 Testando variantes avançadas de integração...');
  console.log('📋 Evolution API v2.3.2 detectada');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'teste-advanced-' + Date.now();
  
  // Baseado na documentação da Evolution API 2.3.2
  const variants = [
    {
      name: 'Variant 1: integration: "whatsapp-baileys"',
      body: {
        instanceName,
        integration: "whatsapp-baileys",
        webhook: "https://webhook.site/test",
        webhook_by_events: true,
        events: ["CONNECTION_UPDATE", "MESSAGES_UPSERT"]
      }
    },
    {
      name: 'Variant 2: integration: "baileys"',
      body: {
        instanceName,
        integration: "baileys",
        webhook: "https://webhook.site/test",
        webhook_by_events: true,
        events: ["CONNECTION_UPDATE", "MESSAGES_UPSERT"]
      }
    },
    {
      name: 'Variant 3: integration: "whatsapp"',
      body: {
        instanceName,
        integration: "whatsapp",
        webhook: "https://webhook.site/test",
        webhook_by_events: true,
        events: ["CONNECTION_UPDATE", "MESSAGES_UPSERT"]
      }
    },
    {
      name: 'Variant 4: sem integration (padrão)',
      body: {
        instanceName,
        webhook: "https://webhook.site/test",
        webhook_by_events: true,
        events: ["CONNECTION_UPDATE", "MESSAGES_UPSERT"]
      }
    },
    {
      name: 'Variant 5: payload mínimo',
      body: {
        instanceName
      }
    },
    {
      name: 'Variant 6: com qrcode: true',
      body: {
        instanceName,
        integration: "whatsapp-baileys",
        qrcode: true,
        webhook: "https://webhook.site/test"
      }
    },
    {
      name: 'Variant 7: com serverUrl',
      body: {
        instanceName,
        integration: "whatsapp-baileys",
        serverUrl: "https://api.urbanautobot.com",
        webhook: "https://webhook.site/test"
      }
    },
    {
      name: 'Variant 8: com token',
      body: {
        instanceName,
        integration: "whatsapp-baileys",
        token: apiKey,
        webhook: "https://webhook.site/test"
      }
    }
  ];
  
  for (const variant of variants) {
    console.log(`\n📋 Testando: ${variant.name}`);
    console.log('Payload:', JSON.stringify(variant.body, null, 2));
    
    try {
      const response = await fetch('https://api.urbanautobot.com/instance/create', {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(variant.body)
      });
      
      const responseText = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${responseText}`);
      
      if (response.ok) {
        console.log('✅ SUCESSO! Esta variante funciona');
        
        // Testar conectividade imediatamente
        console.log('\n🔗 Testando conectividade...');
        const connectResponse = await fetch('https://api.urbanautobot.com/instance/connect', {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instanceName: variant.body.instanceName
          })
        });
        
        const connectText = await connectResponse.text();
        console.log(`Connect Status: ${connectResponse.status}`);
        console.log(`Connect Response: ${connectText}`);
        
        return { success: true, variant, response: responseText, connectResponse: connectText };
      } else {
        console.log(`❌ Falhou: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🔍 Testando endpoints alternativos...');
  
  // Testar endpoint alternativo
  try {
    const altResponse = await fetch('https://api.urbanautobot.com/instance/createInstance', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: 'teste-alt-' + Date.now(),
        integration: "whatsapp-baileys"
      })
    });
    
    const altText = await altResponse.text();
    console.log('Alt endpoint status:', altResponse.status);
    console.log('Alt endpoint response:', altText);
    
    if (altResponse.ok) {
      console.log('✅ Endpoint alternativo funciona!');
      return { success: true, variant: 'alt', response: altText };
    }
  } catch (error) {
    console.log('Alt endpoint error:', error.message);
  }
  
  return { success: false };
}

// Executar teste avançado
testAdvancedIntegrationVariants().then(result => {
  if (result.success) {
    console.log('\n🎉 Variante que funciona encontrada!');
    console.log('Use esta configuração no script principal.');
    console.log('Resultado:', result);
  } else {
    console.log('\n⚠️ Nenhuma variante funcionou. Verificar documentação Evolution API 2.3.2');
  }
});
