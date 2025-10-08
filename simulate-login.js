// SIMULAR LOGIN MANUAL
// Execute este script no console do navegador na pagina /auth

function simulateManualLogin() {
  console.log('SIMULANDO LOGIN MANUAL');
  console.log('---');

  try {
    // 1. Verificar se estamos na página de auth
    console.log('URL atual:', window.location.href);
    
    if (!window.location.pathname.includes('/auth')) {
      console.log('ERRO: Voce nao esta na pagina de autenticacao');
      console.log('Vá para: http://127.0.0.1:3011/auth');
      return;
    }

    // 2. Aguardar a página carregar
    console.log('\nAguardando pagina carregar...');
    setTimeout(() => {
      // 3. Tentar encontrar os campos de login
      console.log('\nProcurando campos de login...');
      
      const emailInput = document.querySelector('input[type="email"]') || 
                        document.querySelector('input[placeholder*="email" i]') ||
                        document.querySelector('input[placeholder*="Email"]');
      
      const passwordInput = document.querySelector('input[type="password"]') || 
                           document.querySelector('input[placeholder*="senha" i]') ||
                           document.querySelector('input[placeholder*="Senha"]');
      
      const loginButton = document.querySelector('button[type="submit"]') ||
                         document.querySelector('button:contains("Entrar")') ||
                         document.querySelector('button:contains("Login")');

      if (emailInput && passwordInput) {
        console.log('OK: Campos de login encontrados');
        
        // Preencher os campos
        emailInput.value = 'corretor@imobiliaria.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        passwordInput.value = '12345678';
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        console.log('OK: Campos preenchidos');
        console.log('Email:', emailInput.value);
        console.log('Senha:', passwordInput.value);
        
        // Aguardar um pouco e clicar no botão
        setTimeout(() => {
          if (loginButton) {
            console.log('OK: Clicando no botao de login...');
            loginButton.click();
          } else {
            console.log('AVISO: Botao de login nao encontrado');
            console.log('Tente clicar manualmente no botao de login');
          }
        }, 1000);
        
      } else {
        console.log('ERRO: Campos de login nao encontrados');
        console.log('Verifique se a pagina carregou completamente');
        console.log('Ou tente preencher manualmente:');
        console.log('Email: corretor@imobiliaria.com');
        console.log('Senha: 12345678');
      }
      
    }, 3000);

  } catch (error) {
    console.error('ERRO geral:', error);
  }
}

// Executar simulação
simulateManualLogin();





