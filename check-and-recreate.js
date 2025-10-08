// Script para verificar instâncias existentes e recriar empresa-whatsapp se necessário
// Execute no console do navegador

async function checkAndRecreate() {
  console.log('🧪 Verificando instâncias existentes e recriando empresa-whatsapp...');
  
  const apiKey = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
  const instanceName = 'empresa-whatsapp';
  
  // Verificar instâncias existentes
  console.log('\n📋 Verificando instâncias existentes...');
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
    
    if (fetchResponse.ok) {
      const data = JSON.parse(fetchText);
      console.log('📊 Instâncias existentes:', data.length);
      
      data.forEach((inst, index) => {
        console.log(`${index + 1}. Nome: ${inst.name}`);
        console.log(`   Status: ${inst.connectionStatus}`);
        console.log(`   Token: ${inst.token}`);
        console.log(`   Integração: ${inst.integration}`);
        console.log('---');
      });
      
      // Procurar por empresa-whatsapp
      const empresaInstance = data.find(inst => 
        inst.name === 'empresa-whatsapp'
      );
      
      if (empresaInstance) {
        console.log('✅ Instância empresa-whatsapp encontrada!');
        console.log('Status:', empresaInstance.connectionStatus);
        console.log('Token:', empresaInstance.token);
        
        if (empresaInstance.connectionStatus === 'open') {
          console.log('🎉 WhatsApp já conectado!');
          return { success: true, connected: true, instance: empresaInstance };
        } else {
          console.log('⚠️ Instância existe mas não está conectada');
          return { success: true, connected: false, instance: empresaInstance };
        }
      } else {
        console.log('⚠️ Instância empresa-whatsapp não encontrada');
        console.log('💡 Vou recriar a instância...');
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar instâncias: ${error.message}`);
  }
  
  // Recriar instância empresa-whatsapp
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
    console.log(`Status: ${createResponse.status}`);
    console.log(`Response: ${createText}`);
    
    if (createResponse.ok) {
      console.log('✅ Instância empresa-whatsapp recriada com sucesso!');
      
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

// Executar verificação e recriação
checkAndRecreate().then(result => {
  if (result.success) {
    if (result.connected) {
      console.log('\n🎉 SUCESSO! WhatsApp já conectado!');
      console.log('✅ Instância empresa-whatsapp está pronta');
      console.log('🚀 Sistema pronto para próxima fase!');
    } else if (result.qrData) {
      console.log('\n🎉 Instância recriada com sucesso!');
      console.log('✅ QR Code disponível para escaneamento');
      console.log('📱 Escaneie o QR Code que apareceu na tela');
      console.log('💡 Execute o script de verificação após escanear');
    } else {
      console.log('\n⚠️ Instância recriada mas sem QR Code');
      console.log('💡 Verificar logs e tentar novamente');
    }
  } else {
    console.log('\n⚠️ Falha ao recriar instância');
    console.log('💡 Verificar logs e tentar novamente');
  }
});
