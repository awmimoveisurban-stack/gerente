// Verificar dados do usuário para gerar nome da instância
async function verificarDadosUsuario() {
  console.log('🔍 Verificando dados do usuário...');
  
  try {
    // Verificar se Supabase está disponível
    if (!window.supabase) {
      console.log('❌ Supabase client não encontrado');
      return;
    }
    
    // Obter dados do usuário
    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Erro ao obter usuário:', error);
      return;
    }
    
    if (!user) {
      console.log('❌ Usuário não encontrado - faça login primeiro');
      return;
    }
    
    console.log('\n📊 DADOS COMPLETOS DO USUÁRIO:');
    console.log('================================');
    console.log('ID completo:', user.id);
    console.log('Email:', user.email);
    console.log('Criado em:', user.created_at);
    console.log('Último login:', user.last_sign_in_at);
    
    console.log('\n👤 METADADOS DO USUÁRIO:');
    console.log('========================');
    console.log('user_metadata:', JSON.stringify(user.user_metadata, null, 2));
    
    console.log('\n🏷️ APPMETADADOS:');
    console.log('================');
    console.log('app_metadata:', JSON.stringify(user.app_metadata, null, 2));
    
    // Gerar nome da instância passo a passo
    console.log('\n🔧 GERAÇÃO DO NOME DA INSTÂNCIA:');
    console.log('=================================');
    
    // 1. ID curto
    const shortUserId = user.id.substring(0, 8);
    console.log('1. ID curto (8 chars):', shortUserId);
    
    // 2. Nome do usuário (múltiplas fontes)
    console.log('\n2. Fontes do nome (em ordem de prioridade):');
    
    const name1 = user.user_metadata?.name;
    console.log('   a) user_metadata.name:', name1 || '❌ Não definido');
    
    const name2 = user.user_metadata?.full_name;
    console.log('   b) user_metadata.full_name:', name2 || '❌ Não definido');
    
    const name3 = user.email?.split('@')[0];
    console.log('   c) email.split("@")[0]:', name3 || '❌ Não definido');
    
    // 3. Seleção do nome
    let userName = name1 || name2 || name3 || 'user';
    console.log('\n3. Nome selecionado (primeira opção disponível):', userName);
    
    // 4. Limpeza do nome
    console.log('\n4. Limpeza do nome:');
    console.log('   Original:', userName);
    
    userName = userName.toLowerCase();
    console.log('   Minúsculas:', userName);
    
    userName = userName.replace(/\s+/g, '-');
    console.log('   Espaços → hífens:', userName);
    
    userName = userName.replace(/[^a-z0-9-]/g, '');
    console.log('   Remove especiais:', userName);
    
    userName = userName.substring(0, 15);
    console.log('   Limita a 15 chars:', userName);
    
    // 5. Nome final da instância
    const instanceName = `empresa-whatsapp-${shortUserId}-${userName}`;
    console.log('\n5. NOME FINAL DA INSTÂNCIA:');
    console.log('============================');
    console.log('Resultado:', instanceName);
    console.log('Tamanho total:', instanceName.length, 'caracteres');
    
    // Verificar se está dentro dos limites
    if (instanceName.length > 50) {
      console.log('⚠️ ATENÇÃO: Nome muito longo! Pode causar problemas na Evolution API');
    } else {
      console.log('✅ Nome dentro dos limites aceitáveis');
    }
    
    console.log('\n🎯 EXEMPLO DE USO:');
    console.log('==================');
    console.log('Cada gerente terá sua própria instância:');
    console.log('- Gerente 1:', instanceName);
    console.log('- Gerente 2: empresa-whatsapp-a1b2c3d4-joao-silva');
    console.log('- Gerente 3: empresa-whatsapp-e5f6g7h8-maria-santos');
    
  } catch (error) {
    console.log('❌ Erro durante verificação:', error);
  }
}

// Executar verificação
verificarDadosUsuario();
