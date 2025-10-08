// DIAGNÓSTICO DO HOOK WHATSAPP

function debugWhatsAppHook() {
  console.log('🔍 Diagnosticando hook WhatsApp...');
  
  // Verificar se há erros JavaScript
  console.log('🔍 Verificando erros JavaScript...');
  
  // Interceptar erros
  var originalError = console.error;
  var errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Aguardar um pouco para capturar erros
  setTimeout(function() {
    console.error = originalError;
    
    if (errors.length > 0) {
      console.log('❌ Erros JavaScript encontrados:');
      errors.forEach(function(error, index) {
        console.log('   ' + (index + 1) + '. ' + error);
      });
    } else {
      console.log('✅ Nenhum erro JavaScript detectado');
    }
  }, 2000);
  
  // Verificar React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools disponível');
    
    try {
      var renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
      if (renderers && renderers.size > 0) {
        var renderer = renderers.values().next().value;
        if (renderer) {
          var currentFiber = renderer.getCurrentFiber();
          if (currentFiber) {
            console.log('✅ Fiber atual encontrado');
            
            // Buscar por componente WhatsApp
            function findWhatsAppComponent(fiber) {
              if (!fiber) return null;
              
              if (fiber.type && typeof fiber.type === 'function') {
                var name = fiber.type.name || fiber.type.displayName || '';
                if (name.includes('WhatsApp') || name.includes('GerenteWhatsApp')) {
                  return fiber;
                }
              }
              
              // Buscar recursivamente
              return findWhatsAppComponent(fiber.child) || findWhatsAppComponent(fiber.sibling);
            }
            
            var whatsappComponent = findWhatsAppComponent(currentFiber);
            if (whatsappComponent) {
              console.log('✅ Componente WhatsApp encontrado');
              console.log('📊 Props:', whatsappComponent.memoizedProps);
              console.log('📊 State:', whatsappComponent.memoizedState);
            } else {
              console.log('⚠️ Componente WhatsApp não encontrado');
            }
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao acessar React DevTools:', error.message);
    }
  }
  
  // Verificar se há elementos de loading
  var loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
  if (loadingElements.length > 0) {
    console.log('⏳ Elementos de loading encontrados:', loadingElements.length);
  }
  
  // Verificar se há mensagens de erro
  var errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
  if (errorElements.length > 0) {
    console.log('❌ Elementos de erro encontrados:', errorElements.length);
    errorElements.forEach(function(error, index) {
      var text = error.textContent ? error.textContent.trim() : '';
      console.log('   ' + (index + 1) + '. "' + text + '"');
    });
  }
  
  // Verificar se há conteúdo específico do WhatsApp
  var whatsappContent = document.querySelectorAll('[class*="whatsapp"], [class*="WhatsApp"]');
  console.log('📱 Elementos WhatsApp encontrados:', whatsappContent.length);
  
  // Verificar se há texto específico do WhatsApp
  var bodyText = document.body.textContent || '';
  var hasWhatsAppText = bodyText.includes('WhatsApp') || bodyText.includes('whatsapp');
  console.log('📝 Texto WhatsApp na página:', hasWhatsAppText ? 'Sim' : 'Não');
  
  // Verificar se há botões específicos
  var buttons = document.querySelectorAll('button');
  var buttonTexts = [];
  
  for (var i = 0; i < buttons.length; i++) {
    var text = buttons[i].textContent ? buttons[i].textContent.trim() : '';
    if (text.length > 0) {
      buttonTexts.push(text);
    }
  }
  
  console.log('🔘 Textos dos botões encontrados:');
  buttonTexts.forEach(function(text, index) {
    console.log('   ' + (index + 1) + '. "' + text + '"');
  });
  
  // Verificar se há cards com conteúdo
  var cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
  console.log('🃏 Cards encontrados:', cards.length);
  
  cards.forEach(function(card, index) {
    var text = card.textContent ? card.textContent.trim() : '';
    console.log('   Card ' + (index + 1) + ': ' + text.length + ' caracteres');
  });
  
  // Resumo
  console.log('\n📋 RESUMO:');
  console.log('==========');
  console.log('🔘 Botões:', buttons.length);
  console.log('🃏 Cards:', cards.length);
  console.log('📱 Elementos WhatsApp:', whatsappContent.length);
  console.log('📝 Texto WhatsApp:', hasWhatsAppText ? 'Sim' : 'Não');
  console.log('❌ Erros visuais:', errorElements.length);
  console.log('⏳ Loading:', loadingElements.length > 0 ? 'Sim' : 'Não');
  
  if (!hasWhatsAppText) {
    console.log('\n❌ PROBLEMA: Nenhum texto WhatsApp encontrado na página');
    console.log('💡 O componente pode não estar renderizando corretamente');
  } else if (buttons.length === 0) {
    console.log('\n❌ PROBLEMA: Nenhum botão encontrado');
    console.log('💡 A página pode estar em estado de loading');
  } else {
    console.log('\n✅ PÁGINA CARREGADA MAS SEM BOTÕES WHATSAPP');
    console.log('💡 Pode ser um problema no hook ou na renderização condicional');
  }
}

// Executar diagnóstico
debugWhatsAppHook();

console.log('💡 Execute debugWhatsAppHook() para rodar novamente');





