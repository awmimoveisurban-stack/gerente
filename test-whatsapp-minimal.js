// TESTE WHATSAPP MINIMAL - COPIAR E COLAR NO CONSOLE

function testWhatsApp() {
  console.log('🧪 Teste WhatsApp iniciado...');
  
  // Verificar página
  if (!window.location.pathname.includes('whatsapp')) {
    console.log('❌ Navegue para /gerente-whatsapp primeiro');
    return;
  }
  
  console.log('✅ Página WhatsApp detectada');
  
  // Buscar botões WhatsApp
  var buttons = document.querySelectorAll('button');
  var whatsappButtons = [];
  
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    if (btn.textContent && btn.textContent.includes('WhatsApp')) {
      whatsappButtons.push(btn);
    }
  }
  
  console.log('📱 Botões WhatsApp encontrados:', whatsappButtons.length);
  
  // Mostrar botões
  whatsappButtons.forEach(function(btn, index) {
    console.log('   ' + (index + 1) + '. "' + btn.textContent.trim() + '"');
  });
  
  // Buscar QR Code
  var qrImages = document.querySelectorAll('img[alt*="QR"], img[alt*="qr"]');
  console.log('🔍 QR Codes encontrados:', qrImages.length);
  
  // Buscar status
  var statusElements = document.querySelectorAll('[class*="badge"]');
  var statusTexts = [];
  
  for (var i = 0; i < statusElements.length; i++) {
    var text = statusElements[i].textContent ? statusElements[i].textContent.trim() : '';
    if (text && text.length < 30) {
      statusTexts.push(text);
    }
  }
  
  console.log('📊 Status encontrados:', statusTexts);
  
  // Buscar erros
  var errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
  var hasErrors = errorElements.length > 0;
  
  if (hasErrors) {
    console.log('⚠️ Elementos de erro encontrados:', errorElements.length);
  }
  
  // Testar botão conectar
  var connectBtn = null;
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent && buttons[i].textContent.includes('Conectar WhatsApp')) {
      connectBtn = buttons[i];
      break;
    }
  }
  
  if (connectBtn) {
    console.log('🧪 Botão Conectar WhatsApp encontrado');
    
    if (!connectBtn.disabled) {
      console.log('✅ Botão habilitado');
      console.log('💡 Clique no botão para testar a conexão');
    } else {
      console.log('⚠️ Botão desabilitado (pode estar carregando)');
    }
  } else {
    console.log('⚠️ Botão Conectar WhatsApp não encontrado');
  }
  
  // Resumo
  console.log('\n📋 RESUMO:');
  console.log('✅ Página: WhatsApp carregada');
  console.log('📱 Botões: ' + whatsappButtons.length);
  console.log('🔍 QR Codes: ' + qrImages.length);
  console.log('📊 Status: ' + (statusTexts.length > 0 ? statusTexts.join(', ') : 'Nenhum'));
  console.log('⚠️ Erros: ' + (hasErrors ? 'Sim' : 'Não'));
  
  if (whatsappButtons.length > 0 && !hasErrors) {
    console.log('\n🎉 PÁGINA WHATSAPP FUNCIONANDO!');
  } else {
    console.log('\n⚠️ VERIFICAR PROBLEMAS');
  }
}

// Executar teste
testWhatsApp();

console.log('💡 Execute testWhatsApp() para rodar novamente');





