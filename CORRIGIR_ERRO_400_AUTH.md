# 🔧 CORRIGIR ERRO 400 AUTH - SOLUÇÃO DEFINITIVA

## 🚨 **PROBLEMA IDENTIFICADO:**
```
POST https://bxtuynqauqasigcbocbm.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
```

**Causa:** O banco de dados está vazio - não há usuários cadastrados, por isso o erro "Invalid login credentials".

---

## ✅ **SOLUÇÃO DEFINITIVA:**

### **1. ACESSAR SUPABASE DASHBOARD:**
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `bxtuynqauqasigcbocbm`
4. Vá para **Authentication > Users**

### **2. CRIAR USUÁRIOS MANUALMENTE:**
1. Clique em **"Add user"**
2. Crie o usuário **corretor**:
   - **Email:** `corretor@imobiliaria.com`
   - **Password:** `corretor123`
   - **Auto Confirm User:** ✅ (marcado)

3. Crie o usuário **gerente**:
   - **Email:** `gerente@imobiliaria.com`
   - **Password:** `gerente123`
   - **Auto Confirm User:** ✅ (marcado)

### **3. CRIAR PROFILES NO SQL EDITOR:**
1. Vá para **SQL Editor**
2. Execute este SQL:

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
WHERE email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com');

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
WHERE email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com');
```

### **4. VERIFICAR CRIAÇÃO:**
Execute este SQL para verificar:

```sql
-- Verificar usuários criados
SELECT u.email, u.email_confirmed_at, p.full_name, ur.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com');
```

---

## 🧪 **TESTAR AUTENTICAÇÃO:**

### **Script de Teste:**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bxtuynqauqasigcbocbm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o'
);

// Testar login corretor
const { data: corretorData, error: corretorError } = await supabase.auth.signInWithPassword({
  email: 'corretor@imobiliaria.com',
  password: 'corretor123'
});

if (corretorError) {
  console.log('❌ Erro corretor:', corretorError.message);
} else {
  console.log('✅ Corretor logado:', corretorData.user.email);
}

// Testar login gerente
const { data: gerenteData, error: gerenteError } = await supabase.auth.signInWithPassword({
  email: 'gerente@imobiliaria.com',
  password: 'gerente123'
});

if (gerenteError) {
  console.log('❌ Erro gerente:', gerenteError.message);
} else {
  console.log('✅ Gerente logado:', gerenteData.user.email);
}
```

---

## 🔧 **ALTERNATIVA - SCRIPT AUTOMÁTICO:**

Se preferir usar script, execute:

```bash
node create-users-manual.js
```

**Arquivo `create-users-manual.js`:**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bxtuynqauqasigcbocbm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o'
);

async function createUsers() {
  console.log('🔧 Criando usuários...');
  
  // Criar corretor
  const { data: corretor, error: corretorError } = await supabase.auth.signUp({
    email: 'corretor@imobiliaria.com',
    password: 'corretor123',
    options: {
      emailRedirectTo: undefined // Desabilitar confirmação por email
    }
  });
  
  if (corretorError) {
    console.log('❌ Erro corretor:', corretorError.message);
  } else {
    console.log('✅ Corretor criado:', corretor.user?.email);
  }
  
  // Criar gerente
  const { data: gerente, error: gerenteError } = await supabase.auth.signUp({
    email: 'gerente@imobiliaria.com',
    password: 'gerente123',
    options: {
      emailRedirectTo: undefined
    }
  });
  
  if (gerenteError) {
    console.log('❌ Erro gerente:', gerenteError.message);
  } else {
    console.log('✅ Gerente criado:', gerente.user?.email);
  }
}

createUsers();
```

---

## 📋 **CHECKLIST DE VERIFICAÇÃO:**

- [ ] Usuário corretor criado no Supabase Dashboard
- [ ] Usuário gerente criado no Supabase Dashboard
- [ ] Profiles inseridos via SQL
- [ ] Roles inseridos via SQL
- [ ] Teste de login corretor funcionando
- [ ] Teste de login gerente funcionando
- [ ] Aplicação carregando sem erro 400

---

## 🎯 **RESULTADO ESPERADO:**

Após executar a solução:
- ✅ Login do corretor funcionando
- ✅ Login do gerente funcionando
- ✅ Sem erro 400 na autenticação
- ✅ Usuários redirecionados corretamente
- ✅ Sistema funcionando completamente

---

## 🚨 **IMPORTANTE:**

1. **Confirme os usuários** no Supabase Dashboard (Auto Confirm User)
2. **Execute o SQL** para criar profiles e roles
3. **Teste o login** antes de continuar
4. **Verifique** se não há mais erro 400

**Esta é a solução definitiva para o erro 400 na autenticação!** 🎯