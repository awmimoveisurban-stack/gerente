// Teste da Evolution API - VERSÃO CORRIGIDA
// Execute no console do navegador

async function testEvolutionAPIFixed() {
  console.log('🧪 Testando Evolution API - VERSÃO CORRIGIDA...');
  
  const config = {
    url: 'https://api.urbanautobot.com',
    apiKey: 'cfd9b746ea9e400dc8f4d3e8d57b0180'
  };
  
  try {
    // Teste 1: Verificar instâncias existentes
    console.log('\n📋 Teste 1: Verificando instâncias existentes...');
    const fetchResponse = await fetch(`${config.url}/instance/fetchInstances`, {
      method: 'GET',
      headers: {
        'apikey': config.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (fetchResponse.ok) {
      const data = await fetchResponse.json();
      console.log(`✅ Instâncias encontradas: (${data.length})`);
      
      const empresaInstance = data.find(inst => inst.name === 'empresa-whatsapp');
      if (empresaInstance) {
        console.log('✅ Instância empresa-whatsapp encontrada!');
        console.log('📊 Status:', empresaInstance.connectionStatus);
        console.log('📊 Token:', empresaInstance.token);
        console.log('📊 Integração:', empresaInstance.integration);
        
        // Verificar status da conexão
        console.log('\n📋 Verificando status da conexão...');
        const stateResponse = await fetch(`${config.url}/instance/connectionState/empresa-whatsapp`, {
          method: 'GET',
          headers: {
            'apikey': config.apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (stateResponse.ok) {
          const stateData = await stateResponse.json();
          const connectionState = stateData.instance?.state;
          
          console.log(`📊 Status da conexão: ${connectionState}`);
          
          if (connectionState === 'open') {
            console.log('🎉 WhatsApp conectado com sucesso!');
            console.log('✅ Instância pronta para uso');
            
            console.log('\n🎉 PRÓXIMOS PASSOS:');
            console.log('1. ✅ WhatsApp conectado');
            console.log('2. ⚙️ Configurar Edge Function');
            console.log('3. 🧪 Testar envio de mensagens');
            
            return { success: true, connected: true };
            
          } else if (connectionState === 'connecting') {
            console.log('⏳ WhatsApp conectando...');
            console.log('💡 Aguarde a conexão ser estabelecida');
            
          } else if (connectionState === 'close') {
            console.log('⚠️ WhatsApp desconectado');
            console.log('💡 Pode ser necessário escanear QR Code novamente');
            
          } else {
            console.log(`📊 Status: ${connectionState}`);
          }
        }
        
      } else {
        console.log('⚠️ Instância empresa-whatsapp não encontrada');
        console.log('💡 Vamos criar uma nova instância...');
        
        // Teste 2: Criar instância com payload correto
        console.log('\n📋 Teste 2: Criando instância empresa-whatsapp...');
        const createResponse = await fetch(`${config.url}/instance/create`, {
          method: 'POST',
          headers: {
            'apikey': config.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instanceName: 'empresa-whatsapp',
            integration: 'WHATSAPP-BAILEYS' // Campo obrigatório
          })
        });
        
        const createText = await createResponse.text();
        console.log(`Create Status: ${createResponse.status}`);
        console.log(`Create Response: ${createText}`);
        
        if (createResponse.ok) {
          console.log('✅ Instância empresa-whatsapp criada com sucesso!');
          
          // Aguardar um pouco antes de conectar
          console.log('\n⏳ Aguardando 3 segundos antes de conectar...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Conectar e obter QR Code
          console.log('\n🔗 Conectando e obtendo QR Code...');
          const connectResponse = await fetch(`${config.url}/instance/connect/empresa-whatsapp`, {
            method: 'GET',
            headers: {
              'apikey': config.apiKey,
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
              
              // Mostrar QR Code se disponível
              if (connectData.base64) {
                console.log('📱 QR Code Base64:', connectData.base64);
                
                // Criar elemento de imagem para mostrar QR Code
                const img = document.createElement('img');
                img.src = `data:image/png;base64,${connectData.base64}`;
                img.style.maxWidth = '300px';
                img.style.border = '2px solid #25D366';
                img.style.borderRadius = '10px';
                img.style.margin = '10px';
                
                // Adicionar ao DOM
                document.body.appendChild(img);
                
                // Adicionar texto explicativo
                const text = document.createElement('p');
                text.innerHTML = '📱 <strong>Escaneie este QR Code com seu WhatsApp:</strong>';
                text.style.fontSize = '16px';
                text.style.color = '#25D366';
                text.style.margin = '10px';
                document.body.appendChild(text);
              }
              
              console.log('\n🎉 PRÓXIMOS PASSOS:');
              console.log('1. 📱 Escaneie o QR Code que apareceu na tela');
              console.log('2. ⏳ Aguarde a conexão ser estabelecida');
              console.log('3. ✅ Execute o script de verificação após escanear');
              
              return { success: true, qrCode: true };
            }
          } else {
            console.log('⚠️ Erro ao conectar instância');
          }
        } else {
          console.log(`❌ Erro ao criar instância: ${createResponse.status}`);
          console.log(`Erro: ${createText}`);
        }
      }
      
    } else {
      console.log(`❌ Erro ao buscar instâncias: ${fetchResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  console.log('\n🎉 Teste da Evolution API concluído!');
}

// Executar teste
testEvolutionAPIFixed();
