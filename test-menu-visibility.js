// 🧪 SCRIPT PARA TESTAR VISIBILIDADE DO MENU
// Execute este script no console do navegador para verificar o menu

async function testMenuVisibility() {
  console.log('🔍 TESTANDO VISIBILIDADE DO MENU');
  console.log('==================================');

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

    // 4. Verificar elementos do menu
    console.log('\n📋 4. Verificando elementos do menu...');
    
    const menuItems = {
      corretor: [
        { title: "Dashboard", url: "/dashboard" },
        { title: "Meus Leads", url: "/leads" },
        { title: "Kanban", url: "/kanban" },
        { title: "Relatórios", url: "/relatorios" }
      ],
      gerente: [
        { title: "Dashboard Geral", url: "/gerente" },
        { title: "Todos os Leads", url: "/todos-leads" },
        { title: "Kanban", url: "/kanban" },
        { title: "WhatsApp", url: "/gerente/whatsapp" },
        { title: "Equipe", url: "/gerente/equipe" },
        { title: "Relatórios", url: "/gerente/relatorios" }
      ]
    };

    const expectedItems = userRole === 'gerente' ? menuItems.gerente : menuItems.corretor;
    
    console.log(`\n📋 Itens esperados para ${userRole}:`);
    expectedItems.forEach(item => {
      console.log(`  ✅ ${item.title} - ${item.url}`);
    });

    // 5. Verificar se os elementos do menu existem no DOM
    console.log('\n🔍 5. Verificando elementos no DOM...');
    
    const menuContainer = document.querySelector('[data-sidebar="sidebar"]') || 
                         document.querySelector('nav') ||
                         document.querySelector('[role="navigation"]');
    
    if (menuContainer) {
      console.log('✅ Container do menu encontrado');
      
      // Verificar links do menu
      const menuLinks = menuContainer.querySelectorAll('a[href]');
      console.log(`📋 ${menuLinks.length} links encontrados no menu:`);
      
      menuLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const text = link.textContent?.trim();
        console.log(`  ${index + 1}. "${text}" -> ${href}`);
      });
      
      // Verificar se todos os itens esperados estão presentes
      console.log('\n🎯 6. Verificando itens esperados vs encontrados...');
      
      expectedItems.forEach(expectedItem => {
        const found = Array.from(menuLinks).find(link => 
          link.getAttribute('href') === expectedItem.url
        );
        
        if (found) {
          console.log(`  ✅ "${expectedItem.title}" encontrado`);
        } else {
          console.log(`  ❌ "${expectedItem.title}" NÃO encontrado`);
        }
      });
      
    } else {
      console.log('❌ Container do menu não encontrado');
      console.log('💡 Tentando encontrar elementos do menu...');
      
      // Tentar encontrar elementos alternativos
      const sidebarElements = document.querySelectorAll('[class*="sidebar"], [class*="menu"], [class*="nav"]');
      console.log(`🔍 ${sidebarElements.length} elementos relacionados ao menu encontrados`);
      
      sidebarElements.forEach((el, index) => {
        console.log(`  ${index + 1}. ${el.tagName} - ${el.className}`);
      });
    }

    // 6. Verificar se há erros no console
    console.log('\n🚨 7. Verificando erros no console...');
    const hasErrors = console.error.toString().includes('Error');
    if (hasErrors) {
      console.log('⚠️ Possíveis erros detectados no console');
    } else {
      console.log('✅ Nenhum erro detectado');
    }

    // 7. Diagnóstico final
    console.log('\n🎯 8. DIAGNÓSTICO FINAL:');
    console.log('========================');
    console.log(`👤 Usuário: ${session.user.email}`);
    console.log(`🎭 Role: ${userRole}`);
    console.log(`📋 Itens esperados: ${expectedItems.length}`);
    
    if (userRole === 'gerente') {
      console.log('👨‍💼 Menu do GERENTE deve mostrar:');
      console.log('  - Dashboard Geral');
      console.log('  - Todos os Leads');
      console.log('  - Kanban');
      console.log('  - WhatsApp');
      console.log('  - Equipe');
      console.log('  - Relatórios');
    } else {
      console.log('👤 Menu do CORRETOR deve mostrar:');
      console.log('  - Dashboard');
      console.log('  - Meus Leads');
      console.log('  - Kanban');
      console.log('  - Relatórios');
    }
    
    console.log('\n💡 SOLUÇÕES POSSÍVEIS:');
    console.log('1. Recarregar a página (F5)');
    console.log('2. Verificar se o usuário tem role correta');
    console.log('3. Verificar se há erros no console');
    console.log('4. Verificar se o componente AppSidebar está sendo renderizado');

  } catch (error) {
    console.error('❌ Erro no teste do menu:', error);
  }
}

// Executar o teste
testMenuVisibility();





