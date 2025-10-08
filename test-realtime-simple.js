// 🧪 TESTE SIMPLES DE REALTIME
// Execute este script no console do navegador

async function testRealtimeSimple() {
  console.log('🧪 TESTE SIMPLES DE REALTIME');
  console.log('============================');

  try {
    // 1. Verificar supabase
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado');
      return;
    }
    console.log('✅ Supabase carregado');

    // 2. Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado');
      return;
    }
    console.log('✅ Usuário autenticado:', session.user.email);

    // 3. Testar subscription simples
    console.log('\n📡 Testando subscription simples...');
    
    const channel = supabase
      .channel('test-simple')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('🔄 EVENTO RECEBIDO:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscription funcionando!');
          
          // Testar atualização
          setTimeout(() => {
            testUpdate();
          }, 1000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na subscription');
        }
      });

    // Função para testar atualização
    async function testUpdate() {
      try {
        console.log('\n🔄 Testando atualização...');
        
        // Buscar um lead para testar
        const { data: leads, error: fetchError } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', session.user.id)
          .limit(1);

        if (fetchError || !leads || leads.length === 0) {
          console.error('❌ Nenhum lead encontrado para testar');
          return;
        }

        const lead = leads[0];
        const newStatus = lead.status === 'novo' ? 'contatado' : 'novo';
        
        console.log(`🔄 Atualizando lead ${lead.nome} para status: ${newStatus}`);
        
        const { error } = await supabase
          .from('leads')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);

        if (error) {
          console.error('❌ Erro ao atualizar:', error);
        } else {
          console.log('✅ Lead atualizado com sucesso');
          console.log('🔄 Aguardando evento de realtime...');
        }
      } catch (error) {
        console.error('❌ Erro no teste:', error);
      }
    }

    // Limpar após 10 segundos
    setTimeout(() => {
      console.log('\n🧹 Limpando subscription...');
      supabase.removeChannel(channel);
      console.log('✅ Teste concluído!');
    }, 10000);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testRealtimeSimple();

console.log('\n📋 INSTRUÇÕES:');
console.log('1. Execute este script no console');
console.log('2. Observe se aparece "EVENTO RECEBIDO"');
console.log('3. Se aparecer, realtime está funcionando');
console.log('4. Se não aparecer, há problema na configuração');
