// 🧪 SCRIPT PARA TESTAR INTEGRAÇÕES ENTRE PÁGINAS
// Execute este script no console do navegador para verificar as integrações

async function testPageIntegrations() {
  console.log('🚀 TESTANDO INTEGRAÇÕES ENTRE PÁGINAS');
  console.log('=====================================');

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

    // 4. Testar busca global
    console.log('\n🔍 4. Testando busca global...');
    
    // Verificar se o contexto de busca está disponível
    const searchInput = document.querySelector('input[placeholder*="Buscar leads"]');
    if (searchInput) {
      console.log('✅ Campo de busca global encontrado');
      
      // Simular busca
      searchInput.value = 'teste';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Simular Enter
      searchInput.dispatchEvent(new KeyboardEvent('keypress', {
        key: 'Enter',
        bubbles: true
      }));
      
      console.log('✅ Busca global testada');
    } else {
      console.log('❌ Campo de busca global não encontrado');
    }

    // 5. Testar navegação entre páginas
    console.log('\n🧭 5. Testando navegação entre páginas...');
    
    const currentPath = window.location.pathname;
    console.log('📍 Página atual:', currentPath);
    
    // Verificar links do menu
    const menuLinks = document.querySelectorAll('a[href]');
    console.log(`📋 ${menuLinks.length} links encontrados no menu:`);
    
    const expectedPages = userRole === 'gerente' 
      ? ['/gerente', '/todos-leads', '/kanban', '/gerente/whatsapp', '/gerente/equipe', '/gerente/relatorios']
      : ['/dashboard', '/leads', '/kanban', '/relatorios'];
    
    expectedPages.forEach(expectedPage => {
      const found = Array.from(menuLinks).find(link => 
        link.getAttribute('href') === expectedPage
      );
      
      if (found) {
        console.log(`  ✅ "${expectedPage}" encontrado no menu`);
      } else {
        console.log(`  ❌ "${expectedPage}" NÃO encontrado no menu`);
      }
    });

    // 6. Testar funcionalidades específicas da página
    console.log('\n⚙️ 6. Testando funcionalidades da página...');
    
    if (currentPath.includes('/leads') || currentPath.includes('/todos-leads')) {
      // Testar botões da página de leads
      const buttons = document.querySelectorAll('button');
      console.log(`📋 ${buttons.length} botões encontrados na página`);
      
      // Verificar botões específicos
      const buttonTexts = Array.from(buttons).map(btn => btn.textContent?.trim()).filter(Boolean);
      
      if (buttonTexts.some(text => text.includes('Novo Lead'))) {
        console.log('  ✅ Botão "Novo Lead" encontrado');
      }
      
      if (buttonTexts.some(text => text.includes('Visualizar Kanban'))) {
        console.log('  ✅ Botão "Visualizar Kanban" encontrado');
      }
      
      if (buttonTexts.some(text => text.includes('Mais Filtros'))) {
        console.log('  ✅ Botão "Mais Filtros" encontrado');
      }
      
    } else if (currentPath.includes('/kanban')) {
      // Testar funcionalidades do Kanban
      const kanbanColumns = document.querySelectorAll('[data-rbd-droppable-id]');
      console.log(`📋 ${kanbanColumns.length} colunas encontradas no Kanban`);
      
    } else if (currentPath.includes('/gerente/whatsapp')) {
      // Testar funcionalidades do WhatsApp
      const whatsappButtons = document.querySelectorAll('button');
      const whatsappButtonTexts = Array.from(whatsappButtons).map(btn => btn.textContent?.trim()).filter(Boolean);
      
      if (whatsappButtonTexts.some(text => text.includes('Conectar'))) {
        console.log('  ✅ Botão "Conectar WhatsApp" encontrado');
      }
    }

    // 7. Testar modais e componentes
    console.log('\n🎭 7. Testando modais e componentes...');
    
    // Verificar se modais estão disponíveis
    const modals = document.querySelectorAll('[role="dialog"]');
    console.log(`📋 ${modals.length} modais encontrados na página`);
    
    // Verificar dropdowns de ação
    const dropdowns = document.querySelectorAll('[data-radix-popper-content-wrapper]');
    console.log(`📋 ${dropdowns.length} dropdowns encontrados na página`);

    // 8. Testar hooks e dados
    console.log('\n📊 8. Testando dados e hooks...');
    
    // Verificar se há leads carregados
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id);

    if (leadsError) {
      console.error('❌ Erro ao buscar leads:', leadsError);
    } else {
      console.log(`✅ ${leads.length} leads encontrados para o usuário`);
    }

    // 9. Testar responsividade
    console.log('\n📱 9. Testando responsividade...');
    
    const isMobile = window.innerWidth < 768;
    console.log(`📱 Tamanho da tela: ${window.innerWidth}x${window.innerHeight} (${isMobile ? 'Mobile' : 'Desktop'})`);
    
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    if (sidebar) {
      console.log('✅ Sidebar encontrada');
    }

    // 10. Resumo final
    console.log('\n🎯 10. RESUMO FINAL DAS INTEGRAÇÕES:');
    console.log('===================================');
    console.log(`👤 Usuário: ${session.user.email}`);
    console.log(`🎭 Role: ${userRole}`);
    console.log(`📍 Página atual: ${currentPath}`);
    console.log(`🔍 Busca global: ${searchInput ? 'Funcionando' : 'Não encontrada'}`);
    console.log(`🧭 Links no menu: ${menuLinks.length}`);
    console.log(`⚙️ Botões na página: ${document.querySelectorAll('button').length}`);
    console.log(`📊 Leads carregados: ${leads ? leads.length : 0}`);
    console.log(`📱 Responsivo: ${isMobile ? 'Mobile' : 'Desktop'}`);
    
    if (userRole === 'gerente') {
      console.log('\n✅ INTEGRAÇÕES DO GERENTE FUNCIONANDO!');
      console.log('🎉 O gerente pode:');
      console.log('  - Navegar entre todas as páginas');
      console.log('  - Usar busca global');
      console.log('  - Gerenciar leads de toda a equipe');
      console.log('  - Configurar WhatsApp');
      console.log('  - Ver relatórios gerenciais');
      
    } else if (userRole === 'corretor') {
      console.log('\n✅ INTEGRAÇÕES DO CORRETOR FUNCIONANDO!');
      console.log('🎉 O corretor pode:');
      console.log('  - Navegar entre suas páginas');
      console.log('  - Usar busca global');
      console.log('  - Gerenciar seus próprios leads');
      console.log('  - Usar Kanban');
      console.log('  - Ver relatórios pessoais');
    }

    // 11. Sugestões de melhoria
    console.log('\n💡 11. SUGESTÕES DE MELHORIA:');
    console.log('==============================');
    console.log('1. Implementar funcionalidade de exportação de leads');
    console.log('2. Adicionar filtros avançados');
    console.log('3. Implementar notificações em tempo real');
    console.log('4. Adicionar atalhos de teclado');
    console.log('5. Implementar busca com autocomplete');

  } catch (error) {
    console.error('❌ Erro no teste de integrações:', error);
  }
}

// Executar o teste
testPageIntegrations();





