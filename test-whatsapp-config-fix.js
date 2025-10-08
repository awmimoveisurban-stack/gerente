// 🧪 TESTE DA CORREÇÃO DA TABELA WHATSAPP_CONFIG
// Execute este script no console do navegador

async function testWhatsAppConfigFix() {
  console.log('🧪 TESTANDO CORREÇÃO DA TABELA WHATSAPP_CONFIG');
  console.log('📋 Verificando se o erro 406 foi corrigido');
  console.log('---');
  
  try {
    // 1. Verificar autenticação
    console.log('🔐 1. Verificando autenticação...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Usuário não autenticado');
      console.log('💡 Faça login primeiro');
      return;
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);
    console.log('✅ User ID:', session.user.id);
    
    // 2. Testar query whatsapp_config
    console.log('\n🧪 2. Testando query whatsapp_config...');
    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('instance_name', 'empresa-whatsapp');
    
    if (error) {
      console.error('❌ Erro na query whatsapp_config:', error);
      
      if (error.code === 'PGRST301') {
        console.log('💡 Erro: Tabela não existe');
        console.log('🔧 SOLUÇÃO: Execute o SQL de correção');
        console.log('📝 Use o arquivo: fix-whatsapp-config-table.sql');
      } else if (error.code === 'PGRST116') {
        console.log('💡 Erro: Nenhum resultado encontrado');
        console.log('🔧 SOLUÇÃO: Criar configuração inicial');
        console.log('📝 Execute o SQL para criar a configuração');
      } else {
        console.log('💡 Erro desconhecido:', error.code);
        console.log('🔧 Verificar logs do Supabase');
      }
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Query whatsapp_config funcionando!');
      console.log('📊 Configuração encontrada:', data[0]);
      
      // 3. Testar Edge Function se a tabela estiver OK
      console.log('\n🔗 3. Testando Edge Function...');
      
      try {
        const testResponse = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'test'
          })
        });
        
        console.log('📊 Status Edge Function:', testResponse.status);
        const testData = await testResponse.text();
        console.log('📊 Resposta Edge Function:', testData);
        
        if (testResponse.ok) {
          console.log('✅ Edge Function funcionando!');
          console.log('🎉 SISTEMA WHATSAPP PRONTO!');
          
          // Testar conexão WhatsApp
          console.log('\n📱 4. Testando conexão WhatsApp...');
          const connectResponse = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'connect',
              instanceName: 'empresa-whatsapp'
            })
          });
          
          console.log('📊 Status conexão:', connectResponse.status);
          const connectData = await connectResponse.text();
          console.log('📊 Dados conexão:', connectData);
          
          if (connectResponse.ok) {
            console.log('✅ Conexão WhatsApp funcionando!');
            console.log('🎉 SISTEMA 100% FUNCIONAL!');
          } else {
            console.log('⚠️ Problema na conexão WhatsApp');
            console.log('💡 Verificar Evolution API configuration');
          }
        } else {
          console.log('⚠️ Edge Function com problema');
          console.log('💡 Verificar se foi criada no Dashboard');
        }
        
      } catch (edgeError) {
        console.log('⚠️ Erro ao testar Edge Function:', edgeError.message);
        console.log('💡 Verificar se Edge Function existe');
      }
      
    } else {
      console.log('⚠️ Nenhuma configuração encontrada');
      console.log('💡 Executar SQL para criar configuração inicial');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Verificar conexão com Supabase');
  }
}

// Executar teste
testWhatsAppConfigFix();





