# 🚀 CRIAR USUÁRIOS FINAL - SOLUÇÃO DEFINITIVA

## 🚨 **SITUAÇÃO ATUAL:**
- ✅ Erro de chave duplicada corrigido
- ❌ Usuários ainda não criados
- ❌ Banco de dados vazio
- ❌ Login não funciona

---

## ✅ **SOLUÇÃO DEFINITIVA:**

### **PASSO 1 - ACESSAR SUPABASE DASHBOARD:**
1. **Abra:** https://supabase.com/dashboard
2. **Faça login** na sua conta
3. **Selecione o projeto:** `bxtuynqauqasigcbocbm`

### **PASSO 2 - CRIAR USUÁRIOS MANUALMENTE:**
1. **Vá para:** Authentication > Users
2. **Clique em:** "Add user"
3. **Criar Corretor:**
   - **Email:** `corretor@imobiliaria.com`
   - **Password:** `corretor123`
   - **✅ Auto Confirm User** (MARCAR ESTA OPÇÃO!)
   - **Clique:** "Create user"

4. **Criar Gerente:**
   - **Email:** `gerente@imobiliaria.com`
   - **Password:** `gerente123`
   - **✅ Auto Confirm User** (MARCAR ESTA OPÇÃO!)
   - **Clique:** "Create user"

### **PASSO 3 - CRIAR PROFILES E ROLES:**
1. **Vá para:** SQL Editor
2. **Execute este SQL:**

```sql
-- Inserir profiles para os usuários criados
INSERT INTO profiles (id, email, full_name, created_at, updated_at) 
SELECT 
  id,
  email,
  split_part(email, '@', 1) as full_name,
  NOW(),
  NOW()
FROM auth.users 
WHERE email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Inserir roles
INSERT INTO user_roles (user_id, role, created_at)
SELECT 
  id,
  CASE 
    WHEN email = 'corretor@imobiliaria.com' THEN 'corretor'
    WHEN email = 'gerente@imobiliaria.com' THEN 'gerente'
  END as role,
  NOW()
FROM auth.users 
WHERE email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com')
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  created_at = NOW();
```

### **PASSO 4 - VERIFICAR CRIAÇÃO:**
Execute este SQL para verificar:

```sql
-- Verificar usuários criados
SELECT 
  u.email,
  u.email_confirmed_at,
  p.full_name,
  ur.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com');
```

---

## 🧪 **TESTAR APÓS CRIAÇÃO:**

Depois de criar os usuários, execute:
```bash
node test-auth-final.js
```

**Resultado esperado:**
- ✅ Login corretor funcionando
- ✅ Login gerente funcionando
- ✅ Usuários no banco
- ✅ Sem erro 400

---

## 🚀 **ALTERNATIVA - SCRIPT FORÇADO:**

Se ainda não funcionar, execute este script:

```bash
node force-create-users.js
```

**Arquivo `force-create-users.js`:**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bxtuynqauqasigcbocbm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o'
);

async function forceCreateUsers() {
  console.log('🚀 Forçando criação de usuários...');
  
  // Tentar criar via signUp com diferentes configurações
  const users = [
    { email: 'corretor@imobiliaria.com', password: 'corretor123', role: 'corretor' },
    { email: 'gerente@imobiliaria.com', password: 'gerente123', role: 'gerente' }
  ];
  
  for (const user of users) {
    console.log(`👤 Criando ${user.role}...`);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: user.role === 'corretor' ? 'Corretor Teste' : 'Gerente Teste',
            cargo: user.role
          }
        }
      });
      
      if (error) {
        console.log(`❌ Erro ao criar ${user.role}:`, error.message);
      } else {
        console.log(`✅ ${user.role} criado:`, data.user?.email);
      }
    } catch (err) {
      console.log(`💥 Erro inesperado para ${user.role}:`, err.message);
    }
  }
  
  // Verificar resultado
  console.log('🔍 Verificando resultado...');
  const { data: allUsers, error: allError } = await supabase
    .from('profiles')
    .select('*');
  
  if (allError) {
    console.log('❌ Erro ao verificar:', allError.message);
  } else {
    console.log('📊 Total de usuários:', allUsers.length);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
    });
  }
}

forceCreateUsers();
```

---

## 📋 **CHECKLIST FINAL:**

- [ ] Acessar Supabase Dashboard
- [ ] Criar usuário corretor (com Auto Confirm)
- [ ] Criar usuário gerente (com Auto Confirm)
- [ ] Executar SQL para profiles e roles
- [ ] Verificar criação com SQL
- [ ] Testar login com script
- [ ] Confirmar funcionamento

---

## 🎯 **PRÓXIMOS PASSOS APÓS CRIAÇÃO:**

1. **Testar login** com `node test-auth-final.js`
2. **Verificar aplicação** carregando sem erro 400
3. **Testar navegação** entre páginas
4. **Verificar dashboards** funcionando
5. **Testar funcionalidades** do sistema

---

## 🚨 **IMPORTANTE:**

- **MARCAR "Auto Confirm User"** ao criar usuários
- **Executar o SQL** para criar profiles e roles
- **Verificar** se não há mais erro 400
- **Testar** antes de continuar

**Siga estes passos e o sistema funcionará perfeitamente!** 🚀





