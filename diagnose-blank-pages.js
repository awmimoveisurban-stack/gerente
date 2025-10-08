// 🔍 SCRIPT DE DIAGNÓSTICO PARA PÁGINAS EM BRANCO
// Execute este script no console do navegador para identificar problemas

async function diagnoseBlankPages() {
  console.log('🔍 DIAGNÓSTICO DE PÁGINAS EM BRANCO');
  console.log('===================================');

  try {
    // 1. Verificar erros no console
    console.log('\n1. 📋 VERIFICANDO ERROS NO CONSOLE...');
    
    // Capturar erros JavaScript
    const originalError = console.error;
    const errors = [];
    console.error = function(...args) {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };

    // 2. Verificar se supabase está carregado
    console.log('\n2. 🗄️ VERIFICANDO SUPABASE...');
    
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está carregado!');
      console.log('💡 Solução: Verifique se o script está sendo carregado corretamente.');
      return;
    }
    console.log('✅ Supabase carregado');

    // 3. Verificar autenticação
    console.log('\n3. 🔐 VERIFICANDO AUTENTICAÇÃO...');
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Erro na autenticação:', authError);
      console.log('💡 Solução: Verifique as configurações do Supabase.');
      return;
    }

    if (!session) {
      console.log('⚠️ Usuário não autenticado');
      console.log('💡 Solução: Faça login primeiro.');
      return;
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);

    // 4. Verificar tabelas do banco
    console.log('\n4. 🗂️ VERIFICANDO TABELAS DO BANCO...');
    
    const tables = ['profiles', 'user_roles', 'leads'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.error(`❌ Erro na tabela ${table}:`, error);
          console.log(`💡 Solução: Verifique se a tabela ${table} existe e tem as políticas RLS corretas.`);
        } else {
          console.log(`✅ Tabela ${table} funcionando`);
        }
      } catch (err) {
        console.error(`❌ Erro ao acessar tabela ${table}:`, err);
      }
    }

    // 5. Verificar roles do usuário
    console.log('\n5. 👤 VERIFICANDO ROLES DO USUÁRIO...');
    
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
      console.log('💡 Solução: Execute o SQL para criar a tabela user_roles e inserir o role do usuário.');
    } else if (!roles || roles.length === 0) {
      console.error('❌ Usuário não tem roles definidos!');
      console.log('💡 Solução: Execute o SQL para inserir o role do usuário na tabela user_roles.');
    } else {
      console.log('✅ Roles encontrados:', roles);
    }

    // 6. Verificar perfil do usuário
    console.log('\n6. 📄 VERIFICANDO PERFIL DO USUÁRIO...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      console.log('💡 Solução: Execute o SQL para criar/atualizar a tabela profiles.');
    } else {
      console.log('✅ Perfil encontrado:', profile);
    }

    // 7. Verificar elementos da página
    console.log('\n7. 🎨 VERIFICANDO ELEMENTOS DA PÁGINA...');
    
    const currentPath = window.location.pathname;
    console.log('📍 Página atual:', currentPath);

    // Verificar se há conteúdo na página
    const bodyContent = document.body.textContent?.trim();
    if (!bodyContent || bodyContent.length < 100) {
      console.error('❌ Página parece estar em branco ou com pouco conteúdo!');
      console.log('💡 Solução: Verifique se há erros JavaScript que impedem o carregamento.');
    } else {
      console.log('✅ Página tem conteúdo');
    }

    // Verificar elementos específicos
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    const header = document.querySelector('header');
    const main = document.querySelector('main');

    console.log(`📋 Sidebar: ${sidebar ? 'Encontrada' : 'Não encontrada'}`);
    console.log(`📋 Header: ${header ? 'Encontrado' : 'Não encontrado'}`);
    console.log(`📋 Main: ${main ? 'Encontrado' : 'Não encontrado'}`);

    // 8. Verificar React DevTools
    console.log('\n8. ⚛️ VERIFICANDO REACT...');
    
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools detectado');
      
      // Verificar se há componentes React renderizados
      const reactRoot = document.querySelector('#root');
      if (reactRoot && reactRoot.children.length > 0) {
        console.log('✅ React está renderizando componentes');
      } else {
        console.error('❌ React não está renderizando componentes!');
        console.log('💡 Solução: Verifique se há erros no código React.');
      }
    } else {
      console.log('⚠️ React DevTools não detectado (normal em produção)');
    }

    // 9. Verificar network requests
    console.log('\n9. 🌐 VERIFICANDO REQUESTS DE REDE...');
    
    // Verificar se há requests falhando
    const failedRequests = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('supabase'))
      .filter(entry => entry.responseEnd === 0);

    if (failedRequests.length > 0) {
      console.error('❌ Requests falhando:', failedRequests);
      console.log('💡 Solução: Verifique a conexão com o Supabase.');
    } else {
      console.log('✅ Requests de rede funcionando');
    }

    // 10. Resumo e soluções
    console.log('\n10. 📊 RESUMO E SOLUÇÕES:');
    console.log('========================');
    
    if (errors.length > 0) {
      console.log('❌ ERROS ENCONTRADOS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
    console.log('1. Se há erros de tabela: Execute os scripts SQL no Supabase Dashboard');
    console.log('2. Se há erros de role: Execute o script create-user-roles-table.sql');
    console.log('3. Se há erros de perfil: Execute o script fix-profiles-table.sql');
    console.log('4. Se a página está em branco: Verifique o console para erros JavaScript');
    console.log('5. Se há problemas de rede: Verifique as configurações do Supabase');

    // Restaurar console.error original
    console.error = originalError;

  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
  }
}

// Executar o diagnóstico
diagnoseBlankPages();





