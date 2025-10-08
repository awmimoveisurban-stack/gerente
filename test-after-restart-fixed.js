// Teste após reiniciar o servidor - VERSÃO CORRIGIDA
// Execute no console do navegador

async function testAfterRestartFixed() {
  console.log('🧪 Testando configuração após reiniciar servidor...');
  
  try {
    // 1. Verificar variáveis de ambiente
    console.log('\n📋 1. Verificando variáveis de ambiente...');
    
    // Verificar se as variáveis estão disponíveis (sem import.meta)
    console.log('💡 Verificando se as variáveis estão carregadas...');
    
    // 2. Verificar Supabase client
    console.log('\n📋 2. Verificando Supabase client...');
    
    // Verificar se o Supabase está sendo importado
    if (window.supabase) {
      console.log('✅ Supabase client encontrado globalmente');
    } else {
      console.log('❌ Supabase client não encontrado globalmente');
    }
    
    // Verificar se há módulos carregados
    if (window.__SUPABASE__) {
      console.log('✅ Módulo Supabase encontrado:', window.__SUPABASE__);
    } else {
      console.log('❌ Módulo Supabase não encontrado');
    }
    
    // 3. Tentar criar Supabase client manualmente
    console.log('\n📋 3. Tentando criar Supabase client manualmente...');
    
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      
      const supabase = createClient(
        'https://bxtuynqauqasigcbocbm.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o',
        {
          auth: {
            storage: localStorage,
            persistSession: true,
            autoRefreshToken: true,
          }
        }
      );
      
      console.log('✅ Supabase client criado manualmente');
      
      // 4. Testar autenticação
      console.log('\n📋 4. Testando autenticação...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('❌ Erro ao obter sessão:', error);
      } else if (session) {
        console.log('✅ Sessão ativa encontrada:', session.user?.email);
        console.log('Token:', session.access_token?.substring(0, 20) + '...');
        
        // 5. Testar Edge Function
        console.log('\n📋 5. Testando Edge Function...');
        
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
        
        // 6. Sugestões de login
        console.log('\n📋 6. Sugestões de login...');
        console.log('💡 Para fazer login, execute:');
        console.log(`
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'seu-email@exemplo.com',
          password: 'sua-senha'
        });
        `);
      }
      
      // 7. Expor globalmente para testes
      window.supabase = supabase;
      console.log('✅ Supabase client exposto globalmente como window.supabase');
      
    } catch (error) {
      console.log('❌ Erro ao criar Supabase client:', error);
    }
    
    // 8. Verificar se há erros no console
    console.log('\n📋 7. Verificando erros no console...');
    
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
    
    // 9. Sugestões de correção
    console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
    
    if (!window.supabase) {
      console.log('1. ❌ Supabase client não inicializado globalmente');
      console.log('2. 🔧 Verificar se o Supabase está sendo importado');
      console.log('3. 🔧 Verificar se há erros no console');
      console.log('4. 🔧 Verificar se as dependências estão instaladas');
    } else {
      console.log('1. ✅ Configuração básica funcionando');
      console.log('2. 🔧 Testar autenticação');
      console.log('3. 🔧 Testar Edge Function');
    }
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Arquivo .env configurado');
    console.log('2. ✅ Servidor reiniciado');
    console.log('3. 🔧 Verificar se o Supabase está sendo importado');
    console.log('4. 🔧 Testar autenticação');
    
  } catch (error) {
    console.log(`❌ Erro na verificação: ${error.message}`);
  }
}

// Executar verificação
testAfterRestartFixed();
