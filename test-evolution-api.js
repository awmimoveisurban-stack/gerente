// Script para testar a Evolution API
// Execute este script no console do navegador na página WhatsApp

async function testEvolutionAPI() {
  console.log('🧪 Testando Evolution API...');
  
  const config = {
    url: 'https://api.urbanautobot.com',
    apiKey: 'cfd9b746ea9e400dc8f4d3e8d57b0180'
  };
  
  try {
    // Teste 1: Verificar instâncias existentes
    console.log('📋 Teste 1: Verificando instâncias existentes...');
    const instancesResponse = await fetch(`${config.url}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (instancesResponse.ok) {
      const instancesData = await instancesResponse.json();
      console.log('✅ Instâncias encontradas:', instancesData);
      
      // Verificar se existe instância empresa-whatsapp
      const empresaInstance = instancesData.data?.find(inst => 
        inst.instance?.instanceName === 'empresa-whatsapp'
      );
      
      if (empresaInstance) {
        console.log('✅ Instância empresa-whatsapp encontrada:', empresaInstance);
        console.log('📊 Status da conexão:', empresaInstance.instance?.connectionState);
      } else {
        console.log('⚠️ Instância empresa-whatsapp não encontrada');
      }
    } else {
      console.error('❌ Erro ao buscar instâncias:', instancesResponse.status);
      const errorText = await instancesResponse.text();
      console.error('Erro detalhado:', errorText);
    }
    
    // Teste 2: Criar instância de teste
    console.log('\n📋 Teste 2: Criando instância de teste...');
    const testInstanceName = 'teste-api-' + Date.now();
    
    const createResponse = await fetch(`${config.url}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: testInstanceName,
        webhook: 'https://webhook.site/test',
        webhook_by_events: true,
        events: ['CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      })
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Instância de teste criada:', createData);
      
      // Teste 3: Conectar e obter QR Code
      console.log('\n📋 Teste 3: Obtendo QR Code...');
      const qrResponse = await fetch(`${config.url}/instance/connect`, {
        method: 'POST',
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instanceName: testInstanceName
        })
      });
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        console.log('✅ QR Code obtido:', qrData);
        
        if (qrData.base64 || qrData.qrcode) {
          console.log('✅ QR Code disponível para escaneamento');
        } else {
          console.log('⚠️ QR Code não encontrado na resposta');
        }
      } else {
        console.error('❌ Erro ao obter QR Code:', qrResponse.status);
        const errorText = await qrResponse.text();
        console.error('Erro detalhado:', errorText);
      }
      
      // Limpeza: Deletar instância de teste
      console.log('\n🧹 Limpando instância de teste...');
      const deleteResponse = await fetch(`${config.url}/instance/delete`, {
        method: 'DELETE',
        headers: {
          'apikey': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instanceName: testInstanceName
        })
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Instância de teste removida');
      } else {
        console.log('⚠️ Erro ao remover instância de teste:', deleteResponse.status);
      }
      
    } else {
      console.error('❌ Erro ao criar instância de teste:', createResponse.status);
      const errorText = await createResponse.text();
      console.error('Erro detalhado:', errorText);
    }
    
    console.log('\n🎉 Teste da Evolution API concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testEvolutionAPI();