// DEBUG WHATSAPP HOOK - ANÁLISE FINAL

function debugWhatsAppHookFinal() {
  console.log('🔍 Debug WhatsApp Hook - Análise Final...');
  
  // Verificar página
  if (!window.location.pathname.includes('gerente-whatsapp')) {
    console.log('❌ Navegue para /gerente-whatsapp primeiro');
    return;
  }
  
  console.log('✅ Página WhatsApp detectada');
  
  // Aguardar carregamento
  setTimeout(function() {
    console.log('\n📊 ANÁLISE DETALHADA:');
    console.log('===================');
    
    // 1. Verificar elementos da página
    var buttons = document.querySelectorAll('button');
    console.log('🔘 Total de botões na página:', buttons.length);
    
    var whatsappButtons = [];
    var connectButtons = [];
    var allButtonTexts = [];
    
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var text = btn.textContent ? btn.textContent.trim() : '';
      allButtonTexts.push(text);
      
      if (text.includes('WhatsApp') || text.includes('whatsapp')) {
        whatsappButtons.push({ button: btn, text: text, disabled: btn.disabled });
      }
      
      if (text.includes('Conectar')) {
        connectButtons.push({ button: btn, text: text, disabled: btn.disabled });
      }
    }
    
    console.log('📝 Todos os textos de botões:', allButtonTexts);
    console.log('📱 Botões WhatsApp específicos:', whatsappButtons.length);
    console.log('🔗 Botões Conectar específicos:', connectButtons.length);
    
    // 2. Verificar se há elementos de loading
    var loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
    console.log('⏳ Elementos de loading:', loadingElements.length);
    
    // 3. Verificar se há elementos de erro
    var errorElements = document.querySelectorAll('[class*="error"], [class*="alert"], [class*="destructive"]');
    console.log('❌ Elementos de erro:', errorElements.length);
    
    // 4. Verificar se há cards
    var cards = document.querySelectorAll('[class*="card"]');
    console.log('🃏 Cards encontrados:', cards.length);
    
    // 5. Verificar se há texto específico do WhatsApp
    var bodyText = document.body.textContent || '';
    var hasWhatsAppText = bodyText.includes('WhatsApp') || bodyText.includes('whatsapp');
    var hasConnectText = bodyText.includes('Conectar');
    var hasDisconnectText = bodyText.includes('Desconectar');
    
    console.log('📝 Texto WhatsApp presente:', hasWhatsAppText);
    console.log('📝 Texto "Conectar" presente:', hasConnectText);
    console.log('📝 Texto "Desconectar" presente:', hasDisconnectText);
    
    // 6. Verificar se há elementos condicionais
    var conditionalElements = document.querySelectorAll('[style*="display: none"], [class*="hidden"]');
    console.log('👻 Elementos ocultos:', conditionalElements.length);
    
    // 7. Verificar React DevTools se disponível
    var reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalFiber) {
      console.log('⚛️ React DevTools disponível');
    } else {
      console.log('⚛️ React DevTools não disponível');
    }
    
    // 8. Verificar console por erros
    console.log('\n🔍 Verificando console por erros...');
    var originalError = console.error;
    var errors = [];
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // Restaurar após um momento
    setTimeout(function() {
      console.error = originalError;
      console.log('❌ Erros capturados:', errors.length);
      if (errors.length > 0) {
        errors.forEach(function(error, index) {
          console.log('   ' + (index + 1) + '. ' + error);
        });
      }
    }, 1000);
    
    // 9. Tentar encontrar elementos específicos do WhatsApp
    var statusElements = document.querySelectorAll('[class*="status"], [class*="Status"]');
    console.log('📊 Elementos de status:', statusElements.length);
    
    var qrElements = document.querySelectorAll('[class*="qr"], [class*="QR"], img[alt*="QR"]');
    console.log('🔍 Elementos QR:', qrElements.length);
    
    // 10. Verificar se há elementos com texto específico
    var elementsWithConnectText = [];
    var allElements = document.querySelectorAll('*');
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      var text = el.textContent || '';
      if (text.includes('Conectar WhatsApp')) {
        elementsWithConnectText.push({
          tagName: el.tagName,
          className: el.className,
          text: text.trim()
        });
      }
    }
    console.log('🔍 Elementos com texto "Conectar WhatsApp":', elementsWithConnectText.length);
    
    // RESULTADO FINAL
    console.log('\n📋 DIAGNÓSTICO FINAL:');
    console.log('====================');
    
    if (whatsappButtons.length > 0) {
      console.log('✅ SUCESSO: Botões WhatsApp encontrados!');
      whatsappButtons.forEach(function(item, index) {
        console.log('   ' + (index + 1) + '. "' + item.text + '" - Disabled: ' + item.disabled);
      });
    } else if (connectButtons.length > 0) {
      console.log('✅ SUCESSO: Botões Conectar encontrados!');
      connectButtons.forEach(function(item, index) {
        console.log('   ' + (index + 1) + '. "' + item.text + '" - Disabled: ' + item.disabled);
      });
    } else if (hasConnectText) {
      console.log('⚠️ PARCIAL: Texto "Conectar" presente mas botões não encontrados');
      console.log('💡 Possível problema de renderização condicional');
    } else if (hasWhatsAppText) {
      console.log('⚠️ PARCIAL: Texto WhatsApp presente mas botões não encontrados');
      console.log('💡 Possível problema no hook useWhatsApp');
    } else {
      console.log('❌ FALHA: Nenhum elemento WhatsApp encontrado');
      console.log('💡 Problema na renderização da página');
    }
    
    if (loadingElements.length > 0) {
      console.log('⏳ INFO: Página ainda carregando');
    }
    
    if (errorElements.length > 0) {
      console.log('❌ INFO: Erros detectados na interface');
    }
    
    // SUGESTÕES
    console.log('\n💡 SUGESTÕES:');
    if (whatsappButtons.length === 0 && hasConnectText) {
      console.log('   1. Verificar renderização condicional no código');
      console.log('   2. Verificar se hook useWhatsApp está retornando dados');
      console.log('   3. Verificar se config.status está definido');
    } else if (whatsappButtons.length === 0 && !hasWhatsAppText) {
      console.log('   1. Verificar se página está carregando corretamente');
      console.log('   2. Verificar se há erros de JavaScript');
      console.log('   3. Verificar se AppLayout está funcionando');
    }
    
  }, 3000); // Aguardar 3 segundos para carregamento completo
}

// Executar debug
debugWhatsAppHookFinal();

console.log('⏳ Aguardando 3 segundos para análise completa...');





