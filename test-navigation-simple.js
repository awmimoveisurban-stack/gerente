// 🧪 TESTE SIMPLES DE NAVEGAÇÃO
// Execute este script no CONSOLE do navegador (F12), NÃO no SQL Editor

function testNavigation() {
  console.log('🧪 TESTANDO NAVEGAÇÃO');
  console.log('📍 Página atual:', window.location.pathname);
  
  // Verificar se supabase está carregado
  if (typeof supabase === 'undefined') {
    console.error('❌ Supabase não está carregado');
    console.log('💡 Verificar se está logado e na página correta');
    return;
  }
  
  console.log('✅ Supabase carregado');
  
  // Verificar autenticação
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
      console.error('❌ Usuário não autenticado');
      console.log('💡 Fazer login em /auth');
      return;
    }
    
    console.log('✅ Usuário logado:', session.user.email);
    
    // Testar user_roles
    supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id)
      .then(({ data: roles, error: rolesError }) => {
        if (rolesError) {
          console.error('❌ Erro na tabela user_roles:', rolesError);
          console.log('💡 SOLUÇÃO: Executar SQL create-user-roles-table.sql');
          return;
        }
        
        if (roles && roles.length > 0) {
          console.log('✅ Roles encontradas:', roles);
          console.log('🎉 NAVEGAÇÃO FUNCIONANDO!');
          
          // Verificar página atual
          const currentPath = window.location.pathname;
          if (currentPath.includes('/gerente')) {
            console.log('✅ Página de gerente carregada');
          } else if (currentPath.includes('/dashboard')) {
            console.log('✅ Página de corretor carregada');
          } else {
            console.log('📍 Página:', currentPath);
          }
          
        } else {
          console.log('⚠️ Nenhuma role encontrada');
          console.log('💡 Executar SQL para inserir role');
        }
      });
  });
}

// Executar teste
testNavigation();





