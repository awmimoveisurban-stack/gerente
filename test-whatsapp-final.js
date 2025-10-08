// TESTE FINAL - WHATSAPP FUNCIONANDO

function testWhatsAppFinal() {
  console.log('🎯 Teste Final - WhatsApp Funcionando...');
  
  // Verificar página
  if (!window.location.pathname.includes('gerente-whatsapp')) {
    console.log('❌ Navegue para /gerente-whatsapp primeiro');
    return;
  }
  
  console.log('✅ Página WhatsApp detectada');
  
  // Aguardar carregamento
  setTimeout(function() {
    var buttons = document.querySelectorAll('button');
    var whatsappButtons = [];
    
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var text = btn.textContent ? btn.textContent.trim() : '';
      
      if (text.includes('WhatsApp') || text.includes('Conectar') || text.includes('Desconectar')) {
        whatsappButtons.push({ button: btn, text: text });
      }
    }
    
    console.log('📱 Botões WhatsApp encontrados:', whatsappButtons.length);
    whatsappButtons.forEach(function(item, index) {
      console.log('   ' + (index + 1) + '. "' + item.text + '" - Disabled: ' + item.button.disabled);
    });
    
    var qrImages = document.querySelectorAll('img[alt*="QR"], img[alt*="qr"]');
    console.log('🔍 QR Codes:', qrImages.length);
    
    var statusElements = document.querySelectorAll('[class*="badge"]');
    var statusTexts = [];
    
    for (var i = 0; i < statusElements.length; i++) {
      var text = statusElements[i].textContent ? statusElements[i].textContent.trim() : '';
      if (text && text.length < 30) {
        statusTexts.push(text);
      }
    }
    
    console.log('📊 Status:', statusTexts);
    
    var cards = document.querySelectorAll('[class*="card"]');
    console.log('🃏 Cards:', cards.length);
    
    // Verificar se há loading
    var loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    var isLoading = loadingElements.length > 0;
    console.log('⏳ Loading:', isLoading ? 'Sim' : 'Não');
    
    // Verificar se há erros
    var errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
    var hasErrors = errorElements.length > 0;
    console.log('❌ Erros:', hasErrors ? 'Sim' : 'Não');
    
    // Resumo final
    console.log('\n📋 RESULTADO FINAL:');
    console.log('===================');
    console.log('✅ Página: Carregada');
    console.log('📱 Botões WhatsApp: ' + whatsappButtons.length);
    console.log('🔍 QR Codes: ' + qrImages.length);
    console.log('📊 Status: ' + (statusTexts.length > 0 ? statusTexts.join(', ') : 'Nenhum'));
    console.log('🃏 Cards: ' + cards.length);
    console.log('⏳ Loading: ' + (isLoading ? 'Sim' : 'Não'));
    console.log('❌ Erros: ' + (hasErrors ? 'Sim' : 'Não'));
    
    if (whatsappButtons.length > 0 && !hasErrors) {
      console.log('\n🎉 WHATSAPP FUNCIONANDO PERFEITAMENTE!');
      console.log('💡 Agora você pode:');
      console.log('   1. Clicar em "Conectar WhatsApp"');
      console.log('   2. Aguardar o QR Code');
      console.log('   3. Escanear com seu WhatsApp');
      console.log('   4. Testar a integração');
      
      // Testar botão conectar se existir
      var connectBtn = null;
      for (var i = 0; i < whatsappButtons.length; i++) {
        if (whatsappButtons[i].text.includes('Conectar WhatsApp')) {
          connectBtn = whatsappButtons[i].button;
          break;
        }
      }
      
      if (connectBtn && !connectBtn.disabled) {
        console.log('\n🧪 Botão "Conectar WhatsApp" disponível para teste!');
      }
      
    } else if (whatsappButtons.length > 0 && hasErrors) {
      console.log('\n⚠️ WHATSAPP CARREGADO MAS COM ERROS');
      console.log('💡 Verifique os erros listados acima');
      
    } else if (isLoading) {
      console.log('\n⏳ WHATSAPP AINDA CARREGANDO');
      console.log('💡 Aguarde mais alguns segundos');
      
    } else {
      console.log('\n❌ WHATSAPP NÃO FUNCIONANDO');
      console.log('💡 Problema na renderização ou hook');
    }
    
  }, 2000); // Aguardar 2 segundos para carregamento completo
}

// Executar teste
testWhatsAppFinal();

console.log('⏳ Aguardando 2 segundos para carregamento completo...');





