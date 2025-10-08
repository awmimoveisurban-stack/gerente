// Script para testar diferentes variantes de integração
// Execute no console do navegador

async function testIntegrationVariants() {
  console.log('🧪 Testando variantes de integração...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'teste-integration-' + Date.now();
  
  const variants = [
    {
      name: 'Variant A: apikey header + WHATSAPP-BAILEYS',
      headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
      body: {
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        webhook: 'https://webhook.site/test',
        webhook_by_events: true,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      }
    },
    {
      name: 'Variant B: Authorization Bearer + WHATSAPP-BAILEYS',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: {
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        webhook: 'https://webhook.site/test',
        webhook_by_events: true,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      }
    },
    {
      name: 'Variant C: apikey header + WHATSAPP',
      headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
      body: {
        instanceName,
        integration: 'WHATSAPP',
        webhook: 'https://webhook.site/test',
        webhook_by_events: true,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      }
    },
    {
      name: 'Variant D: Authorization Bearer + WHATSAPP',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: {
        instanceName,
        integration: 'WHATSAPP',
        webhook: 'https://webhook.site/test',
        webhook_by_events: true,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      }
    },
    {
      name: 'Variant E: apikey header + BAILEYS',
      headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
      body: {
        instanceName,
        integration: 'BAILEYS',
        webhook: 'https://webhook.site/test',
        webhook_by_events: true,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      }
    },
    {
      name: 'Variant F: apikey header + sem integration',
      headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
      body: {
        instanceName,
        webhook: 'https://webhook.site/test',
        webhook_by_events: true,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      }
    }
  ];
  
  for (const variant of variants) {
    console.log(`\n📋 Testando: ${variant.name}`);
    
    try {
      const response = await fetch('https://api.urbanautobot.com/instance/create', {
        method: 'POST',
        headers: variant.headers,
        body: JSON.stringify(variant.body)
      });
      
      const responseText = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${responseText}`);
      
      if (response.ok) {
        console.log('✅ SUCESSO! Esta variante funciona');
        return { success: true, variant, response: responseText };
      } else {
        console.log(`❌ Falhou: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🔍 Nenhuma variante funcionou. Testando endpoint base...');
  
  // Teste do endpoint base
  try {
    const baseResponse = await fetch('https://api.urbanautobot.com/', {
      headers: { 'apikey': apiKey }
    });
    const baseText = await baseResponse.text();
    console.log('Base endpoint response:', baseText);
  } catch (error) {
    console.log('Base endpoint error:', error.message);
  }
  
  return { success: false };
}

// Executar teste
testIntegrationVariants().then(result => {
  if (result.success) {
    console.log('\n🎉 Variante que funciona encontrada!');
    console.log('Use esta configuração no script principal.');
  } else {
    console.log('\n⚠️ Nenhuma variante funcionou. Verifique a documentação da API.');
  }
});
