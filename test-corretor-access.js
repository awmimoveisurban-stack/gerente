// 🧪 SCRIPT PARA TESTAR ACESSO DO CORRETOR
// Execute este script no console do navegador após fazer login como corretor

async function testCorretorAccess() {
  console.log('🚀 TESTANDO ACESSO DO CORRETOR');
  console.log('==============================');

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

    // 3. Verificar se é corretor
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

    if (userRole !== 'corretor') {
      console.error('❌ Usuário não é corretor! Role atual:', userRole);
      return;
    }

    console.log('✅ Usuário é corretor!');

    // 4. Verificar páginas disponíveis para corretor
    console.log('\n📋 4. Páginas disponíveis para corretor:');
    const corretorPages = [
      { name: 'Dashboard', url: '/dashboard', description: 'Dashboard pessoal do corretor' },
      { name: 'Meus Leads', url: '/leads', description: 'Leads pessoais do corretor' },
      { name: 'Kanban', url: '/kanban', description: 'Quadro Kanban para gerenciar leads' },
      { name: 'Relatórios', url: '/relatorios', description: 'Relatórios de performance pessoal' }
    ];

    corretorPages.forEach(page => {
      console.log(`  ✅ ${page.name}: ${page.url} - ${page.description}`);
    });

    // 5. Verificar leads do corretor
    console.log('\n📋 5. Verificando leads do corretor...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id);

    if (leadsError) {
      console.error('❌ Erro ao buscar leads:', leadsError);
    } else {
      console.log(`✅ ${leads.length} leads encontrados para o corretor`);
      
      if (leads.length > 0) {
        console.log('📊 Estatísticas dos leads:');
        const stats = {
          novo: leads.filter(l => l.status === 'novo').length,
          contatado: leads.filter(l => l.status === 'contatado').length,
          interessado: leads.filter(l => l.status === 'interessado').length,
          visita_agendada: leads.filter(l => l.status === 'visita_agendada').length,
          proposta: leads.filter(l => l.status === 'proposta').length,
          fechado: leads.filter(l => l.status === 'fechado').length,
          perdido: leads.filter(l => l.status === 'perdido').length,
        };
        console.table(stats);
      }
    }

    // 6. Verificar menu lateral
    console.log('\n🧭 6. Verificando menu lateral...');
    const menuContainer = document.querySelector('[data-sidebar="sidebar"]') || 
                         document.querySelector('nav') ||
                         document.querySelector('[role="navigation"]');
    
    if (menuContainer) {
      const menuLinks = menuContainer.querySelectorAll('a[href]');
      console.log(`📋 ${menuLinks.length} links encontrados no menu:`);
      
      menuLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const text = link.textContent?.trim();
        console.log(`  ${index + 1}. "${text}" -> ${href}`);
      });
      
      // Verificar se as páginas do corretor estão no menu
      const expectedCorretorUrls = ['/dashboard', '/leads', '/kanban', '/relatorios'];
      console.log('\n🎯 Verificando páginas do corretor no menu:');
      
      expectedCorretorUrls.forEach(expectedUrl => {
        const found = Array.from(menuLinks).find(link => 
          link.getAttribute('href') === expectedUrl
        );
        
        if (found) {
          console.log(`  ✅ "${expectedUrl}" encontrado no menu`);
        } else {
          console.log(`  ❌ "${expectedUrl}" NÃO encontrado no menu`);
        }
      });
    }

    // 7. Verificar URL atual
    console.log('\n📍 7. Verificando URL atual...');
    console.log('URL atual:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    
    // Verificar se está na página correta para corretor
    const expectedPaths = ['/dashboard', '/leads', '/kanban', '/relatorios'];
    const currentPath = window.location.pathname;
    
    if (expectedPaths.includes(currentPath)) {
      console.log('✅ Usuário está em uma página válida para corretor');
    } else {
      console.log('⚠️ Usuário pode não estar na página correta para corretor');
      console.log('💡 Páginas válidas para corretor:', expectedPaths);
    }

    // 8. Testar navegação
    console.log('\n🧪 8. Testando navegação...');
    
    // Tentar navegar para dashboard
    console.log('🔄 Tentando navegar para /dashboard...');
    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    setTimeout(() => {
      const newPath = window.location.pathname;
      if (newPath === '/dashboard') {
        console.log('✅ Navegação para /dashboard funcionou!');
      } else {
        console.log('❌ Navegação para /dashboard falhou. Redirecionado para:', newPath);
      }
    }, 500);

    // 9. Resumo final
    console.log('\n🎯 9. RESUMO FINAL:');
    console.log('==================');
    console.log(`👤 Usuário: ${session.user.email}`);
    console.log(`🎭 Role: ${userRole}`);
    console.log(`📋 Leads: ${leads ? leads.length : 0}`);
    console.log(`📍 Página atual: ${currentPath}`);
    
    if (userRole === 'corretor') {
      console.log('\n✅ ACESSO DO CORRETOR FUNCIONANDO!');
      console.log('🎉 O corretor pode:');
      console.log('  - Acessar o dashboard pessoal');
      console.log('  - Gerenciar seus próprios leads');
      console.log('  - Usar o Kanban');
      console.log('  - Ver relatórios pessoais');
      console.log('  - Navegar entre as páginas');
    } else {
      console.log('\n❌ PROBLEMA: Usuário não é corretor!');
    }

  } catch (error) {
    console.error('❌ Erro no teste do corretor:', error);
  }
}

// Executar o teste
testCorretorAccess();





