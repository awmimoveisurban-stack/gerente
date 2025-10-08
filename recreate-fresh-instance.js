// Script para recriar instância com QR Code fresco
// Execute no console do navegador

async function recreateFreshInstance() {
  console.log('🔄 Recriando instância com QR Code fresco...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  // Primeiro, tentar deletar a instância existente
  console.log('\n📋 Tentando deletar instância existente...');
  try {
    const deleteResponse = await fetch(`https://api.urbanautobot.com/instance/delete/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const deleteText = await deleteResponse.text();
    console.log(`Delete Status: ${deleteResponse.status}`);
    console.log(`Delete Response: ${deleteText}`);
    
    if (deleteResponse.ok) {
      console.log('✅ Instância deletada com sucesso!');
    } else {
      console.log('⚠️ Erro ao deletar instância (pode não existir)');
    }
  } catch (error) {
    console.log(`❌ Erro ao deletar: ${error.message}`);
  }
  
  // Aguardar um pouco antes de recriar
  console.log('\n⏳ Aguardando 5 segundos antes de recriar...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Recriar instância
  console.log('\n📋 Recriando instância empresa-whatsapp...');
  try {
    const createResponse = await fetch('https://api.urbanautobot.com/instance/create', {
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
    
    const createText = await createResponse.text();
    console.log(`Create Status: ${createResponse.status}`);
    console.log(`Create Response: ${createText}`);
    
    if (createResponse.ok) {
      console.log('✅ Instância empresa-whatsapp recriada com sucesso!');
      
      // Aguardar um pouco antes de conectar
      console.log('\n⏳ Aguardando 3 segundos antes de conectar...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Conectar e obter QR Code
      console.log('\n🔗 Conectando e obtendo QR Code...');
      const connectResponse = await fetch(`https://api.urbanautobot.com/instance/connect/${instanceName}`, {
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
          
          return { success: true, qrData: connectData };
        } else {
          console.log('⚠️ QR Code não encontrado na resposta');
        }
      } else {
        console.log('⚠️ Erro ao conectar instância');
      }
    } else {
      console.log(`❌ Erro ao recriar instância: ${createResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
  
  return { success: false };
}

// Executar recriação
recreateFreshInstance().then(result => {
  if (result.success) {
    console.log('\n🎉 Instância recriada com sucesso!');
    console.log('✅ QR Code fresco disponível para escaneamento');
    console.log('📱 Escaneie o QR Code que apareceu na tela');
    console.log('💡 Execute o script de verificação após escanear');
  } else {
    console.log('\n⚠️ Falha ao recriar instância');
    console.log('💡 Verificar logs e tentar novamente');
  }
});
