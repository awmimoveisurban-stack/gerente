// Diagnóstico completo do sistema de login
// Execute no console do navegador

async function diagnosticoLogin() {
  console.log('🧪 Diagnóstico completo do sistema de login...');
  
  try {
    // 1. Verificar diferentes locais de armazenamento
    console.log('\n📋 1. Verificando armazenamento...');
    
    const localStorageToken = localStorage.getItem('supabase.auth.token');
    const sessionStorageToken = sessionStorage.getItem('supabase.auth.token');
    
    console.log('localStorage token:', localStorageToken);
    console.log('sessionStorage token:', sessionStorageToken);
    
    // 2. Verificar outras possíveis chaves
    console.log('\n📋 2. Verificando outras chaves possíveis...');
    
    const allLocalStorage = {};
    const allSessionStorage = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('supabase')) {
        allLocalStorage[key] = localStorage.getItem(key);
      }
    }
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.includes('supabase')) {
        allSessionStorage[key] = sessionStorage.getItem(key);
      }
    }
    
    console.log('Todas as chaves localStorage com supabase:', allLocalStorage);
    console.log('Todas as chaves sessionStorage com supabase:', allSessionStorage);
    
    // 3. Verificar se há Supabase client
    console.log('\n📋 3. Verificando Supabase client...');
    
    if (window.supabase) {
      console.log('✅ Supabase client encontrado');
      
      try {
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
          console.log('❌ Erro ao obter sessão:', error);
        } else if (session) {
          console.log('✅ Sessão ativa encontrada');
          console.log('User:', session.user?.email);
          console.log('Access token:', session.access_token?.substring(0, 20) + '...');
          console.log('Expires at:', new Date(session.expires_at * 1000));
        } else {
          console.log('⚠️ Nenhuma sessão ativa');
        }
      } catch (error) {
        console.log('❌ Erro ao verificar sessão:', error);
      }
    } else {
      console.log('❌ Supabase client não encontrado');
    }
    
    // 4. Verificar cookies
    console.log('\n📋 4. Verificando cookies...');
    
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && key.includes('supabase')) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    console.log('Cookies com supabase:', cookies);
    
    // 5. Verificar se há token em outros locais
    console.log('\n📋 5. Verificando outros locais...');
    
    // Verificar se há token no HTML
    const metaTags = document.querySelectorAll('meta[name*="supabase"], meta[name*="token"]');
    console.log('Meta tags relacionadas:', metaTags);
    
    // Verificar se há token em scripts
    const scripts = document.querySelectorAll('script');
    let foundInScripts = false;
    scripts.forEach((script, index) => {
      if (script.textContent && script.textContent.includes('supabase')) {
        console.log(`Script ${index} contém supabase`);
        foundInScripts = true;
      }
    });
    
    if (!foundInScripts) {
      console.log('⚠️ Nenhum script encontrado com supabase');
    }
    
    // 6. Verificar configuração do Supabase
    console.log('\n📋 6. Verificando configuração...');
    
    if (window.supabase) {
      console.log('Supabase URL:', window.supabase.supabaseUrl);
      console.log('Supabase Key:', window.supabase.supabaseKey?.substring(0, 20) + '...');
    }
    
    // 7. Sugestões de correção
    console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
    
    if (!window.supabase) {
      console.log('1. ❌ Supabase client não inicializado');
      console.log('2. 🔧 Verificar se o arquivo .env está configurado');
      console.log('3. 🔧 Verificar se o Supabase está sendo importado corretamente');
    } else if (!localStorageToken && !sessionStorageToken) {
      console.log('1. ❌ Token não está sendo armazenado');
      console.log('2. 🔧 Verificar configuração de autenticação');
      console.log('3. 🔧 Verificar se o login está funcionando corretamente');
    } else {
      console.log('1. ✅ Sistema de autenticação funcionando');
      console.log('2. 🔧 Token encontrado em outro local');
    }
    
  } catch (error) {
    console.log(`❌ Erro no diagnóstico: ${error.message}`);
  }
}

// Executar diagnóstico
diagnosticoLogin();
