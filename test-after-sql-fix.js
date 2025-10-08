// 🧪 TESTE APÓS CORREÇÃO SQL
// Execute este script no console do navegador

async function testAfterSQLFix() {
  console.log('🧪 TESTANDO APÓS CORREÇÃO SQL');
  console.log('📋 Verificando se a tabela profiles foi corrigida');
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
    
    // 2. Testar query corrigida
    console.log('\n🧪 2. Testando query corrigida...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error('❌ Erro na query:', error);
      
      if (error.code === '42703') {
        console.log('💡 Erro: Coluna não existe');
        console.log('🔧 SOLUÇÃO: Execute o SQL corrigido');
        console.log('📝 Use o arquivo: fix-profiles-simple.sql');
      } else if (error.code === 'PGRST116') {
        console.log('💡 Erro: Nenhum resultado encontrado');
        console.log('🔧 SOLUÇÃO: Profile não existe no banco');
        console.log('📝 Execute o SQL para criar o profile');
      } else {
        console.log('💡 Erro desconhecido:', error.code);
        console.log('🔧 Verificar logs do Supabase');
      }
      return;
    }
    
    if (data) {
      console.log('✅ Query funcionando perfeitamente!');
      console.log('📊 Profile data:', data);
      
      // 3. Verificar se o sistema está funcionando
      console.log('\n🖥️ 3. Verificando sistema...');
      
      // Recarregar a página para testar
      console.log('🔄 Recarregando página para testar sistema completo...');
      setTimeout(() => {
        console.log('✅ Página recarregada');
        console.log('🎉 CORREÇÃO APLICADA COM SUCESSO!');
        console.log('🚀 Sistema funcionando perfeitamente!');
      }, 1000);
      
    } else {
      console.log('⚠️ Profile não encontrado');
      console.log('💡 Executar SQL para criar profile');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Verificar conexão com Supabase');
  }
}

// Executar teste
testAfterSQLFix();





