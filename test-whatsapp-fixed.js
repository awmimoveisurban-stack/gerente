// TESTE WHATSAPP CORRIGIDO - COPIAR E COLAR NO CONSOLE

function testWhatsAppFixed() {
  console.log('🧪 Teste WhatsApp Corrigido...');
  
  // Verificar página atual
  console.log('📍 Página atual:', window.location.pathname);
  
  // Verificar se estamos na página correta
  if (!window.location.pathname.includes('gerente-whatsapp')) {
    console.log('❌ Navegue para /gerente-whatsapp primeiro');
    console.log('💡 Use o menu lateral: WhatsApp');
    return;
  }
  
  console.log('✅ Página WhatsApp detectada');
  
  // Buscar todos os botões
  var buttons = document.querySelectorAll('button');
  console.log('🔍 Total de botões na página:', buttons.length);
  
  // Buscar botões que contenham "WhatsApp" ou "Conectar"
  var whatsappButtons = [];
  var connectButtons = [];
  
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    var text = btn.textContent ? btn.textContent.trim() : '';
    
    if (text.includes('WhatsApp') || text.includes('whatsapp')) {
      whatsappButtons.push({ button: btn, text: text });
    }
    
    if (text.includes('Conectar') || text.includes('conectar')) {
      connectButtons.push({ button: btn, text: text });
    }
  }
  
  console.log('📱 Botões WhatsApp encontrados:', whatsappButtons.length);
  whatsappButtons.forEach(function(item, index) {
    console.log('   ' + (index + 1) + '. "' + item.text + '" - Disabled: ' + item.button.disabled);
  });
  
  console.log('🔗 Botões Conectar encontrados:', connectButtons.length);
  connectButtons.forEach(function(item, index) {
    console.log('   ' + (index + 1) + '. "' + item.text + '" - Disabled: ' + item.button.disabled);
  });
  
  // Buscar QR Code
  var qrImages = document.querySelectorAll('img[alt*="QR"], img[alt*="qr"], img[alt*="QR Code"], img[alt*="qr code"]');
  console.log('🔍 QR Codes encontrados:', qrImages.length);
  
  // Buscar elementos de status/badge
  var statusElements = document.querySelectorAll('[class*="badge"], [class*="status"], [class*="Badge"]');
  var statusTexts = [];
  
  for (var i = 0; i < statusElements.length; i++) {
    var text = statusElements[i].textContent ? statusElements[i].textContent.trim() : '';
    if (text && text.length < 50 && text.length > 0) {
      statusTexts.push(text);
    }
  }
  
  console.log('📊 Status encontrados:', statusTexts);
  
  // Buscar elementos de erro/alert
  var errorElements = document.querySelectorAll('[class*="error"], [class*="alert"], [class*="Alert"]');
  var errorTexts = [];
  
  for (var i = 0; i < errorElements.length; i++) {
    var text = errorElements[i].textContent ? errorElements[i].textContent.trim() : '';
    if (text && text.length < 100 && text.length > 0) {
      errorTexts.push(text);
    }
  }
  
  if (errorTexts.length > 0) {
    console.log('⚠️ Erros encontrados:', errorTexts);
  }
  
  // Buscar elementos de loading
  var loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="Loading"]');
  if (loadingElements.length > 0) {
    console.log('⏳ Elementos de loading encontrados:', loadingElements.length);
  }
  
  // Buscar cards ou containers principais
  var cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
  console.log('🃏 Cards encontrados:', cards.length);
  
  // Testar botão conectar se existir
  var connectBtn = null;
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    var text = btn.textContent ? btn.textContent.trim() : '';
    
    if (text.includes('Conectar WhatsApp') || text.includes('Conectar')) {
      connectBtn = btn;
      break;
    }
  }
  
  if (connectBtn) {
    console.log('🧪 Botão Conectar encontrado: "' + connectBtn.textContent.trim() + '"');
    
    if (!connectBtn.disabled) {
      console.log('✅ Botão habilitado - pode ser clicado');
      console.log('💡 Clique no botão para testar a conexão');
    } else {
      console.log('⚠️ Botão desabilitado (pode estar carregando)');
    }
  } else {
    console.log('⚠️ Botão Conectar não encontrado');
  }
  
  // Verificar se há conteúdo na página
  var pageContent = document.querySelector('main, [role="main"], .main-content');
  if (pageContent) {
    var contentText = pageContent.textContent ? pageContent.textContent.trim() : '';
    if (contentText.length > 100) {
      console.log('✅ Conteúdo da página encontrado (' + contentText.length + ' caracteres)');
    } else {
      console.log('⚠️ Pouco conteúdo na página (' + contentText.length + ' caracteres)');
    }
  }
  
  // Resumo final
  console.log('\n📋 RESUMO DETALHADO:');
  console.log('====================');
  console.log('✅ Página: ' + window.location.pathname);
  console.log('📱 Botões WhatsApp: ' + whatsappButtons.length);
  console.log('🔗 Botões Conectar: ' + connectButtons.length);
  console.log('🔍 QR Codes: ' + qrImages.length);
  console.log('📊 Status: ' + (statusTexts.length > 0 ? statusTexts.join(', ') : 'Nenhum'));
  console.log('⚠️ Erros: ' + (errorTexts.length > 0 ? errorTexts.length : 'Nenhum'));
  console.log('⏳ Loading: ' + (loadingElements.length > 0 ? 'Sim' : 'Não'));
  console.log('🃏 Cards: ' + cards.length);
  
  // Diagnóstico
  if (buttons.length === 0) {
    console.log('\n❌ PROBLEMA: Nenhum botão encontrado na página');
    console.log('💡 A página pode não estar carregando corretamente');
  } else if (whatsappButtons.length === 0 && connectButtons.length === 0) {
    console.log('\n❌ PROBLEMA: Nenhum botão WhatsApp encontrado');
    console.log('💡 A página pode não estar renderizando os componentes corretamente');
  } else if (errorTexts.length > 0) {
    console.log('\n❌ PROBLEMA: Erros detectados na página');
    console.log('💡 Verifique os erros listados acima');
  } else if (whatsappButtons.length > 0 || connectButtons.length > 0) {
    console.log('\n🎉 PÁGINA WHATSAPP FUNCIONANDO!');
    console.log('💡 Botões encontrados - interface carregada corretamente');
  } else {
    console.log('\n⚠️ PÁGINA CARREGADA MAS COM PROBLEMAS');
    console.log('💡 Verifique se você está logado como gerente');
  }
}

// Executar teste
testWhatsAppFixed();

console.log('💡 Execute testWhatsAppFixed() para rodar novamente');





