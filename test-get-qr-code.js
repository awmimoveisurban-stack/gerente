// Script para obter QR Code da instância empresa-whatsapp criada
// Execute no console do navegador

async function getQRCode() {
  console.log('🧪 Obtendo QR Code para empresa-whatsapp...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  // Conectar e obter QR Code
  console.log('\n🔗 Conectando instância e obtendo QR Code...');
  try {
    const connectResponse = await fetch('https://api.urbanautobot.com/instance/connect', {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const connectText = await connectResponse.text();
    console.log(`Status: ${connectResponse.status}`);
    console.log(`Response: ${connectText}`);
    
    if (connectResponse.ok) {
      const connectData = JSON.parse(connectText);
      console.log('✅ Conexão estabelecida!');
      
      if (connectData.base64 || connectData.qrcode) {
        console.log('✅ QR Code disponível para escaneamento!');
        console.log('📱 Próximo passo: Escanear QR Code com WhatsApp');
        
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
        
        if (connectData.qrcode) {
          console.log('📱 QR Code String:', connectData.qrcode);
        }
        
        return { success: true, qrData: connectData };
      } else {
        console.log('⚠️ QR Code não encontrado na resposta');
        console.log('📊 Dados completos:', connectData);
      }
    } else {
      console.log('⚠️ Erro ao conectar instância');
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Verificar estado da conexão
  console.log('\n📋 Verificando estado da conexão...');
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
  
  // Verificar instâncias para confirmar criação
  console.log('\n📋 Verificando instâncias para confirmar...');
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
        console.log('✅ Instância empresa-whatsapp confirmada!');
        console.log('📊 Status:', empresaInstance.connectionStatus);
        console.log('📊 Token:', empresaInstance.token);
        console.log('📊 Integração:', empresaInstance.integration);
      } else {
        console.log('⚠️ Instância empresa-whatsapp não encontrada na lista');
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar instâncias: ${error.message}`);
  }
  
  return { success: false };
}

// Executar obtenção do QR Code
getQRCode().then(result => {
  if (result.success) {
    console.log('\n🎉 QR Code obtido com sucesso!');
    console.log('✅ Instância empresa-whatsapp está pronta para conexão');
    console.log('📱 Escaneie o QR Code que apareceu na tela com seu WhatsApp');
    
    console.log('\n📋 Próximos passos:');
    console.log('1. ✅ Escanear QR Code com WhatsApp');
    console.log('2. 🔄 Aguardar status mudar para "open"');
    console.log('3. ⚙️ Configurar Edge Function no Supabase');
    console.log('4. 🧪 Testar envio de mensagens');
  } else {
    console.log('\n⚠️ Falha ao obter QR Code');
    console.log('💡 Verificar logs e tentar novamente');
  }
});
