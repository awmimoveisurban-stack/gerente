// DIAGNÓSTICO DETALHADO - PÁGINA WHATSAPP

function debugWhatsAppPage() {
  console.log('🔍 Diagnóstico detalhado da página WhatsApp...');
  
  // Verificar página atual
  console.log('📍 URL atual:', window.location.href);
  console.log('📍 Pathname:', window.location.pathname);
  
  // Verificar se há erros no console
  console.log('🔍 Verificando erros JavaScript...');
  
  // Verificar elementos React
  var reactRoot = document.querySelector('#root, [data-reactroot], .App');
  if (reactRoot) {
    console.log('✅ Root React encontrado');
    console.log('📊 Conteúdo do root:', reactRoot.innerHTML.length, 'caracteres');
  } else {
    console.log('❌ Root React não encontrado');
  }
  
  // Verificar se há loading
  var loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="Loading"]');
  if (loadingElements.length > 0) {
    console.log('⏳ Elementos de loading encontrados:', loadingElements.length);
  }
  
  // Verificar se há sidebar
  var sidebar = document.querySelector('[class*="sidebar"], [class*="Sidebar"]');
  if (sidebar) {
    console.log('✅ Sidebar encontrada');
  } else {
    console.log('⚠️ Sidebar não encontrada');
  }
  
  // Verificar se há header
  var header = document.querySelector('header, [class*="header"], [class*="Header"]');
  if (header) {
    console.log('✅ Header encontrado');
  } else {
    console.log('⚠️ Header não encontrado');
  }
  
  // Verificar se há main content
  var main = document.querySelector('main, [role="main"], [class*="main"], [class*="Main"]');
  if (main) {
    console.log('✅ Main content encontrado');
    console.log('📊 Conteúdo main:', main.innerHTML.length, 'caracteres');
  } else {
    console.log('⚠️ Main content não encontrado');
  }
  
  // Verificar todos os botões
  var allButtons = document.querySelectorAll('button');
  console.log('🔘 Total de botões na página:', allButtons.length);
  
  // Listar todos os botões
  for (var i = 0; i < allButtons.length; i++) {
    var btn = allButtons[i];
    var text = btn.textContent ? btn.textContent.trim() : '';
    var classes = btn.className;
    console.log('   ' + (i + 1) + '. "' + text + '" - Classes: ' + classes);
  }
  
  // Verificar cards
  var cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
  console.log('🃏 Cards encontrados:', cards.length);
  
  // Verificar se há conteúdo específico do WhatsApp
  var whatsappContent = document.querySelectorAll('[class*="whatsapp"], [class*="WhatsApp"]');
  console.log('📱 Elementos WhatsApp encontrados:', whatsappContent.length);
  
  // Verificar se há erros visuais
  var errorElements = document.querySelectorAll('[class*="error"], [class*="alert"], [class*="Error"]');
  if (errorElements.length > 0) {
    console.log('❌ Elementos de erro encontrados:', errorElements.length);
    for (var i = 0; i < errorElements.length; i++) {
      var error = errorElements[i];
      var text = error.textContent ? error.textContent.trim() : '';
      console.log('   Erro ' + (i + 1) + ': "' + text + '"');
    }
  }
  
  // Verificar se há mensagens de "Acesso Negado"
  var accessDenied = document.querySelectorAll('[class*="negado"], [class*="denied"], [class*="access"]');
  if (accessDenied.length > 0) {
    console.log('🚫 Possível mensagem de acesso negado encontrada');
  }
  
  // Verificar React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools disponível');
    
    try {
      var renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
      if (renderers && renderers.size > 0) {
        console.log('✅ Renderers React encontrados:', renderers.size);
        
        // Pegar o primeiro renderer
        var renderer = renderers.values().next().value;
        if (renderer) {
          var currentFiber = renderer.getCurrentFiber();
          if (currentFiber) {
            console.log('✅ Fiber atual encontrado');
            
            // Buscar por componentes com erro
            function findErrors(fiber) {
              if (!fiber) return [];
              
              var errors = [];
              
              // Verificar se há erro neste fiber
              if (fiber.memoizedProps && fiber.memoizedProps.error) {
                errors.push(fiber.memoizedProps.error);
              }
              
              // Buscar recursivamente
              if (fiber.child) {
                errors = errors.concat(findErrors(fiber.child));
              }
              if (fiber.sibling) {
                errors = errors.concat(findErrors(fiber.sibling));
              }
              
              return errors;
            }
            
            var errors = findErrors(currentFiber);
            if (errors.length > 0) {
              console.log('❌ Erros encontrados no React:', errors);
            }
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao acessar React DevTools:', error.message);
    }
  }
  
  // Resumo final
  console.log('\n📋 RESUMO DO DIAGNÓSTICO:');
  console.log('==========================');
  console.log('📍 Página:', window.location.pathname);
  console.log('🔘 Botões:', allButtons.length);
  console.log('🃏 Cards:', cards.length);
  console.log('📱 Elementos WhatsApp:', whatsappContent.length);
  console.log('❌ Erros visuais:', errorElements.length);
  console.log('⏳ Loading:', loadingElements.length > 0 ? 'Sim' : 'Não');
  
  if (allButtons.length === 0) {
    console.log('\n❌ PROBLEMA: Nenhum botão encontrado');
    console.log('💡 A página pode não estar renderizando corretamente');
  } else if (whatsappContent.length === 0) {
    console.log('\n⚠️ AVISO: Nenhum elemento específico do WhatsApp encontrado');
    console.log('💡 A página pode estar carregando ou ter problemas de renderização');
  } else {
    console.log('\n✅ PÁGINA CARREGADA COM SUCESSO');
  }
}

// Executar diagnóstico
debugWhatsAppPage();

console.log('💡 Execute debugWhatsAppPage() para rodar novamente');





