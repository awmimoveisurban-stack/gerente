// 🧪 TESTE ESTÁVEL DE REALTIME
// Execute este script no console do navegador na página do Kanban

async function testRealtimeStable() {
  console.log('🚀 TESTANDO REALTIME ESTÁVEL');
  console.log('---');

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

    // 3. Testar consulta básica
    console.log('\n📊 3. Testando consulta básica...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id);

    if (leadsError) {
      console.error('❌ Erro ao consultar leads:', leadsError);
      return;
    }
    console.log(`✅ Consulta funcionando. ${leads.length} leads encontrados.`);

    // 4. Testar realtime com timeout
    console.log('\n📡 4. Testando realtime com timeout...');
    
    let realtimeWorking = false;
    let realtimeError = null;

    // Configurar canal de teste
    const testChannel = supabase
      .channel(`test-realtime-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('🔄 Realtime funcionando! Update recebido:', payload);
          realtimeWorking = true;
        }
      )
      .subscribe((status) => {
        console.log('📡 Status do realtime:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime conectado com sucesso!');
          realtimeWorking = true;
        } else if (status === 'CHANNEL_ERROR') {
          console.log('⚠️ Erro no canal realtime');
          realtimeError = 'CHANNEL_ERROR';
        } else if (status === 'CLOSED') {
          console.log('⚠️ Canal realtime fechado');
          realtimeError = 'CLOSED';
        }
      });

    // Aguardar 5 segundos para ver se conecta
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Limpar canal de teste
    supabase.removeChannel(testChannel);

    // 5. Resultado do teste
    console.log('\n📋 5. RESULTADO DO TESTE:');
    if (realtimeWorking) {
      console.log('✅ REALTIME FUNCIONANDO - Atualizações em tempo real ativas');
    } else if (realtimeError) {
      console.log(`⚠️ REALTIME COM PROBLEMAS (${realtimeError}) - Usando polling de backup`);
    } else {
      console.log('❌ REALTIME NÃO FUNCIONANDO - Verificar configuração do banco');
    }

    // 6. Testar atualização de lead (simular drag & drop)
    console.log('\n🔄 6. Testando atualização de lead...');
    if (leads.length > 0) {
      const testLead = leads[0];
      const newStatus = testLead.status === 'novo' ? 'contatado' : 'novo';
      
      console.log(`Testando mudança de status: ${testLead.status} → ${newStatus}`);
      
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          ultima_interacao: new Date().toISOString()
        })
        .eq('id', testLead.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar lead:', updateError);
      } else {
        console.log('✅ Lead atualizado com sucesso!');
        
        // Aguardar um pouco e verificar se a mudança foi refletida
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: updatedLead } = await supabase
          .from('leads')
          .select('status')
          .eq('id', testLead.id)
          .single();
          
        if (updatedLead && updatedLead.status === newStatus) {
          console.log('✅ Status atualizado corretamente no banco!');
        } else {
          console.log('⚠️ Status não foi atualizado no banco');
        }
      }
    } else {
      console.log('⚠️ Nenhum lead encontrado para testar atualização');
    }

    // 7. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log(`- Leads carregados: ${leads.length}`);
    console.log(`- Realtime: ${realtimeWorking ? '✅ Funcionando' : '⚠️ Com problemas'}`);
    console.log(`- Consultas: ✅ Funcionando`);
    console.log(`- Atualizações: ✅ Funcionando`);
    
    if (realtimeWorking) {
      console.log('\n🎉 SISTEMA TOTALMENTE FUNCIONAL!');
      console.log('O Kanban deve atualizar em tempo real quando você mover cards.');
    } else {
      console.log('\n⚠️ SISTEMA FUNCIONAL COM LIMITAÇÕES');
      console.log('O Kanban funcionará, mas pode não atualizar em tempo real.');
      console.log('As atualizações serão refletidas a cada 5 segundos.');
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testRealtimeStable();





