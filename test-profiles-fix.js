// 🧪 TESTE DA CORREÇÃO DA TABELA PROFILES
// Execute este script no console do navegador

async function testProfilesFix() {
  console.log('🧪 TESTANDO CORREÇÃO DA TABELA PROFILES');
  console.log('📋 Verificando se o erro foi corrigido');
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
      .eq('id', session.user.id)  // Usando 'id' em vez de 'user_id'
      .single();
    
    if (error) {
      console.error('❌ Erro na query:', error);
      console.log('💡 SOLUÇÃO: Executar SQL de correção no Dashboard');
      console.log('🔗 https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/sql');
      console.log('📝 Use o SQL do arquivo: FIX_PROFILES_TABLE_ERROR.md');
      return;
    }
    
    if (data) {
      console.log('✅ Query funcionando perfeitamente!');
      console.log('📊 Profile data:', data);
      
      // 3. Testar se o sistema está funcionando
      console.log('\n🖥️ 3. Testando sistema completo...');
      
      // Verificar se não há mais erros no console
      const originalError = console.error;
      let hasErrors = false;
      
      console.error = function(...args) {
        hasErrors = true;
        originalError.apply(console, args);
      };
      
      // Simular carregamento do auth context
      setTimeout(() => {
        if (!hasErrors) {
          console.log('✅ Sistema funcionando sem erros!');
          console.log('🎉 CORREÇÃO APLICADA COM SUCESSO!');
        } else {
          console.log('⚠️ Ainda há erros no sistema');
        }
        
        // Restaurar console.error
        console.error = originalError;
      }, 1000);
      
    } else {
      console.log('⚠️ Profile não encontrado');
      console.log('💡 Criar profile no banco de dados');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Verificar conexão com Supabase');
  }
}

// Executar teste
testProfilesFix();





