// Verificação da importação do Supabase
// Execute no console do navegador

async function verificarImportacaoSupabase() {
  console.log('🧪 Verificando importação do Supabase...');
  
  try {
    // 1. Verificar se há arquivos de configuração
    console.log('\n📋 1. Verificando arquivos de configuração...');
    
    // Verificar se há arquivos relacionados ao Supabase
    const scripts = document.querySelectorAll('script[src*="supabase"], script[src*="esm.sh"]');
    console.log('Scripts relacionados ao Supabase:', scripts.length);
    
    // Verificar se há imports no código
    const allScripts = document.querySelectorAll('script');
    let foundImports = false;
    
    allScripts.forEach((script, index) => {
      if (script.textContent && script.textContent.includes('supabase')) {
        console.log(`Script ${index} contém supabase:`, script.textContent.substring(0, 200) + '...');
        foundImports = true;
      }
    });
    
    if (!foundImports) {
      console.log('⚠️ Nenhum import do Supabase encontrado nos scripts');
    }
    
    // 2. Verificar se há módulos carregados
    console.log('\n📋 2. Verificando módulos carregados...');
    
    // Verificar se há módulos do Supabase
    if (window.__SUPABASE__) {
      console.log('✅ Módulo Supabase encontrado:', window.__SUPABASE__);
    } else {
      console.log('❌ Módulo Supabase não encontrado');
    }
    
    // 3. Verificar se há configuração manual
    console.log('\n📋 3. Verificando configuração manual...');
    
    const supabaseUrl = 'https://bxtuynqauqasigcbocbm.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o';
    
    try {
      // Tentar criar client manualmente
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log('✅ Supabase client criado manualmente');
      
      // Testar conexão
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('❌ Erro ao obter sessão:', error);
      } else if (data.session) {
        console.log('✅ Sessão ativa encontrada:', data.session.user?.email);
        console.log('Token:', data.session.access_token?.substring(0, 20) + '...');
        
        // Testar Edge Function com token
        const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session.access_token}`
          },
          body: JSON.stringify({ action: 'test' })
        });
        
        console.log('Edge Function Status:', response.status);
        const responseData = await response.text();
        console.log('Response:', responseData);
        
      } else {
        console.log('⚠️ Nenhuma sessão ativa');
        
        // Tentar fazer login manualmente
        console.log('\n📋 Tentando fazer login manualmente...');
        
        // Nota: Você precisará fornecer credenciais válidas
        console.log('💡 Para fazer login, execute:');
        console.log(`
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'seu-email@exemplo.com',
          password: 'sua-senha'
        });
        `);
      }
      
    } catch (error) {
      console.log('❌ Erro ao criar Supabase client:', error);
    }
    
    // 4. Sugestões de correção
    console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
    
    console.log('1. ❌ Supabase client não inicializado');
    console.log('2. 🔧 Verificar se o arquivo .env está configurado');
    console.log('3. 🔧 Verificar se o Supabase está sendo importado');
    console.log('4. 🔧 Reiniciar servidor de desenvolvimento');
    console.log('5. 🔧 Verificar se há erros no console');
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Configure o arquivo .env');
    console.log('2. Reinicie o servidor');
    console.log('3. Verifique se o Supabase está sendo importado');
    console.log('4. Teste a autenticação');
    
  } catch (error) {
    console.log(`❌ Erro na verificação: ${error.message}`);
  }
}

// Executar verificação
verificarImportacaoSupabase();
