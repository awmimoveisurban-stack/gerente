// DEBUG - VERIFICAR ERROS NO CONSOLE

function debugConsoleErrors() {
  console.log('🔍 Verificando erros no console...');
  
  // Capturar erros
  var errors = [];
  var originalError = console.error;
  var originalWarn = console.warn;
  
  console.error = function(...args) {
    errors.push('ERROR: ' + args.join(' '));
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    errors.push('WARN: ' + args.join(' '));
    originalWarn.apply(console, args);
  };
  
  // Aguardar e mostrar erros
  setTimeout(function() {
    console.error = originalError;
    console.warn = originalWarn;
    
    if (errors.length > 0) {
      console.log('❌ Erros encontrados:');
      errors.forEach(function(error, index) {
        console.log('   ' + (index + 1) + '. ' + error);
      });
    } else {
      console.log('✅ Nenhum erro detectado');
    }
  }, 3000);
  
  // Verificar elementos React
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
            
            // Buscar por erros no React
            function findReactErrors(fiber) {
              if (!fiber) return [];
              
              var fiberErrors = [];
              
              // Verificar se há erro neste fiber
              if (fiber.memoizedProps && fiber.memoizedProps.error) {
                fiberErrors.push(fiber.memoizedProps.error);
              }
              
              // Verificar se há erro no state
              if (fiber.memoizedState && fiber.memoizedState.error) {
                fiberErrors.push(fiber.memoizedState.error);
              }
              
              // Buscar recursivamente
              if (fiber.child) {
                fiberErrors = fiberErrors.concat(findReactErrors(fiber.child));
              }
              if (fiber.sibling) {
                fiberErrors = fiberErrors.concat(findReactErrors(fiber.sibling));
              }
              
              return fiberErrors;
            }
            
            var reactErrors = findReactErrors(currentFiber);
            if (reactErrors.length > 0) {
              console.log('❌ Erros React encontrados:', reactErrors);
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
  
  // Verificar se há conteúdo na página
  var bodyText = document.body.textContent || '';
  console.log('📄 Conteúdo da página:', bodyText.length, 'caracteres');
  
  // Verificar se há texto específico do WhatsApp
  var hasWhatsAppText = bodyText.includes('WhatsApp') || bodyText.includes('whatsapp');
  console.log('📝 Texto WhatsApp:', hasWhatsAppText ? 'Sim' : 'Não');
  
  // Verificar se há texto de teste
  var hasTestText = bodyText.includes('TESTE') || bodyText.includes('Teste');
  console.log('🧪 Texto de teste:', hasTestText ? 'Sim' : 'Não');
  
  console.log('⏳ Aguardando 3 segundos para capturar erros...');
}

// Executar debug
debugConsoleErrors();

console.log('💡 Execute debugConsoleErrors() para rodar novamente');





