// Teste de importação do Supabase
// Execute no console do navegador

async function testSupabaseImport() {
  console.log('🧪 Testando importação do Supabase...');
  
  try {
    // 1. Verificar se o Supabase está sendo importado
    console.log('\n📋 1. Verificando importação do Supabase...');
    
    // Verificar se há módulos carregados
    if (window.__SUPABASE__) {
      console.log('✅ Módulo Supabase encontrado:', window.__SUPABASE__);
    } else {
      console.log('❌ Módulo Supabase não encontrado');
    }
    
    // 2. Tentar importar manualmente
    console.log('\n📋 2. Tentando importar Supabase manualmente...');
    
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      
      const supabaseUrl = 'https://bxtuynqauqasigcbocbm.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o';
      
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      
      console.log('✅ Supabase client criado manualmente');
      
      // 3. Testar autenticação
      console.log('\n📋 3. Testando autenticação...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('❌ Erro ao obter sessão:', error);
      } else if (session) {
        console.log('✅ Sessão ativa encontrada:', session.user?.email);
        console.log('Token:', session.access_token?.substring(0, 20) + '...');
        
        // 4. Testar Edge Function
        console.log('\n📋 4. Testando Edge Function...');
        
        const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ action: 'test' })
        });
        
        console.log('Edge Function Status:', response.status);
        const responseData = await response.text();
        console.log('Response:', responseData);
        
      } else {
        console.log('⚠️ Nenhuma sessão ativa');
        
        // 5. Tentar fazer login
        console.log('\n📋 5. Tentando fazer login...');
        
        // Nota: Você precisará fornecer credenciais válidas
        console.log('💡 Para fazer login, execute:');
        console.log(`
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'seu-email@exemplo.com',
          password: 'sua-senha'
        });
        `);
      }
      
      // 6. Expor globalmente para testes
      window.supabase = supabase;
      console.log('✅ Supabase client exposto globalmente como window.supabase');
      
    } catch (error) {
      console.log('❌ Erro ao criar Supabase client:', error);
    }
    
    // 7. Verificar se há erros no console
    console.log('\n📋 6. Verificando erros no console...');
    
    // Verificar se há erros relacionados ao Supabase
    const errors = [];
    const originalError = console.error;
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // Restaurar console.error
    setTimeout(() => {
      console.error = originalError;
      if (errors.length > 0) {
        console.log('⚠️ Erros encontrados:', errors);
      } else {
        console.log('✅ Nenhum erro encontrado');
      }
    }, 1000);
    
    // 8. Sugestões de correção
    console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
    console.log('1. ❌ Supabase client não inicializado globalmente');
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
testSupabaseImport();
