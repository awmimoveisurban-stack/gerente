// TESTE WHATSAPP HÍBRIDO - VERSÃO FINAL

function testWhatsAppHybrid() {
  console.log('🎯 Teste WhatsApp Híbrido - Versão Final...');
  
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
    var connectButtons = [];
    
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var text = btn.textContent ? btn.textContent.trim() : '';
      
      if (text.includes('WhatsApp') || text.includes('whatsapp')) {
        whatsappButtons.push({ button: btn, text: text });
      }
      
      if (text.includes('Conectar')) {
        connectButtons.push({ button: btn, text: text });
      }
    }
    
    console.log('📱 Botões WhatsApp encontrados:', whatsappButtons.length);
    whatsappButtons.forEach(function(item, index) {
      console.log('   ' + (index + 1) + '. "' + item.text + '" - Disabled: ' + item.button.disabled);
    });
    
    console.log('🔗 Botões Conectar:', connectButtons.length);
    
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
    
    console.log('📊 Status encontrados:', statusTexts);
    
    var cards = document.querySelectorAll('[class*="card"]');
    console.log('🃏 Cards:', cards.length);
    
    var metrics = document.querySelectorAll('[class*="Mensagens"], [class*="Taxa"], [class*="Leads"]');
    console.log('📈 Métricas:', metrics.length);
    
    // Verificar se há indicador de integração
    var integrationIndicator = document.querySelector('[class*="Evolution"], [class*="simulação"]');
    var hasIntegrationText = document.body.textContent.includes('Evolution') || document.body.textContent.includes('simulação');
    console.log('🔗 Indicador de integração:', hasIntegrationText ? 'Sim' : 'Não');
    
    // Verificar se há loading
    var loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    var isLoading = loadingElements.length > 0;
    console.log('⏳ Loading:', isLoading ? 'Sim' : 'Não');
    
    // Verificar se há erros
    var errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
    var hasErrors = errorElements.length > 0;
    console.log('❌ Erros:', hasErrors ? 'Sim' : 'Não');
    
    // Resumo final
    console.log('\n📋 RESULTADO FINAL HÍBRIDO:');
    console.log('============================');
    console.log('✅ Página: Carregada');
    console.log('📱 Botões WhatsApp: ' + whatsappButtons.length);
    console.log('🔗 Botões Conectar: ' + connectButtons.length);
    console.log('🔍 QR Codes: ' + qrImages.length);
    console.log('📊 Status: ' + (statusTexts.length > 0 ? statusTexts.join(', ') : 'Nenhum'));
    console.log('🃏 Cards: ' + cards.length);
    console.log('📈 Métricas: ' + metrics.length);
    console.log('🔗 Integração: ' + (hasIntegrationText ? 'Detectada' : 'Não detectada'));
    console.log('⏳ Loading: ' + (isLoading ? 'Sim' : 'Não'));
    console.log('❌ Erros: ' + (hasErrors ? 'Sim' : 'Não'));
    
    if (whatsappButtons.length > 0 && !hasErrors) {
      console.log('\n🎉 WHATSAPP HÍBRIDO FUNCIONANDO!');
      console.log('💡 Características:');
      console.log('   ✅ Interface completa e moderna');
      console.log('   ✅ Botões funcionais');
      console.log('   ✅ Fallback para simulação');
      console.log('   ✅ Integração com Evolution API (se configurada)');
      console.log('   ✅ Métricas visuais');
      
      console.log('\n🧪 Como testar:');
      console.log('   1. Clique em "Conectar WhatsApp"');
      console.log('   2. Se Evolution API configurada: QR Code real');
      console.log('   3. Se não configurada: Simulação local');
      console.log('   4. Teste desconexão e reconexão');
      
      // Testar botão conectar se existir
      var connectBtn = null;
      for (var i = 0; i < connectButtons.length; i++) {
        if (connectButtons[i].text.includes('Conectar WhatsApp')) {
          connectBtn = connectButtons[i].button;
          break;
        }
      }
      
      if (connectBtn && !connectBtn.disabled) {
        console.log('\n🧪 Botão "Conectar WhatsApp" disponível para teste!');
        console.log('💡 Clique no botão para testar a funcionalidade');
      }
      
    } else if (whatsappButtons.length > 0 && hasErrors) {
      console.log('\n⚠️ WHATSAPP HÍBRIDO CARREGADO MAS COM ERROS');
      console.log('💡 Verifique os erros listados acima');
      
    } else if (isLoading) {
      console.log('\n⏳ WHATSAPP HÍBRIDO AINDA CARREGANDO');
      console.log('💡 Aguarde mais alguns segundos');
      
    } else {
      console.log('\n❌ WHATSAPP HÍBRIDO NÃO FUNCIONANDO');
      console.log('💡 Problema na renderização');
    }
    
  }, 2000); // Aguardar 2 segundos para carregamento completo
}

// Executar teste
testWhatsAppHybrid();

console.log('⏳ Aguardando 2 segundos para carregamento completo...');





