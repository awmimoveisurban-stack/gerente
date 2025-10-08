// Teste da nova nomenclatura de instâncias WhatsApp
async function testNovaNomenclatura() {
  console.log('🎯 Testando nova nomenclatura de instâncias...');
  
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
    
    console.log('\n📊 DADOS DO USUÁRIO:');
    console.log('=====================');
    console.log('Email:', user.email);
    console.log('ID:', user.id);
    
    // Gerar nome da instância com nova nomenclatura
    console.log('\n🔧 NOVA NOMENCLATURA:');
    console.log('=====================');
    
    const userEmail = user.email;
    if (!userEmail) {
      console.log('❌ Email não encontrado');
      return;
    }
    
    // Processo de limpeza do email
    console.log('1. Email original:', userEmail);
    
    const cleanEmail = userEmail
      .toLowerCase()
      .replace('@', '-')
      .replace(/\./g, '-')
      .replace(/[^a-z0-9-]/g, '') // Remove special chars except hyphens
      .substring(0, 40); // Limit length
    
    console.log('2. Email limpo:', cleanEmail);
    
    const instanceName = `Usuario-${cleanEmail}`;
    console.log('3. Nome da instância:', instanceName);
    console.log('4. Tamanho:', instanceName.length, 'caracteres');
    
    // Verificar compatibilidade
    console.log('\n✅ VERIFICAÇÃO DE COMPATIBILIDADE:');
    console.log('==================================');
    
    if (instanceName.length > 50) {
      console.log('⚠️ ATENÇÃO: Nome muito longo para Evolution API');
    } else {
      console.log('✅ Nome dentro dos limites aceitáveis');
    }
    
    if (/[^a-z0-9-]/.test(instanceName)) {
      console.log('⚠️ ATENÇÃO: Contém caracteres especiais');
    } else {
      console.log('✅ Contém apenas caracteres permitidos (a-z, 0-9, -)');
    }
    
    // Exemplos para outros usuários
    console.log('\n🎯 EXEMPLOS DE NOMENCLATURA:');
    console.log('=============================');
    console.log('Usuário atual:', instanceName);
    console.log('Exemplo 1: gerente@imobiliaria.com → Usuario-gerente-imobiliaria-com');
    console.log('Exemplo 2: joao@empresa.com.br → Usuario-joao-empresa-com-br');
    console.log('Exemplo 3: maria.silva@teste.org → Usuario-maria-silva-teste-org');
    
    // Testar criação de instância (simulação)
    console.log('\n🧪 SIMULAÇÃO DE CRIAÇÃO:');
    console.log('========================');
    console.log('Nome da instância que seria criada:', instanceName);
    console.log('Status: Pronto para criar instância individual');
    
    return instanceName;
    
  } catch (error) {
    console.log('❌ Erro durante teste:', error);
  }
}

// Executar teste
testNovaNomenclatura();
