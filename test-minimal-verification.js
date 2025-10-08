// TESTE VERSÃO MINIMAL

function testMinimalVerification() {
  console.log('🔍 Teste Versão Minimal...');
  
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
      
      if (text.includes('WhatsApp') || text.includes('Conectar') || text.includes('Desconectar') || text.includes('Verificar')) {
        whatsappButtons.push({ button: btn, text: text });
      }
    }
    
    console.log('📱 Botões encontrados:', whatsappButtons.length);
    whatsappButtons.forEach(function(item, index) {
      console.log('   ' + (index + 1) + '. "' + item.text + '"');
    });
    
    var h1 = document.querySelector('h1');
    var h1Text = h1 ? h1.textContent : 'Não encontrado';
    console.log('📝 Título da página:', h1Text);
    
    var testText = document.body.textContent.includes('versão minimal para teste');
    console.log('🧪 Texto de teste presente:', testText);
    
    if (whatsappButtons.length > 0) {
      console.log('✅ VERSÃO MINIMAL FUNCIONANDO!');
      console.log('💡 Botões renderizados corretamente');
    } else {
      console.log('❌ VERSÃO MINIMAL NÃO FUNCIONANDO');
      console.log('💡 Problema na renderização básica');
    }
    
  }, 1000);
}

testMinimalVerification();





