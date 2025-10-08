// Script corrigido para conectar instância e obter QR Code
// Execute no console do navegador

async function connectInstanceFixed() {
  console.log('🧪 Conectando instância empresa-whatsapp (método corrigido)...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  // Método 1: GET /instance/connect/{instanceName}
  console.log('\n📋 Método 1: GET /instance/connect/{instanceName}');
  try {
    const connectResponse = await fetch(`https://api.urbanautobot.com/instance/connect/${instanceName}`, {
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
        
        return { success: true, qrData: connectData };
      } else {
        console.log('⚠️ QR Code não encontrado na resposta');
        console.log('📊 Dados completos:', connectData);
      }
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Método 2: POST /instance/connect/{instanceName}
  console.log('\n📋 Método 2: POST /instance/connect/{instanceName}');
  try {
    const connectResponse = await fetch(`https://api.urbanautobot.com/instance/connect/${instanceName}`, {
      method: 'POST',
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
        
        if (connectData.base64) {
          console.log('📱 QR Code Base64:', connectData.base64);
          
          // Criar elemento de imagem
          const img = document.createElement('img');
          img.src = `data:image/png;base64,${connectData.base64}`;
          img.style.maxWidth = '300px';
          img.style.border = '2px solid #25D366';
          img.style.borderRadius = '10px';
          img.style.margin = '10px';
          document.body.appendChild(img);
          
          const text = document.createElement('p');
          text.innerHTML = '📱 <strong>Escaneie este QR Code com seu WhatsApp:</strong>';
          text.style.fontSize = '16px';
          text.style.color = '#25D366';
          text.style.margin = '10px';
          document.body.appendChild(text);
        }
        
        return { success: true, qrData: connectData };
      }
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Método 3: POST /instance/connect com body
  console.log('\n📋 Método 3: POST /instance/connect com body');
  try {
    const connectResponse = await fetch('https://api.urbanautobot.com/instance/connect', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: instanceName
      })
    });
    
    const connectText = await connectResponse.text();
    console.log(`Status: ${connectResponse.status}`);
    console.log(`Response: ${connectText}`);
    
    if (connectResponse.ok) {
      const connectData = JSON.parse(connectText);
      console.log('✅ Conexão estabelecida!');
      
      if (connectData.base64 || connectData.qrcode) {
        console.log('✅ QR Code disponível para escaneamento!');
        
        if (connectData.base64) {
          console.log('📱 QR Code Base64:', connectData.base64);
          
          // Criar elemento de imagem
          const img = document.createElement('img');
          img.src = `data:image/png;base64,${connectData.base64}`;
          img.style.maxWidth = '300px';
          img.style.border = '2px solid #25D366';
          img.style.borderRadius = '10px';
          img.style.margin = '10px';
          document.body.appendChild(img);
          
          const text = document.createElement('p');
          text.innerHTML = '📱 <strong>Escaneie este QR Code com seu WhatsApp:</strong>';
          text.style.fontSize = '16px';
          text.style.color = '#25D366';
          text.style.margin = '10px';
          document.body.appendChild(text);
        }
        
        return { success: true, qrData: connectData };
      }
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  // Verificar estado atual
  console.log('\n📋 Estado atual da instância:');
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

// Executar conexão corrigida
connectInstanceFixed().then(result => {
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
    console.log('💡 Pode ser que a instância precise ser reiniciada');
  }
});
