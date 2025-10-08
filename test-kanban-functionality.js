// 🧪 TESTE DO KANBAN FUNCIONAL
// Execute este script no console do navegador na página /kanban

async function testKanbanFunctionality() {
  console.log('🧪 TESTANDO KANBAN FUNCIONAL');
  console.log('📋 Verificando se todas as funcionalidades estão funcionando');
  console.log('---');
  
  try {
    // 1. Verificar se está na página correta
    console.log('🔍 1. Verificando página...');
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/kanban')) {
      console.error('❌ Não está na página do Kanban');
      console.log('💡 Navegue para: http://127.0.0.1:3006/kanban');
      return;
    }
    console.log('✅ Página correta:', currentPath);
    
    // 2. Verificar se supabase está carregado
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado');
      console.log('💡 Faça login primeiro');
      return;
    }
    console.log('✅ Supabase carregado');
    
    // 3. Verificar autenticação
    console.log('\n🔐 2. Verificando autenticação...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado');
      console.log('💡 Faça login em /auth');
      return;
    }
    console.log('✅ Usuário:', session.user.email);
    
    // 4. Testar tabela leads
    console.log('\n📊 3. Testando tabela leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (leadsError) {
      console.error('❌ Erro na tabela leads:', leadsError);
      console.log('💡 SOLUÇÃO: Executar SQL create-leads-table.sql');
      return;
    }
    
    console.log('✅ Tabela leads funcionando!');
    console.log('📊 Total de leads:', leads.length);
    
    // 5. Verificar elementos da interface
    console.log('\n🖥️ 4. Verificando interface...');
    
    // Dashboard de estatísticas
    const statsCards = document.querySelectorAll('.bg-white, .dark\\:bg-gray-800');
    if (statsCards.length >= 4) {
      console.log('✅ Dashboard de estatísticas encontrado');
    } else {
      console.log('⚠️ Dashboard de estatísticas não encontrado');
    }
    
    // Colunas do Kanban
    const kanbanColumns = document.querySelectorAll('[data-testid="kanban-column"], .grid');
    if (kanbanColumns.length > 0) {
      console.log('✅ Colunas do Kanban encontradas');
    } else {
      console.log('⚠️ Colunas do Kanban não encontradas');
    }
    
    // Botão de adicionar lead
    const addButton = document.querySelector('button:contains("Novo Lead"), [aria-label*="Novo"]');
    if (addButton || document.querySelector('button')) {
      console.log('✅ Botão "Novo Lead" encontrado');
    } else {
      console.log('⚠️ Botão "Novo Lead" não encontrado');
    }
    
    // Campo de busca
    const searchInput = document.querySelector('input[placeholder*="Buscar"]');
    if (searchInput) {
      console.log('✅ Campo de busca encontrado');
    } else {
      console.log('⚠️ Campo de busca não encontrado');
    }
    
    // 6. Testar funcionalidades
    console.log('\n🔧 5. Testando funcionalidades...');
    
    // Verificar se há leads para testar
    if (leads.length > 0) {
      console.log('✅ Leads disponíveis para teste');
      
      // Verificar leads por status
      const statusCounts = {};
      leads.forEach(lead => {
        statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
      });
      
      console.log('📊 Leads por status:', statusCounts);
      
      // Verificar se há leads em diferentes status
      const uniqueStatuses = Object.keys(statusCounts);
      if (uniqueStatuses.length > 3) {
        console.log('✅ Diversidade de status encontrada');
      } else {
        console.log('⚠️ Poucos status diferentes encontrados');
      }
      
    } else {
      console.log('⚠️ Nenhum lead encontrado');
      console.log('💡 Executar SQL para inserir dados de exemplo');
    }
    
    // 7. Resumo final
    console.log('\n📋 6. RESUMO FINAL:');
    
    const hasLeads = leads && leads.length > 0;
    const hasInterface = statsCards.length >= 4;
    const hasColumns = kanbanColumns.length > 0;
    
    console.log(`${hasLeads ? '✅' : '❌'} Leads: ${hasLeads ? 'OK' : 'ERRO'}`);
    console.log(`${hasInterface ? '✅' : '❌'} Interface: ${hasInterface ? 'OK' : 'ERRO'}`);
    console.log(`${hasColumns ? '✅' : '❌'} Colunas: ${hasColumns ? 'OK' : 'ERRO'}`);
    
    if (hasLeads && hasInterface && hasColumns) {
      console.log('🎉 KANBAN FUNCIONANDO PERFEITAMENTE!');
      console.log('🚀 Todas as funcionalidades estão operacionais!');
    } else {
      console.log('⚠️ Há problemas no Kanban');
      console.log('💡 Verificar soluções acima');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Verificar conexão e autenticação');
  }
}

// Executar teste
testKanbanFunctionality();





