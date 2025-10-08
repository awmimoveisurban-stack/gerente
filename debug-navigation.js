// 🧪 SCRIPT DE DEBUG DA NAVEGAÇÃO
// Execute este script no console do navegador para diagnosticar problemas de navegação

async function debugNavigation() {
  console.log('🔍 DEBUGANDO NAVEGAÇÃO');
  console.log('========================');

  try {
    // 1. Verificar se supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado.');
      return;
    }
    console.log('✅ Supabase carregado.');

    // 2. Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado.');
      return;
    }
    console.log('✅ Usuário autenticado:', session.user.email);

    // 3. Verificar roles do usuário
    console.log('\n🔐 3. Verificando roles do usuário...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
      return;
    }

    console.log('✅ Roles encontradas:', roles);
    const userRole = roles && roles.length > 0 ? roles[0].role : null;
    console.log('🎯 Role principal:', userRole);

    // 4. Verificar URL atual
    console.log('\n📍 4. Verificando URL atual...');
    console.log('URL atual:', window.location.href);
    console.log('Pathname:', window.location.pathname);

    // 5. Verificar se há problemas com o React Router
    console.log('\n🧭 5. Verificando React Router...');
    
    // Simular navegação para diferentes páginas
    const testUrls = [
      '/kanban',
      '/leads', 
      '/gerente',
      '/gerente/whatsapp',
      '/dashboard'
    ];

    console.log('🧪 Testando URLs:');
    testUrls.forEach(url => {
      console.log(`  - ${url}: ${window.location.origin}${url}`);
    });

    // 6. Verificar se há redirecionamentos automáticos
    console.log('\n🔄 6. Verificando redirecionamentos...');
    
    // Adicionar listener para mudanças de URL
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    let redirectCount = 0;
    
    history.pushState = function(...args) {
      redirectCount++;
      console.log(`🔄 Redirect detectado (pushState): ${args[2]}`);
      return originalPushState.apply(history, args);
    };
    
    history.replaceState = function(...args) {
      redirectCount++;
      console.log(`🔄 Redirect detectado (replaceState): ${args[2]}`);
      return originalReplaceState.apply(history, args);
    };

    // 7. Testar navegação manual
    console.log('\n🧪 7. Testando navegação manual...');
    console.log('⚠️ Vou tentar navegar para /kanban...');
    
    // Tentar navegar para kanban
    window.history.pushState({}, '', '/kanban');
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    setTimeout(() => {
      console.log('📍 URL após tentativa de navegação:', window.location.pathname);
      
      if (window.location.pathname === '/kanban') {
        console.log('✅ Navegação para /kanban funcionou!');
      } else {
        console.log('❌ Navegação para /kanban falhou. Redirecionado para:', window.location.pathname);
      }
      
      // Restaurar funções originais
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      
      console.log(`\n📊 Total de redirecionamentos detectados: ${redirectCount}`);
      
      // 8. Diagnóstico final
      console.log('\n🎯 8. DIAGNÓSTICO FINAL:');
      
      if (redirectCount > 0) {
        console.log('❌ PROBLEMA: Há redirecionamentos automáticos acontecendo');
        console.log('💡 SOLUÇÃO: Verificar o componente RoleBasedRedirect');
      } else {
        console.log('✅ Navegação funcionando normalmente');
      }
      
      if (userRole === 'gerente') {
        console.log('👤 Usuário é GERENTE');
        console.log('✅ Deve ter acesso a: /gerente, /gerente/whatsapp, /kanban, /leads');
      } else if (userRole === 'corretor') {
        console.log('👤 Usuário é CORRETOR');
        console.log('✅ Deve ter acesso a: /dashboard, /kanban, /leads');
      } else {
        console.log('❌ PROBLEMA: Usuário não tem role definida');
      }
      
    }, 1000);

  } catch (error) {
    console.error('❌ Erro no debug da navegação:', error);
  }
}

// Executar o debug
debugNavigation();





