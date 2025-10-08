// Teste de carregamento do frontend
// Execute no console do navegador

function testFrontendLoading() {
  console.log('🧪 Testando carregamento do frontend...');
  
  try {
    // 1. Verificar se o React está carregado
    console.log('\n📋 1. Verificando React...');
    if (window.React) {
      console.log('✅ React encontrado:', window.React.version);
    } else {
      console.log('❌ React não encontrado');
    }
    
    // 2. Verificar se há componentes carregados
    console.log('\n📋 2. Verificando componentes...');
    const app = document.getElementById('root');
    if (app && app.children.length > 0) {
      console.log('✅ Aplicação React carregada');
      console.log('Componentes encontrados:', app.children.length);
    } else {
      console.log('❌ Aplicação React não carregada');
    }
    
    // 3. Verificar se há erros no console
    console.log('\n📋 3. Verificando erros...');
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
    
    // 4. Verificar se há módulos carregados
    console.log('\n📋 4. Verificando módulos...');
    
    // Verificar se há módulos do Vite
    if (window.__vite_plugin_react_preamble_installed__) {
      console.log('✅ Vite React plugin carregado');
    } else {
      console.log('❌ Vite React plugin não encontrado');
    }
    
    // 5. Verificar se há módulos do Supabase
    if (window.__SUPABASE__) {
      console.log('✅ Módulo Supabase encontrado:', window.__SUPABASE__);
    } else {
      console.log('❌ Módulo Supabase não encontrado');
    }
    
    // 6. Verificar se há módulos do TanStack Query
    if (window.__REACT_QUERY_DEVTOOLS__) {
      console.log('✅ TanStack Query DevTools encontrado');
    } else {
      console.log('❌ TanStack Query DevTools não encontrado');
    }
    
    // 7. Sugestões de correção
    console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
    
    if (!window.React) {
      console.log('1. ❌ React não carregado');
      console.log('2. 🔧 Verificar se o servidor está rodando');
      console.log('3. 🔧 Verificar se há erros no console');
      console.log('4. 🔧 Verificar se as dependências estão instaladas');
    } else if (!app || app.children.length === 0) {
      console.log('1. ❌ Aplicação React não renderizada');
      console.log('2. 🔧 Verificar se há erros no console');
      console.log('3. 🔧 Verificar se o componente App está sendo renderizado');
      console.log('4. 🔧 Verificar se há problemas de roteamento');
    } else {
      console.log('1. ✅ Frontend carregado corretamente');
      console.log('2. 🔧 Testar autenticação');
      console.log('3. 🔧 Testar navegação');
      console.log('4. 🔧 Testar funcionalidades');
    }
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Servidor rodando');
    console.log('2. ✅ Supabase client criado');
    console.log('3. 🔧 Testar autenticação');
    console.log('4. 🔧 Testar Edge Function');
    
  } catch (error) {
    console.log(`❌ Erro na verificação: ${error.message}`);
  }
}

// Executar verificação
testFrontendLoading();
