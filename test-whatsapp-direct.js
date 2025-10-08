// TESTE WHATSAPP - COPIAR E COLAR NO CONSOLE
console.log('🧪 Teste WhatsApp iniciado...');

// Verificar página
if (!window.location.pathname.includes('whatsapp')) {
  console.log('❌ Navegue para /gerente-whatsapp primeiro');
} else {
  console.log('✅ Página WhatsApp detectada');
  
  // Buscar botões
  var buttons = document.querySelectorAll('button');
  var whatsappButtons = [];
  
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent && buttons[i].textContent.includes('WhatsApp')) {
      whatsappButtons.push(buttons[i]);
    }
  }
  
  console.log('📱 Botões WhatsApp encontrados:', whatsappButtons.length);
  
  // Listar botões
  whatsappButtons.forEach(function(btn, index) {
    console.log('   ' + (index + 1) + '. "' + btn.textContent.trim() + '" - Disabled: ' + btn.disabled);
  });
  
  // Buscar QR Code
  var images = document.querySelectorAll('img');
  var qrCodes = [];
  
  for (var i = 0; i < images.length; i++) {
    if (images[i].alt && (images[i].alt.includes('QR') || images[i].alt.includes('qr'))) {
      qrCodes.push(images[i]);
    }
  }
  
  console.log('🔍 QR Codes encontrados:', qrCodes.length);
  
  // Buscar status
  var statusElements = document.querySelectorAll('[class*="badge"], [class*="status"]');
  var statusTexts = [];
  
  for (var i = 0; i < statusElements.length; i++) {
    var text = statusElements[i].textContent ? statusElements[i].textContent.trim() : '';
    if (text && text.length < 50) {
      statusTexts.push(text);
    }
  }
  
  console.log('📊 Status encontrados:', statusTexts);
  
  // Buscar erros
  var errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
  var errorTexts = [];
  
  for (var i = 0; i < errorElements.length; i++) {
    var text = errorElements[i].textContent ? errorElements[i].textContent.trim() : '';
    if (text && text.length < 100) {
      errorTexts.push(text);
    }
  }
  
  if (errorTexts.length > 0) {
    console.log('⚠️ Erros encontrados:', errorTexts);
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
      console.log('✅ Botão habilitado - testando clique...');
      connectBtn.click();
      
      setTimeout(function() {
        console.log('⏰ Verificando mudanças após clique...');
        
        // Verificar novos QR Codes
        var newImages = document.querySelectorAll('img');
        var newQrCodes = [];
        
        for (var i = 0; i < newImages.length; i++) {
          if (newImages[i].alt && (newImages[i].alt.includes('QR') || newImages[i].alt.includes('qr'))) {
            newQrCodes.push(newImages[i]);
          }
        }
        
        if (newQrCodes.length > qrCodes.length) {
          console.log('✅ QR Code gerado com sucesso!');
        }
        
        // Verificar mudança de status
        var newStatusElements = document.querySelectorAll('[class*="badge"], [class*="status"]');
        var newStatusTexts = [];
        
        for (var i = 0; i < newStatusElements.length; i++) {
          var text = newStatusElements[i].textContent ? newStatusElements[i].textContent.trim() : '';
          if (text && text.length < 50) {
            newStatusTexts.push(text);
          }
        }
        
        if (newStatusTexts.length !== statusTexts.length) {
          console.log('✅ Status alterado:', newStatusTexts);
        }
        
        // Verificar se botão mudou
        if (connectBtn.disabled) {
          console.log('✅ Botão foi desabilitado (loading)');
        }
        
      }, 3000);
      
    } else {
      console.log('⚠️ Botão Conectar está desabilitado');
    }
  } else {
    console.log('⚠️ Botão Conectar WhatsApp não encontrado');
  }
  
  // Resumo final
  console.log('\n📋 RESUMO:');
  console.log('==========');
  console.log('✅ Página WhatsApp carregada');
  console.log('📱 Botões WhatsApp: ' + whatsappButtons.length);
  console.log('🔍 QR Codes: ' + qrCodes.length);
  console.log('📊 Status: ' + (statusTexts.length > 0 ? statusTexts.join(', ') : 'Nenhum'));
  console.log('⚠️ Erros: ' + (errorTexts.length > 0 ? errorTexts.length : 'Nenhum'));
  
  if (whatsappButtons.length > 0 && errorTexts.length === 0) {
    console.log('\n🎉 PÁGINA WHATSAPP FUNCIONANDO!');
    console.log('💡 Dica: Clique no botão "Conectar WhatsApp" para testar');
  } else if (errorTexts.length > 0) {
    console.log('\n❌ PROBLEMAS DETECTADOS:');
    for (var i = 0; i < errorTexts.length; i++) {
      console.log('   ' + (i + 1) + '. ' + errorTexts[i]);
    }
  } else {
    console.log('\n⚠️ PÁGINA CARREGADA MAS PODE TER PROBLEMAS');
  }
}

console.log('🔍 Teste concluído. Verifique os resultados acima.');





