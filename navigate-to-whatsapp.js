// NAVEGAÇÃO PARA WHATSAPP - COPIAR E COLAR NO CONSOLE

function navigateToWhatsApp() {
  console.log('🧭 Navegando para página WhatsApp...');
  
  // Verificar página atual
  console.log('📍 Página atual:', window.location.pathname);
  
  // Verificar se usuário está logado
  if (!window.location.pathname.includes('gerente') && !window.location.pathname.includes('corretor') && !window.location.pathname.includes('auth')) {
    console.log('⚠️ Parece que você não está logado');
    console.log('💡 Navegue primeiro para /auth ou /login');
    return;
  }
  
  // Verificar se é gerente
  var currentPath = window.location.pathname;
  var isManager = currentPath.includes('gerente') || currentPath.includes('todos-leads');
  
  if (!isManager) {
    console.log('❌ Você precisa estar logado como GERENTE para acessar WhatsApp');
    console.log('💡 Faça login com gerente@imobiliaria.com');
    return;
  }
  
  console.log('✅ Usuário gerente detectado');
  
  // Tentar navegar
  console.log('🚀 Navegando para /gerente-whatsapp...');
  
  // Método 1: Usar window.location
  window.location.href = '/gerente-whatsapp';
  
  console.log('⏳ Aguarde o carregamento da página...');
}

function checkWhatsAppAccess() {
  console.log('🔍 Verificando acesso ao WhatsApp...');
  
  // Verificar se há menu lateral
  var sidebar = document.querySelector('[class*="sidebar"], [class*="Sidebar"]');
  if (sidebar) {
    console.log('✅ Sidebar encontrada');
    
    // Buscar link WhatsApp no menu
    var whatsappLink = sidebar.querySelector('a[href*="whatsapp"], a[href*="WhatsApp"]');
    if (whatsappLink) {
      console.log('✅ Link WhatsApp encontrado no menu');
      console.log('💡 Clique no link WhatsApp no menu lateral');
      return true;
    } else {
      console.log('⚠️ Link WhatsApp não encontrado no menu');
    }
  } else {
    console.log('⚠️ Sidebar não encontrada');
  }
  
  // Verificar se há botões de navegação
  var navButtons = document.querySelectorAll('button, a');
  var whatsappNav = [];
  
  for (var i = 0; i < navButtons.length; i++) {
    var btn = navButtons[i];
    var text = btn.textContent ? btn.textContent.trim() : '';
    
    if (text.includes('WhatsApp') || text.includes('whatsapp')) {
      whatsappNav.push(btn);
    }
  }
  
  if (whatsappNav.length > 0) {
    console.log('✅ Botões WhatsApp encontrados:', whatsappNav.length);
    whatsappNav.forEach(function(btn, index) {
      console.log('   ' + (index + 1) + '. "' + btn.textContent.trim() + '"');
    });
  }
  
  return false;
}

function showNavigationOptions() {
  console.log('\n🧭 OPÇÕES DE NAVEGAÇÃO:');
  console.log('========================');
  console.log('1. Navegação automática: navigateToWhatsApp()');
  console.log('2. Verificar acesso: checkWhatsAppAccess()');
  console.log('3. Navegação manual:');
  console.log('   - Use o menu lateral (ícone WhatsApp)');
  console.log('   - Digite /gerente-whatsapp na URL');
  console.log('   - Clique em links WhatsApp na interface');
  
  console.log('\n💡 DICAS:');
  console.log('- Certifique-se de estar logado como GERENTE');
  console.log('- Use gerente@imobiliaria.com para login');
  console.log('- A página WhatsApp só é visível para gerentes');
}

// Executar verificação
console.log('🔍 Verificando situação atual...');
checkWhatsAppAccess();
showNavigationOptions();

console.log('\n🚀 Para navegar automaticamente, execute: navigateToWhatsApp()');





