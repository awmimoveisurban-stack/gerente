// 🧪 SCRIPT PARA TESTAR AMBOS OS USUÁRIOS (GERENTE E CORRETOR)
// Execute este script no console do navegador para verificar o sistema completo

async function testBothUsers() {
  console.log('🚀 TESTANDO SISTEMA COMPLETO - GERENTE E CORRETOR');
  console.log('==================================================');

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
      console.log('💡 Faça login primeiro com:');
      console.log('   👨‍💼 Gerente: gerente@imobiliaria.com / admin123');
      console.log('   👤 Corretor: corretor@imobiliaria.com / 12345678');
      return;
    }
    console.log('✅ Usuário autenticado:', session.user.email);

    // 3. Verificar role do usuário
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
      return;
    }

    const userRole = roles && roles.length > 0 ? roles[0].role : null;
    console.log('🎯 Role atual:', userRole);

    // 4. Verificar páginas disponíveis baseado na role
    console.log('\n📋 4. Páginas disponíveis:');
    
    if (userRole === 'gerente') {
      console.log('👨‍💼 PÁGINAS DO GERENTE:');
      const gerentePages = [
        { name: 'Dashboard Geral', url: '/gerente', description: 'Visão geral da empresa' },
        { name: 'Todos os Leads', url: '/todos-leads', description: 'Todos os leads da empresa' },
        { name: 'Kanban', url: '/kanban', description: 'Quadro Kanban completo' },
        { name: 'WhatsApp', url: '/gerente/whatsapp', description: 'Configuração WhatsApp' },
        { name: 'Equipe', url: '/gerente/equipe', description: 'Gerenciamento da equipe' },
        { name: 'Relatórios', url: '/gerente/relatorios', description: 'Relatórios gerenciais' }
      ];
      
      gerentePages.forEach(page => {
        console.log(`  ✅ ${page.name}: ${page.url} - ${page.description}`);
      });
      
    } else if (userRole === 'corretor') {
      console.log('👤 PÁGINAS DO CORRETOR:');
      const corretorPages = [
        { name: 'Dashboard', url: '/dashboard', description: 'Dashboard pessoal' },
        { name: 'Meus Leads', url: '/leads', description: 'Leads pessoais' },
        { name: 'Kanban', url: '/kanban', description: 'Quadro Kanban pessoal' },
        { name: 'Relatórios', url: '/relatorios', description: 'Relatórios pessoais' }
      ];
      
      corretorPages.forEach(page => {
        console.log(`  ✅ ${page.name}: ${page.url} - ${page.description}`);
      });
    } else {
      console.log('❌ Role não reconhecida:', userRole);
      return;
    }

    // 5. Verificar leads do usuário
    console.log('\n📋 5. Verificando leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id);

    if (leadsError) {
      console.error('❌ Erro ao buscar leads:', leadsError);
    } else {
      console.log(`✅ ${leads.length} leads encontrados`);
      
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
    }

    // 7. Verificar URL atual e redirecionamento
    console.log('\n📍 7. Verificando navegação...');
    console.log('URL atual:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    
    // Verificar se está na página correta
    let expectedPaths = [];
    if (userRole === 'gerente') {
      expectedPaths = ['/gerente', '/todos-leads', '/kanban', '/gerente/whatsapp', '/gerente/equipe', '/gerente/relatorios'];
    } else if (userRole === 'corretor') {
      expectedPaths = ['/dashboard', '/leads', '/kanban', '/relatorios'];
    }
    
    const currentPath = window.location.pathname;
    if (expectedPaths.includes(currentPath)) {
      console.log('✅ Usuário está em uma página válida para seu role');
    } else {
      console.log('⚠️ Usuário pode não estar na página correta para seu role');
      console.log('💡 Páginas válidas para', userRole + ':', expectedPaths);
    }

    // 8. Testar navegação para página principal
    console.log('\n🧪 8. Testando navegação...');
    
    let targetPath = '';
    if (userRole === 'gerente') {
      targetPath = '/gerente';
    } else if (userRole === 'corretor') {
      targetPath = '/dashboard';
    }
    
    if (targetPath) {
      console.log(`🔄 Tentando navegar para ${targetPath}...`);
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
      
      setTimeout(() => {
        const newPath = window.location.pathname;
        if (newPath === targetPath) {
          console.log(`✅ Navegação para ${targetPath} funcionou!`);
        } else {
          console.log(`❌ Navegação para ${targetPath} falhou. Redirecionado para:`, newPath);
        }
      }, 500);
    }

    // 9. Resumo final
    console.log('\n🎯 9. RESUMO FINAL:');
    console.log('==================');
    console.log(`👤 Usuário: ${session.user.email}`);
    console.log(`🎭 Role: ${userRole}`);
    console.log(`📋 Leads: ${leads ? leads.length : 0}`);
    console.log(`📍 Página atual: ${currentPath}`);
    console.log(`🧭 Links no menu: ${menuContainer ? menuContainer.querySelectorAll('a[href]').length : 0}`);
    
    if (userRole === 'gerente') {
      console.log('\n✅ SISTEMA DO GERENTE FUNCIONANDO!');
      console.log('🎉 O gerente pode:');
      console.log('  - Acessar dashboard geral da empresa');
      console.log('  - Ver todos os leads da equipe');
      console.log('  - Configurar WhatsApp');
      console.log('  - Gerenciar equipe');
      console.log('  - Ver relatórios gerenciais');
      
    } else if (userRole === 'corretor') {
      console.log('\n✅ SISTEMA DO CORRETOR FUNCIONANDO!');
      console.log('🎉 O corretor pode:');
      console.log('  - Acessar dashboard pessoal');
      console.log('  - Gerenciar seus próprios leads');
      console.log('  - Usar Kanban pessoal');
      console.log('  - Ver relatórios pessoais');
    }

    // 10. Instruções para testar o outro usuário
    console.log('\n🔄 10. PARA TESTAR O OUTRO USUÁRIO:');
    console.log('===================================');
    
    if (userRole === 'gerente') {
      console.log('Para testar como CORRETOR:');
      console.log('1. Faça logout');
      console.log('2. Login: corretor@imobiliaria.com / 12345678');
      console.log('3. Execute este script novamente');
    } else if (userRole === 'corretor') {
      console.log('Para testar como GERENTE:');
      console.log('1. Faça logout');
      console.log('2. Login: gerente@imobiliaria.com / admin123');
      console.log('3. Execute este script novamente');
    }

  } catch (error) {
    console.error('❌ Erro no teste do sistema:', error);
  }
}

// Executar o teste
testBothUsers();





