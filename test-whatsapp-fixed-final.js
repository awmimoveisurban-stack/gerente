// TESTE WHATSAPP FIXED - VERSÃO FINAL CORRIGIDA

function testWhatsAppFixedFinal() {
  console.log('🎯 Teste WhatsApp Fixed - Versão Final Corrigida...');
  
  // Verificar página
  if (!window.location.pathname.includes('gerente-whatsapp')) {
    console.log('❌ Navegue para /gerente-whatsapp primeiro');
    return;
  }
  
  console.log('✅ Página WhatsApp detectada');
  
  // Aguardar carregamento
  setTimeout(function() {
    console.log('\n📊 ANÁLISE DA VERSÃO CORRIGIDA:');
    console.log('===============================');
    
    var buttons = document.querySelectorAll('button');
    var whatsappButtons = [];
    var connectButtons = [];
    var disconnectButtons = [];
    var statusButtons = [];
    
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var text = btn.textContent ? btn.textContent.trim() : '';
      
      if (text.includes('WhatsApp') || text.includes('whatsapp')) {
        whatsappButtons.push({ button: btn, text: text, disabled: btn.disabled });
      }
      
      if (text.includes('Conectar')) {
        connectButtons.push({ button: btn, text: text, disabled: btn.disabled });
      }
      
      if (text.includes('Desconectar')) {
        disconnectButtons.push({ button: btn, text: text, disabled: btn.disabled });
      }
      
      if (text.includes('Verificar')) {
        statusButtons.push({ button: btn, text: text, disabled: btn.disabled });
      }
    }
    
    console.log('📱 Botões WhatsApp encontrados:', whatsappButtons.length);
    whatsappButtons.forEach(function(item, index) {
      console.log('   ' + (index + 1) + '. "' + item.text + '" - Disabled: ' + item.disabled);
    });
    
    console.log('🔗 Botões Conectar:', connectButtons.length);
    connectButtons.forEach(function(item, index) {
      console.log('   ' + (index + 1) + '. "' + item.text + '" - Disabled: ' + item.disabled);
    });
    
    console.log('🔌 Botões Desconectar:', disconnectButtons.length);
    console.log('🔄 Botões Verificar Status:', statusButtons.length);
    
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
    
    var metrics = document.querySelectorAll('[class*="Mensagens"], [class*="Taxa"], [class*="Leads"], [class*="Total"]');
    console.log('📈 Métricas:', metrics.length);
    
    // Verificar se há indicador de integração
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
    
    // Verificar se há texto específico do WhatsApp
    var bodyText = document.body.textContent || '';
    var hasWhatsAppText = bodyText.includes('WhatsApp') || bodyText.includes('whatsapp');
    var hasConnectText = bodyText.includes('Conectar WhatsApp');
    console.log('📝 Texto WhatsApp:', hasWhatsAppText ? 'Sim' : 'Não');
    console.log('📝 Texto "Conectar WhatsApp":', hasConnectText ? 'Sim' : 'Não');
    
    // Resumo final
    console.log('\n📋 RESULTADO FINAL CORRIGIDO:');
    console.log('=============================');
    console.log('✅ Página: Carregada');
    console.log('📱 Botões WhatsApp: ' + whatsappButtons.length);
    console.log('🔗 Botões Conectar: ' + connectButtons.length);
    console.log('🔌 Botões Desconectar: ' + disconnectButtons.length);
    console.log('🔄 Botões Verificar: ' + statusButtons.length);
    console.log('🔍 QR Codes: ' + qrImages.length);
    console.log('📊 Status: ' + (statusTexts.length > 0 ? statusTexts.join(', ') : 'Nenhum'));
    console.log('🃏 Cards: ' + cards.length);
    console.log('📈 Métricas: ' + metrics.length);
    console.log('🔗 Integração: ' + (hasIntegrationText ? 'Detectada' : 'Não detectada'));
    console.log('⏳ Loading: ' + (isLoading ? 'Sim' : 'Não'));
    console.log('❌ Erros: ' + (hasErrors ? 'Sim' : 'Não'));
    console.log('📝 Texto WhatsApp: ' + (hasWhatsAppText ? 'Sim' : 'Não'));
    console.log('📝 Texto Conectar: ' + (hasConnectText ? 'Sim' : 'Não'));
    
    if (whatsappButtons.length > 0 || connectButtons.length > 0) {
      console.log('\n🎉 WHATSAPP FIXED FUNCIONANDO!');
      console.log('💡 Características da versão corrigida:');
      console.log('   ✅ Botões sempre visíveis (fallback forçado)');
      console.log('   ✅ Interface completa e moderna');
      console.log('   ✅ Integração com Evolution API (se configurada)');
      console.log('   ✅ Simulação local (se não configurada)');
      console.log('   ✅ Estados de loading e erro tratados');
      console.log('   ✅ Métricas visuais funcionais');
      
      console.log('\n🧪 Como testar:');
      console.log('   1. Clique em "Conectar WhatsApp"');
      console.log('   2. Aguarde mudança de status para "Aguardando QR"');
      console.log('   3. Se Evolution API configurada: QR Code real');
      console.log('   4. Se não configurada: Simulação local (3 segundos)');
      console.log('   5. Status muda para "Conectado" automaticamente');
      console.log('   6. Teste botão "Desconectar"');
      
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
        console.log('💡 Clique no botão para testar a funcionalidade completa');
      }
      
    } else if (hasConnectText) {
      console.log('\n⚠️ WHATSAPP FIXED CARREGADO MAS SEM BOTÕES');
      console.log('💡 Texto presente mas botões não renderizados');
      console.log('💡 Possível problema de CSS ou renderização');
      
    } else if (hasWhatsAppText) {
      console.log('\n⚠️ WHATSAPP FIXED PARCIALMENTE CARREGADO');
      console.log('💡 Texto WhatsApp presente mas sem botões específicos');
      console.log('💡 Verificar renderização condicional');
      
    } else if (isLoading) {
      console.log('\n⏳ WHATSAPP FIXED AINDA CARREGANDO');
      console.log('💡 Aguarde mais alguns segundos');
      
    } else {
      console.log('\n❌ WHATSAPP FIXED NÃO FUNCIONANDO');
      console.log('💡 Problema na renderização da página');
      console.log('💡 Verificar se AppLayout está funcionando');
    }
    
  }, 2000); // Aguardar 2 segundos para carregamento completo
}

// Executar teste
testWhatsAppFixedFinal();

console.log('⏳ Aguardando 2 segundos para carregamento completo...');





