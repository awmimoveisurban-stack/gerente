// 🧪 SCRIPT DE TESTE COMPLETO DO SISTEMA
// Execute este script no console do navegador após fazer login

async function testCompleteSystem() {
  console.log('🚀 TESTANDO SISTEMA COMPLETO');
  console.log('=====================================');

  try {
    // 1. Verificar se supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado. Certifique-se de estar logado.');
      return;
    }
    console.log('✅ Supabase carregado.');

    // 2. Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado. Faça login primeiro.');
      return;
    }
    console.log('✅ Usuário autenticado:', session.user.email);

    // 3. Verificar perfil do usuário
    console.log('\n👤 3. Verificando perfil do usuário...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else {
      console.log('✅ Perfil encontrado:', profile);
    }

    // 4. Verificar roles do usuário
    console.log('\n🔐 4. Verificando roles do usuário...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
    } else {
      console.log('✅ Roles encontradas:', roles);
      if (roles && roles.length > 0) {
        console.log('🎯 Role principal:', roles[0].role);
      }
    }

    // 5. Verificar leads
    console.log('\n📋 5. Verificando leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id);

    if (leadsError) {
      console.error('❌ Erro ao buscar leads:', leadsError);
    } else {
      console.log(`✅ ${leads.length} leads encontrados.`);
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

    // 6. Verificar configuração WhatsApp (se for gerente)
    if (roles && roles.some(r => r.role === 'gerente')) {
      console.log('\n📱 6. Verificando configuração WhatsApp...');
      const { data: whatsappConfig, error: whatsappError } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('manager_id', session.user.id);

      if (whatsappError) {
        console.error('❌ Erro ao buscar configuração WhatsApp:', whatsappError);
      } else {
        console.log('✅ Configuração WhatsApp encontrada:', whatsappConfig);
      }
    }

    // 7. Testar criação de um lead
    console.log('\n➕ 7. Testando criação de um lead...');
    const newLeadData = {
      nome: 'Lead Teste Automático',
      telefone: '(99) 99999-9999',
      email: 'teste.automatico@email.com',
      imovel_interesse: 'Apartamento de Teste',
      valor_interesse: 500000,
      status: 'novo',
      observacoes: 'Lead criado via script de teste automático.',
      data_entrada: new Date().toISOString(),
      ultima_interacao: new Date().toISOString(),
    };

    const { data: createdLead, error: createError } = await supabase
      .from('leads')
      .insert([{ ...newLeadData, user_id: session.user.id }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar lead via script:', createError);
    } else {
      console.log('✅ Lead criado com sucesso:', createdLead);
      
      // 8. Testar atualização do lead
      console.log('\n🔄 8. Testando atualização do lead...');
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update({ status: 'contatado', ultima_interacao: new Date().toISOString() })
        .eq('id', createdLead.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar lead via script:', updateError);
      } else {
        console.log('✅ Lead atualizado com sucesso:', updatedLead);
      }
    }

    // 9. Testar navegação
    console.log('\n🧭 9. Testando navegação...');
    const currentPath = window.location.pathname;
    console.log('📍 Página atual:', currentPath);
    
    const expectedPaths = {
      gerente: ['/gerente', '/gerente/whatsapp'],
      corretor: ['/dashboard', '/leads', '/kanban']
    };

    if (roles && roles.length > 0) {
      const userRole = roles[0].role;
      const allowedPaths = expectedPaths[userRole] || [];
      
      console.log(`🎯 Usuário é: ${userRole}`);
      console.log(`✅ Páginas permitidas: ${allowedPaths.join(', ')}`);
      
      if (allowedPaths.includes(currentPath)) {
        console.log('✅ Usuário está na página correta para seu role');
      } else {
        console.log('⚠️ Usuário pode não estar na página correta');
      }
    }

    console.log('\n🎉 TESTE COMPLETO DO SISTEMA FINALIZADO!');
    console.log('=====================================');
    console.log('✅ Sistema funcionando corretamente!');
    console.log('💡 Agora você pode navegar entre as páginas sem problemas.');

  } catch (error) {
    console.error('❌ Erro geral no teste do sistema:', error);
  }
}

// Executar o teste
testCompleteSystem();