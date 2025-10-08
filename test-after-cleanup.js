import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bxtuynqauqasigcbocbm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o'
);

async function testAfterCleanup() {
  console.log('🧪 TESTANDO APÓS LIMPEZA E RECRIAÇÃO...');
  console.log('==========================================');
  
  try {
    // 1. Verificar dados no banco
    console.log('🔍 Verificando dados no banco...');
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.log('❌ Erro ao consultar profiles:', profilesError.message);
    } else {
      console.log('📊 Profiles encontrados:', profilesData.length);
      profilesData.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} (${profile.full_name}) - ID: ${profile.id}`);
      });
    }
    
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (rolesError) {
      console.log('❌ Erro ao consultar roles:', rolesError.message);
    } else {
      console.log('🎭 Roles encontrados:', rolesData.length);
      rolesData.forEach((role, index) => {
        console.log(`   ${index + 1}. ${role.role} - User ID: ${role.user_id}`);
      });
    }
    
    console.log('------------------------------------------');
    
    // 2. Testar login corretor
    console.log('👤 Testando login do corretor...');
    const { data: corretorData, error: corretorError } = await supabase.auth.signInWithPassword({
      email: 'corretor@imobiliaria.com',
      password: 'corretor123'
    });
    
    if (corretorError) {
      console.log('❌ Erro no login do corretor:');
      console.log('   Status:', corretorError.status);
      console.log('   Message:', corretorError.message);
      console.log('   Code:', corretorError.code);
    } else {
      console.log('✅ Login do corretor bem-sucedido!');
      console.log('   Email:', corretorData.user?.email);
      console.log('   ID:', corretorData.user?.id);
      console.log('   Confirmed:', corretorData.user?.email_confirmed_at ? 'Sim' : 'Não');
    }
    
    console.log('------------------------------------------');
    
    // 3. Testar login gerente
    console.log('👑 Testando login do gerente...');
    const { data: gerenteData, error: gerenteError } = await supabase.auth.signInWithPassword({
      email: 'gerente@imobiliaria.com',
      password: 'gerente123'
    });
    
    if (gerenteError) {
      console.log('❌ Erro no login do gerente:');
      console.log('   Status:', gerenteError.status);
      console.log('   Message:', gerenteError.message);
      console.log('   Code:', gerenteError.code);
    } else {
      console.log('✅ Login do gerente bem-sucedido!');
      console.log('   Email:', gerenteData.user?.email);
      console.log('   ID:', gerenteData.user?.id);
      console.log('   Confirmed:', gerenteData.user?.email_confirmed_at ? 'Sim' : 'Não');
    }
    
    console.log('==========================================');
    
    // 4. Resumo final
    const totalProfiles = profilesData?.length || 0;
    const totalRoles = rolesData?.length || 0;
    const corretorLogin = !corretorError;
    const gerenteLogin = !gerenteError;
    
    console.log('📋 RESUMO FINAL:');
    console.log(`   Profiles: ${totalProfiles}`);
    console.log(`   Roles: ${totalRoles}`);
    console.log(`   Login Corretor: ${corretorLogin ? '✅' : '❌'}`);
    console.log(`   Login Gerente: ${gerenteLogin ? '✅' : '❌'}`);
    
    if (totalProfiles >= 2 && totalRoles >= 2 && corretorLogin && gerenteLogin) {
      console.log('🎉 SUCESSO TOTAL! Sistema funcionando perfeitamente!');
    } else {
      console.log('⚠️  Ainda há problemas. Verifique os erros acima.');
    }
    
  } catch (error) {
    console.log('💥 Erro inesperado:', error.message);
  }
}

testAfterCleanup();





