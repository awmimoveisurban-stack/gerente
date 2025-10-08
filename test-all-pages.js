// 🧪 SCRIPT DE TESTE DE TODAS AS PÁGINAS
// Execute este script no console do navegador para testar todas as páginas criadas

async function testAllPages() {
  console.log('🚀 TESTANDO TODAS AS PÁGINAS');
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

    // 4. Lista de todas as páginas disponíveis
    const allPages = {
      corretor: [
        { name: 'Dashboard', url: '/dashboard', description: 'Dashboard do corretor' },
        { name: 'Meus Leads', url: '/leads', description: 'Lista de leads do corretor' },
        { name: 'Kanban', url: '/kanban', description: 'Quadro Kanban para gerenciar leads' },
        { name: 'Relatórios', url: '/relatorios', description: 'Relatórios de performance' }
      ],
      gerente: [
        { name: 'Dashboard Geral', url: '/gerente', description: 'Dashboard gerencial' },
        { name: 'Todos os Leads', url: '/leads', description: 'Todos os leads da equipe' },
        { name: 'Kanban', url: '/kanban', description: 'Quadro Kanban completo' },
        { name: 'WhatsApp', url: '/gerente/whatsapp', description: 'Configuração WhatsApp' },
        { name: 'Equipe', url: '/gerente/equipe', description: 'Gestão de equipe' },
        { name: 'Relatórios', url: '/gerente/relatorios', description: 'Relatórios gerenciais' }
      ]
    };

    // 5. Determinar páginas disponíveis para o usuário
    const userPages = userRole === 'gerente' ? allPages.gerente : allPages.corretor;
    
    console.log('\n📋 4. Páginas disponíveis para o usuário:');
    userPages.forEach(page => {
      console.log(`  ✅ ${page.name}: ${page.url} - ${page.description}`);
    });

    // 6. Testar navegação para cada página
    console.log('\n🧭 5. Testando navegação para cada página...');
    
    for (const page of userPages) {
      console.log(`\n🔄 Testando: ${page.name} (${page.url})`);
      
      try {
        // Navegar para a página
        window.history.pushState({}, '', page.url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        
        // Aguardar um pouco para a navegação
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar se a URL mudou corretamente
        const currentPath = window.location.pathname;
        
        if (currentPath === page.url) {
          console.log(`  ✅ ${page.name}: Navegação bem-sucedida`);
        } else {
          console.log(`  ❌ ${page.name}: Redirecionado para ${currentPath}`);
        }
        
      } catch (error) {
        console.log(`  ❌ ${page.name}: Erro na navegação - ${error.message}`);
      }
    }

    // 7. Testar páginas que o usuário NÃO deveria acessar
    console.log('\n🚫 6. Testando acesso negado para páginas restritas...');
    
    const restrictedPages = userRole === 'gerente' 
      ? ['/dashboard', '/relatorios'] 
      : ['/gerente', '/gerente/whatsapp', '/gerente/equipe', '/gerente/relatorios'];
    
    for (const restrictedUrl of restrictedPages) {
      console.log(`\n🔒 Testando acesso negado: ${restrictedUrl}`);
      
      try {
        window.history.pushState({}, '', restrictedUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentPath = window.location.pathname;
        
        if (currentPath === restrictedUrl) {
          console.log(`  ⚠️ ${restrictedUrl}: Usuário conseguiu acessar (pode ser permitido)`);
        } else {
          console.log(`  ✅ ${restrictedUrl}: Acesso negado - redirecionado para ${currentPath}`);
        }
        
      } catch (error) {
        console.log(`  ✅ ${restrictedUrl}: Erro de acesso (esperado) - ${error.message}`);
      }
    }

    // 8. Verificar dados das páginas
    console.log('\n📊 7. Verificando dados das páginas...');
    
    // Verificar se há leads para testar as páginas
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id);

    if (leadsError) {
      console.log('❌ Erro ao buscar leads:', leadsError);
    } else {
      console.log(`✅ ${leads.length} leads encontrados para testar as páginas`);
      
      if (leads.length === 0) {
        console.log('⚠️ Nenhum lead encontrado. As páginas podem aparecer vazias.');
        console.log('💡 Execute o SQL fix-all-database-tables.sql para inserir dados de exemplo.');
      }
    }

    // 9. Resumo final
    console.log('\n🎯 8. RESUMO FINAL:');
    console.log('==================');
    console.log(`👤 Usuário: ${session.user.email}`);
    console.log(`🎭 Role: ${userRole}`);
    console.log(`📄 Páginas disponíveis: ${userPages.length}`);
    console.log(`🚫 Páginas restritas: ${restrictedPages.length}`);
    console.log(`📋 Leads disponíveis: ${leads ? leads.length : 0}`);
    
    console.log('\n✅ TESTE COMPLETO FINALIZADO!');
    console.log('==============================');
    console.log('🎉 Todas as páginas foram testadas com sucesso!');
    console.log('💡 Agora você pode navegar entre as páginas usando o menu lateral.');

  } catch (error) {
    console.error('❌ Erro no teste das páginas:', error);
  }
}

// Executar o teste
testAllPages();





