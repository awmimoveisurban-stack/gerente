// =====================================================
// TESTE CONSOLE - WHATSAPP (COPIAR E COLAR NO CONSOLE)
// =====================================================

// Cole este código diretamente no console do navegador
// na página /gerente-whatsapp

(function testWhatsAppConsole() {
  console.log('🧪 Teste WhatsApp via Console...');
  
  try {
    // 1. Verificar se estamos na página correta
    if (!window.location.pathname.includes('whatsapp')) {
      console.log('❌ Navegue para /gerente-whatsapp primeiro');
      return;
    }
    
    console.log('✅ Página WhatsApp detectada');
    
    // 2. Buscar botões WhatsApp
    const buttons = document.querySelectorAll('button');
    const whatsappButtons = Array.from(buttons).filter(btn => 
      btn.textContent && btn.textContent.includes('WhatsApp')
    );
    
    console.log('📱 Botões WhatsApp encontrados:', whatsappButtons.length);
    
    whatsappButtons.forEach((btn, i) => {
      console.log(`   ${i + 1}. "${btn.textContent.trim()}" - Disabled: ${btn.disabled}`);
    });
    
    // 3. Buscar QR Code
    const qrImages = document.querySelectorAll('img');
    const qrCodes = Array.from(qrImages).filter(img => 
      img.alt && (img.alt.includes('QR') || img.alt.includes('qr'))
    );
    
    console.log('🔍 QR Codes encontrados:', qrCodes.length);
    
    // 4. Buscar elementos de status
    const statusElements = document.querySelectorAll('[class*="badge"], [class*="status"]');
    const statusTexts = Array.from(statusElements)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length < 50);
    
    console.log('📊 Status encontrados:', statusTexts);
    
    // 5. Buscar elementos de erro
    const errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
    const errorTexts = Array.from(errorElements)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length < 100);
    
    if (errorTexts.length > 0) {
      console.log('⚠️ Erros encontrados:', errorTexts);
    }
    
    // 6. Testar clique no botão Conectar (se existir)
    const connectBtn = Array.from(buttons).find(btn => 
      btn.textContent && btn.textContent.includes('Conectar WhatsApp')
    );
    
    if (connectBtn) {
      console.log('🧪 Testando botão Conectar WhatsApp...');
      
      if (!connectBtn.disabled) {
        console.log('✅ Botão habilitado - testando clique...');
        connectBtn.click();
        
        // Aguardar e verificar mudanças
        setTimeout(() => {
          console.log('⏰ Verificando mudanças após clique...');
          
          // Verificar se apareceu QR Code
          const newQrCodes = document.querySelectorAll('img[alt*="QR"], img[alt*="qr"]');
          if (newQrCodes.length > qrCodes.length) {
            console.log('✅ QR Code gerado com sucesso!');
          }
          
          // Verificar mudança de status
          const newStatusElements = document.querySelectorAll('[class*="badge"], [class*="status"]');
          const newStatusTexts = Array.from(newStatusElements)
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length < 50);
          
          if (JSON.stringify(newStatusTexts) !== JSON.stringify(statusTexts)) {
            console.log('✅ Status alterado:', newStatusTexts);
          }
          
          // Verificar se botão mudou
          if (connectBtn.disabled) {
            console.log('✅ Botão foi desabilitado (loading)');
          }
          
        }, 3000);
        
      } else {
        console.log('⚠️ Botão Conectar está desabilitado');
      }
    } else {
      console.log('⚠️ Botão Conectar WhatsApp não encontrado');
    }
    
    // 7. Verificar se há elementos de loading
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    if (loadingElements.length > 0) {
      console.log('⏳ Elementos de loading encontrados:', loadingElements.length);
    }
    
    // 8. Resumo final
    console.log('\n📋 RESUMO:');
    console.log('==========');
    console.log('✅ Página WhatsApp carregada');
    console.log(`📱 Botões WhatsApp: ${whatsappButtons.length}`);
    console.log(`🔍 QR Codes: ${qrCodes.length}`);
    console.log(`📊 Status: ${statusTexts.length > 0 ? statusTexts.join(', ') : 'Nenhum'}`);
    console.log(`⚠️ Erros: ${errorTexts.length > 0 ? errorTexts.length : 'Nenhum'}`);
    
    if (whatsappButtons.length > 0 && !errorTexts.length) {
      console.log('\n🎉 PÁGINA WHATSAPP FUNCIONANDO!');
      console.log('💡 Dica: Clique no botão "Conectar WhatsApp" para testar');
    } else if (errorTexts.length > 0) {
      console.log('\n❌ PROBLEMAS DETECTADOS:');
      errorTexts.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    } else {
      console.log('\n⚠️ PÁGINA CARREGADA MAS PODE TER PROBLEMAS');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
})();

console.log('🔍 Teste concluído. Verifique os resultados acima.');
