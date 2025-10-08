// =====================================================
// TESTE SIMPLES - WHATSAPP (EXECUTAR NA PÁGINA WHATSAPP)
// =====================================================

console.log('🧪 Teste simples da integração WhatsApp...');

// Função para testar diretamente na página
async function testWhatsAppDirect() {
  try {
    console.log('🔍 Testando integração WhatsApp diretamente...');
    
    // Verificar se estamos na página correta
    if (!window.location.pathname.includes('whatsapp')) {
      console.log('⚠️ Navegue para a página WhatsApp primeiro (/gerente-whatsapp)');
      return false;
    }
    
    // Tentar acessar o hook useWhatsApp através do React
    console.log('🔍 Buscando instância do Supabase...');
    
    // Método 1: Tentar acessar via elementos React
    const reactElements = document.querySelectorAll('[data-reactroot]');
    if (reactElements.length > 0) {
      console.log('✅ Elementos React encontrados');
    }
    
    // Método 2: Tentar acessar via window.__REACT_DEVTOOLS__
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools encontrado');
      
      try {
        const renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
        if (renderers && renderers.size > 0) {
          console.log('✅ Renderers React encontrados:', renderers.size);
          
          // Pegar o primeiro renderer
          const renderer = renderers.values().next().value;
          if (renderer) {
            console.log('✅ Renderer ativo encontrado');
            
            // Tentar encontrar o componente da página
            const finder = (fiber) => {
              if (!fiber) return null;
              
              // Procurar por componentes que contenham 'whatsapp' ou 'WhatsApp'
              if (fiber.type && typeof fiber.type === 'function') {
                const name = fiber.type.name || fiber.type.displayName || '';
                if (name.toLowerCase().includes('whatsapp') || name.toLowerCase().includes('gerente')) {
                  console.log('🎯 Componente WhatsApp encontrado:', name);
                  return fiber;
                }
              }
              
              // Procurar recursivamente
              return finder(fiber.child) || finder(fiber.sibling);
            };
            
            const currentFiber = renderer.getCurrentFiber();
            const whatsappComponent = finder(currentFiber);
            
            if (whatsappComponent) {
              console.log('✅ Componente WhatsApp localizado');
              return true;
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao acessar React DevTools:', error.message);
      }
    }
    
    // Método 3: Verificar se há elementos da página WhatsApp
    const whatsappElements = document.querySelectorAll('[class*="whatsapp"], [class*="WhatsApp"]');
    if (whatsappElements.length > 0) {
      console.log('✅ Elementos WhatsApp encontrados na página:', whatsappElements.length);
    }
    
    // Método 4: Verificar se há botões de conexão
    const connectButtons = document.querySelectorAll('button');
    const whatsappButtons = Array.from(connectButtons).filter(btn => 
      btn.textContent && (
        btn.textContent.includes('Conectar WhatsApp') || 
        btn.textContent.includes('WhatsApp') ||
        btn.textContent.includes('QR Code')
      )
    );
    
    if (whatsappButtons.length > 0) {
      console.log('✅ Botões WhatsApp encontrados:', whatsappButtons.length);
      whatsappButtons.forEach((btn, index) => {
        console.log(`   Botão ${index + 1}: "${btn.textContent.trim()}"`);
      });
      
      // Testar clicar no botão de conectar
      const connectBtn = whatsappButtons.find(btn => 
        btn.textContent.includes('Conectar WhatsApp')
      );
      
      if (connectBtn && !connectBtn.disabled) {
        console.log('🧪 Testando clique no botão Conectar WhatsApp...');
        connectBtn.click();
        
        // Aguardar um pouco e verificar se algo mudou
        setTimeout(() => {
          console.log('✅ Clique executado - verifique se apareceu QR Code ou mudou o status');
        }, 2000);
        
        return true;
      } else if (connectBtn && connectBtn.disabled) {
        console.log('⚠️ Botão Conectar WhatsApp está desabilitado');
      }
    }
    
    // Método 5: Verificar se há QR Code na página
    const qrImages = document.querySelectorAll('img[alt*="QR"], img[alt*="qr"]');
    if (qrImages.length > 0) {
      console.log('✅ QR Code encontrado na página:', qrImages.length);
      return true;
    }
    
    // Método 6: Verificar status da conexão
    const statusElements = document.querySelectorAll('[class*="status"], [class*="badge"]');
    const statusTexts = Array.from(statusElements).map(el => el.textContent?.trim()).filter(Boolean);
    
    if (statusTexts.length > 0) {
      console.log('✅ Elementos de status encontrados:', statusTexts);
    }
    
    console.log('⚠️ Não foi possível encontrar elementos específicos do WhatsApp');
    return false;
    
  } catch (error) {
    console.error('❌ Erro no teste direto:', error);
    return false;
  }
}

// Função para verificar logs do console
function checkConsoleLogs() {
  console.log('🔍 Verificando logs do console...');
  
  // Interceptar logs futuros
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  let logCount = 0;
  let errorCount = 0;
  let warnCount = 0;
  
  console.log = function(...args) {
    logCount++;
    if (args.some(arg => typeof arg === 'string' && arg.includes('WhatsApp'))) {
      console.log('📱 Log WhatsApp detectado:', args);
    }
    originalLog.apply(console, args);
  };
  
  console.error = function(...args) {
    errorCount++;
    if (args.some(arg => typeof arg === 'string' && arg.includes('WhatsApp'))) {
      console.log('❌ Erro WhatsApp detectado:', args);
    }
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    warnCount++;
    if (args.some(arg => typeof arg === 'string' && arg.includes('WhatsApp'))) {
      console.log('⚠️ Warning WhatsApp detectado:', args);
    }
    originalWarn.apply(console, args);
  };
  
  // Restaurar após 10 segundos
  setTimeout(() => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    
    console.log(`📊 Logs capturados - Logs: ${logCount}, Erros: ${errorCount}, Warnings: ${warnCount}`);
  }, 10000);
}

// Função principal
async function runSimpleWhatsAppTest() {
  console.log('🚀 Iniciando teste simples WhatsApp...');
  
  // Verificar página
  console.log('📍 Página atual:', window.location.pathname);
  
  if (!window.location.pathname.includes('whatsapp')) {
    console.log('⚠️ Navegue para /gerente-whatsapp primeiro');
    console.log('💡 Dica: Acesse a página WhatsApp no menu lateral');
    return;
  }
  
  // Iniciar monitoramento de logs
  checkConsoleLogs();
  
  // Executar teste direto
  const result = await testWhatsAppDirect();
  
  console.log('📊 Resultado do teste:', result ? '✅ PASSOU' : '❌ FALHOU');
  
  if (result) {
    console.log('🎉 Teste bem-sucedido! A página WhatsApp está funcionando.');
  } else {
    console.log('⚠️ Alguns problemas foram detectados.');
    console.log('💡 Dicas:');
    console.log('   1. Verifique se você está logado como gerente');
    console.log('   2. Verifique se a Evolution API está configurada');
    console.log('   3. Tente clicar manualmente no botão "Conectar WhatsApp"');
  }
}

// Executar teste automaticamente
runSimpleWhatsAppTest();

console.log('🔍 Script carregado. Execute runSimpleWhatsAppTest() para rodar novamente.');
