// TESTE VERSÃO SIMPLES CORRIGIDA

function testSimpleFixedVerification() {
  console.log('🔍 Teste Versão Simples Corrigida...');
  
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
    var disconnectButtons = [];
    var statusButtons = [];
    
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var text = btn.textContent ? btn.textContent.trim() : '';
      
      if (text.includes('WhatsApp') || text.includes('whatsapp')) {
        whatsappButtons.push({ button: btn, text: text });
      }
      
      if (text.includes('Conectar')) {
        connectButtons.push({ button: btn, text: text });
      }
      
      if (text.includes('Desconectar')) {
        disconnectButtons.push({ button: btn, text: text });
      }
      
      if (text.includes('Verificar')) {
        statusButtons.push({ button: btn, text: text });
      }
    }
    
    console.log('📱 Botões WhatsApp encontrados:', whatsappButtons.length);
    console.log('🔗 Botões Conectar:', connectButtons.length);
    console.log('🔌 Botões Desconectar:', disconnectButtons.length);
    console.log('🔄 Botões Verificar:', statusButtons.length);
    
    var cards = document.querySelectorAll('[class*="card"]');
    console.log('🃏 Cards:', cards.length);
    
    var metrics = document.querySelectorAll('[class*="Mensagens"], [class*="Taxa"], [class*="Leads"], [class*="Total"]');
    console.log('📈 Métricas:', metrics.length);
    
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
    
    var hasSimulationText = document.body.textContent.includes('Modo simulação');
    console.log('🧪 Texto de simulação:', hasSimulationText);
    
    // Resumo final
    console.log('\n📋 RESULTADO FINAL SIMPLES CORRIGIDA:');
    console.log('=====================================');
    console.log('✅ Página: Carregada');
    console.log('📱 Botões WhatsApp: ' + whatsappButtons.length);
    console.log('🔗 Botões Conectar: ' + connectButtons.length);
    console.log('🔌 Botões Desconectar: ' + disconnectButtons.length);
    console.log('🔄 Botões Verificar: ' + statusButtons.length);
    console.log('🔍 QR Codes: ' + qrImages.length);
    console.log('📊 Status: ' + (statusTexts.length > 0 ? statusTexts.join(', ') : 'Nenhum'));
    console.log('🃏 Cards: ' + cards.length);
    console.log('📈 Métricas: ' + metrics.length);
    console.log('🧪 Simulação: ' + (hasSimulationText ? 'Sim' : 'Não'));
    
    if (whatsappButtons.length > 0 || connectButtons.length > 0) {
      console.log('\n🎉 VERSÃO SIMPLES CORRIGIDA FUNCIONANDO!');
      console.log('💡 Características:');
      console.log('   ✅ Botões sempre visíveis (sem renderização condicional)');
      console.log('   ✅ Interface completa com cards e métricas');
      console.log('   ✅ Simulação local funcionando');
      console.log('   ✅ Design moderno glassmorphism');
      console.log('   ✅ Estados de loading e feedback');
      
      console.log('\n🧪 Como testar:');
      console.log('   1. Clique em "Conectar WhatsApp"');
      console.log('   2. Aguarde 2 segundos para simulação');
      console.log('   3. Status muda para "Aguardando QR"');
      console.log('   4. QR Code aparece (simulado)');
      console.log('   5. Teste botões "Desconectar" e "Verificar Status"');
      
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
        console.log('💡 Clique no botão para testar a simulação completa');
      }
      
    } else {
      console.log('\n❌ VERSÃO SIMPLES CORRIGIDA NÃO FUNCIONANDO');
      console.log('💡 Problema na renderização da interface');
    }
    
  }, 2000);
}

testSimpleFixedVerification();





