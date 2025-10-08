import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bxtuynqauqasigcbocbm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o'
);

async function forceCreateUsers() {
  console.log('🚀 Forçando criação de usuários...');
  console.log('=====================================');
  
  // Tentar criar via signUp com diferentes configurações
  const users = [
    { email: 'corretor@imobiliaria.com', password: 'corretor123', role: 'corretor', name: 'Corretor Teste' },
    { email: 'gerente@imobiliaria.com', password: 'gerente123', role: 'gerente', name: 'Gerente Teste' }
  ];
  
  for (const user of users) {
    console.log(`👤 Criando ${user.role} (${user.email})...`);
    
    try {
      // Tentar método 1: signUp simples
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: user.name,
            cargo: user.role
          }
        }
      });
      
      if (error) {
        console.log(`❌ Erro método 1 para ${user.role}:`, error.message);
        
        // Tentar método 2: signUp sem options
        console.log(`🔄 Tentando método 2 para ${user.role}...`);
        const { data: data2, error: error2 } = await supabase.auth.signUp({
          email: user.email,
          password: user.password
        });
        
        if (error2) {
          console.log(`❌ Erro método 2 para ${user.role}:`, error2.message);
          
          // Tentar método 3: inserção direta (se RLS permitir)
          console.log(`🔄 Tentando método 3 (inserção direta) para ${user.role}...`);
          const { data: directData, error: directError } = await supabase
            .from('profiles')
            .insert({
              id: user.role === 'corretor' ? 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' : 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
              email: user.email,
              full_name: user.name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (directError) {
            console.log(`❌ Erro método 3 para ${user.role}:`, directError.message);
          } else {
            console.log(`✅ ${user.role} criado via método 3`);
            
            // Criar role
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: user.role === 'corretor' ? 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' : 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
                role: user.role,
                created_at: new Date().toISOString()
              });
            
            if (roleError) {
              console.log(`❌ Erro ao criar role para ${user.role}:`, roleError.message);
            } else {
              console.log(`✅ Role para ${user.role} criado`);
            }
          }
        } else {
          console.log(`✅ ${user.role} criado via método 2:`, data2.user?.email);
        }
      } else {
        console.log(`✅ ${user.role} criado via método 1:`, data.user?.email);
      }
      
    } catch (err) {
      console.log(`💥 Erro inesperado para ${user.role}:`, err.message);
    }
    
    console.log('-------------------------------------');
  }
  
  // Verificar resultado final
  console.log('🔍 Verificando resultado final...');
  const { data: allUsers, error: allError } = await supabase
    .from('profiles')
    .select('*');
  
  if (allError) {
    console.log('❌ Erro ao verificar profiles:', allError.message);
  } else {
    console.log('📊 Total de profiles:', allUsers.length);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.full_name}) - ID: ${user.id}`);
    });
  }
  
  const { data: allRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*');
  
  if (rolesError) {
    console.log('❌ Erro ao verificar roles:', rolesError.message);
  } else {
    console.log('🎭 Total de roles:', allRoles.length);
    allRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.role} - User ID: ${role.user_id}`);
    });
  }
  
  console.log('=====================================');
  console.log('🎯 Teste de login após criação...');
  
  // Testar login
  for (const user of users) {
    console.log(`🔐 Testando login ${user.role}...`);
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });
    
    if (loginError) {
      console.log(`❌ Login falhou para ${user.role}:`, loginError.message);
    } else {
      console.log(`✅ Login bem-sucedido para ${user.role}:`, loginData.user?.email);
    }
  }
}

forceCreateUsers();





