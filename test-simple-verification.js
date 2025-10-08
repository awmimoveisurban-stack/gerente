// VERIFICAÇÃO DA VERSÃO SIMPLES

function testSimpleVerification() {
  console.log('🔍 Verificação da Versão Simples...');
  
  // Verificar página
  if (!window.location.pathname.includes('gerente-whatsapp')) {
    console.log('❌ Navegue para /gerente-whatsapp primeiro');
    return;
  }
  
  console.log('✅ Página WhatsApp detectada');
  
  // Aguardar carregamento
  setTimeout(function() {
    var buttons = document.querySelectorAll('button');
    var connectButtons = [];
    
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var text = btn.textContent ? btn.textContent.trim() : '';
      
      if (text.includes('Conectar WhatsApp')) {
        connectButtons.push({ button: btn, text: text, disabled: btn.disabled });
      }
    }
    
    console.log('🔗 Botões "Conectar WhatsApp":', connectButtons.length);
    
    if (connectButtons.length > 0) {
      console.log('✅ VERSÃO SIMPLES FUNCIONANDO!');
      connectButtons.forEach(function(item, index) {
        console.log('   ' + (index + 1) + '. "' + item.text + '" - Disabled: ' + item.disabled);
      });
    } else {
      console.log('❌ VERSÃO SIMPLES NÃO FUNCIONANDO');
      console.log('💡 Problema mais profundo na aplicação');
    }
    
  }, 2000);
}

testSimpleVerification();





