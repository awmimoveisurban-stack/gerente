// 🧪 SCRIPT DE TESTE PARA REALTIME DO KANBAN
// Execute este script no console do navegador na página do Kanban

async function testKanbanRealtime() {
  console.log('🧪 TESTANDO REALTIME DO KANBAN');
  console.log('================================');

  try {
    // 1. Verificar se supabase está disponível
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

    // 3. Verificar se há leads para testar
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', session.user.id)
      .limit(5);

    if (leadsError) {
      console.error('❌ Erro ao buscar leads:', leadsError);
      return;
    }

    if (!leads || leads.length === 0) {
      console.error('❌ Nenhum lead encontrado para testar');
      return;
    }

    console.log('✅ Leads encontrados:', leads.length);
    console.log('📋 Primeiro lead:', leads[0]);

    // 4. Configurar realtime subscription para teste
    console.log('\n📡 Configurando realtime subscription...');
    
    const channel = supabase
      .channel('test-kanban-realtime', {
        config: {
          broadcast: { self: true },
          presence: { key: session.user.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('🔄 REALTIME UPDATE RECEBIDO:', payload);
          console.log('📊 Evento:', payload.eventType);
          console.log('📋 Dados:', payload.new || payload.old);
        }
      )
      .on('system', {}, (status) => {
        console.log('📡 Status do sistema:', status);
      })
      .subscribe((status) => {
        console.log('📡 Status da subscription:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscription ativa!');
          
          // 5. Testar atualização de status
          console.log('\n🔄 Testando atualização de status...');
          testStatusUpdate(leads[0]);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na subscription');
        }
      });

    // Função para testar atualização de status
    async function testStatusUpdate(lead) {
      try {
        const currentStatus = lead.status;
        const newStatus = currentStatus === 'novo' ? 'contatado' : 'novo';
        
        console.log(`🔄 Atualizando lead ${lead.nome} de "${currentStatus}" para "${newStatus}"`);
        
        const { data, error } = await supabase
          .from('leads')
          .update({ 
            status: newStatus,
            ultima_interacao: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar lead:', error);
        } else {
          console.log('✅ Lead atualizado com sucesso:', data);
          console.log('🔄 Aguardando evento de realtime...');
          
          // Aguardar 3 segundos para ver se o evento chega
          setTimeout(() => {
            console.log('⏰ Tempo esgotado. Verificando se o realtime funcionou...');
            
            // Verificar se o lead foi atualizado
            supabase
              .from('leads')
              .select('*')
              .eq('id', lead.id)
              .single()
              .then(({ data: updatedLead, error: fetchError }) => {
                if (fetchError) {
                  console.error('❌ Erro ao verificar lead atualizado:', fetchError);
                } else {
                  console.log('📋 Lead atualizado:', updatedLead);
                  if (updatedLead.status === newStatus) {
                    console.log('✅ Status atualizado corretamente!');
                  } else {
                    console.log('❌ Status não foi atualizado');
                  }
                }
              });
          }, 3000);
        }
      } catch (error) {
        console.error('❌ Erro no teste:', error);
      }
    }

    // 6. Limpar subscription após 10 segundos
    setTimeout(() => {
      console.log('\n🧹 Limpando subscription de teste...');
      supabase.removeChannel(channel);
      console.log('✅ Teste concluído!');
    }, 10000);

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar o teste
testKanbanRealtime();

// Instruções para o usuário
console.log('\n📋 INSTRUÇÕES:');
console.log('1. Execute este script na página do Kanban');
console.log('2. Observe os logs no console');
console.log('3. Se vir "REALTIME UPDATE RECEBIDO", o realtime está funcionando');
console.log('4. Se não vir, há problema na configuração');
