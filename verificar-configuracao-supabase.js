// Verificação da configuração do Supabase
// Execute no console do navegador

async function verificarConfiguracaoSupabase() {
  console.log('🧪 Verificando configuração do Supabase...');
  
  try {
    // 1. Verificar se há variáveis de ambiente
    console.log('\n📋 1. Verificando variáveis de ambiente...');
    
    // Verificar se há variáveis no window
    if (window.VITE_SUPABASE_URL) {
      console.log('✅ VITE_SUPABASE_URL encontrada:', window.VITE_SUPABASE_URL);
    } else {
      console.log('❌ VITE_SUPABASE_URL não encontrada');
    }
    
    if (window.VITE_SUPABASE_ANON_KEY) {
      console.log('✅ VITE_SUPABASE_ANON_KEY encontrada:', window.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
    } else {
      console.log('❌ VITE_SUPABASE_ANON_KEY não encontrada');
    }
    
    // 2. Verificar se há Supabase client
    console.log('\n📋 2. Verificando Supabase client...');
    
    if (window.supabase) {
      console.log('✅ Supabase client encontrado');
      console.log('URL:', window.supabase.supabaseUrl);
      console.log('Key:', window.supabase.supabaseKey?.substring(0, 20) + '...');
    } else {
      console.log('❌ Supabase client não encontrado');
      
      // Tentar criar um client manualmente
      console.log('\n📋 Tentando criar Supabase client manualmente...');
      
      const supabaseUrl = 'https://bxtuynqauqasigcbocbm.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o';
      
      try {
        // Tentar importar e criar client
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
        }
        
      } catch (error) {
        console.log('❌ Erro ao criar Supabase client:', error);
      }
    }
    
    // 3. Verificar se há imports do Supabase
    console.log('\n📋 3. Verificando imports do Supabase...');
    
    const scripts = document.querySelectorAll('script[src*="supabase"], script[src*="esm.sh"]');
    console.log('Scripts relacionados ao Supabase:', scripts.length);
    
    // 4. Sugestões de correção
    console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
    
    if (!window.supabase) {
      console.log('1. ❌ Supabase client não inicializado');
      console.log('2. 🔧 Verificar se o arquivo .env está configurado');
      console.log('3. 🔧 Verificar se o Supabase está sendo importado');
      console.log('4. 🔧 Reiniciar servidor de desenvolvimento');
      console.log('5. 🔧 Verificar se há erros no console');
    }
    
  } catch (error) {
    console.log(`❌ Erro na verificação: ${error.message}`);
  }
}

// Executar verificação
verificarConfiguracaoSupabase();
