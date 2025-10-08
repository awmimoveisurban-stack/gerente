import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bxtuynqauqasigcbocbm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o'
);

async function testAuthentication() {
  console.log('🧪 Testando autenticação após correção...');
  console.log('=====================================');
  
  try {
    // Testar login corretor
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
    
    console.log('-------------------------------------');
    
    // Testar login gerente
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
    
    console.log('=====================================');
    
    // Verificar usuários no banco
    console.log('🔍 Verificando usuários no banco...');
    const { data: allUsers, error: allError } = await supabase
      .from('profiles')
      .select('*');
    
    if (allError) {
      console.log('❌ Erro ao consultar profiles:', allError.message);
    } else {
      console.log('📊 Total de usuários no banco:', allUsers.length);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.full_name})`);
      });
    }
    
    // Verificar roles
    const { data: allRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (rolesError) {
      console.log('❌ Erro ao consultar roles:', rolesError.message);
    } else {
      console.log('🎭 Total de roles no banco:', allRoles.length);
      allRoles.forEach((role, index) => {
        console.log(`   ${index + 1}. ${role.user_id} -> ${role.role}`);
      });
    }
    
  } catch (error) {
    console.log('💥 Erro inesperado:', error.message);
  }
}

testAuthentication();





