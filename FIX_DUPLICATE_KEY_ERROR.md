# 🔧 CORRIGIR ERRO DE CHAVE DUPLICADA - SOLUÇÃO DEFINITIVA

## 🚨 **PROBLEMA IDENTIFICADO:**
```
ERROR: 23505: duplicate key value violates unique constraint "profiles_pkey"
DETAIL: Key (id)=(a1b2c3d4-e5f6-7890-abcd-ef1234567890) already exists.
```

**Causa:** Tentativa de inserir um usuário com ID que já existe, ou problema de cache/conflito.

---

## ✅ **SOLUÇÃO DEFINITIVA:**

### **OPÇÃO 1 - SUPABASE DASHBOARD (RECOMENDADA):**

#### **1. ACESSAR SQL EDITOR:**
1. Acesse: https://supabase.com/dashboard
2. Projeto: `bxtuynqauqasigcbocbm`
3. Vá para **SQL Editor**

#### **2. EXECUTAR SQL DE LIMPEZA:**
```sql
-- Limpar dados conflitantes
DELETE FROM user_roles WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM profiles WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Verificar se foi limpo
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as total_roles FROM user_roles;
```

#### **3. CRIAR USUÁRIOS VIA AUTH:**
1. Vá para **Authentication > Users**
2. Clique em **"Add user"**
3. Criar usuários:
   - **Email:** `corretor@imobiliaria.com`
   - **Password:** `corretor123`
   - **Auto Confirm User:** ✅
   
   - **Email:** `gerente@imobiliaria.com`
   - **Password:** `gerente123`
   - **Auto Confirm User:** ✅

#### **4. CRIAR PROFILES E ROLES:**
```sql
-- Inserir profiles baseado nos usuários criados via Auth
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

#### **5. VERIFICAR RESULTADO:**
```sql
-- Verificar usuários criados
SELECT 
  p.id,
  p.email,
  p.full_name,
  ur.role,
  p.created_at
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.created_at;
```

---

### **OPÇÃO 2 - SCRIPT AUTOMÁTICO:**

Se preferir usar script, execute:
```bash
node create-users-safe.js
```

---

### **OPÇÃO 3 - SQL DIRETO (SE TIVER ACESSO):**

Execute no SQL Editor do Supabase:
```sql
-- Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Limpar dados existentes
DELETE FROM user_roles;
DELETE FROM profiles;

-- Inserir dados limpos
INSERT INTO profiles (id, email, full_name, created_at, updated_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'corretor@imobiliaria.com', 'Corretor Teste', NOW(), NOW()),
('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'gerente@imobiliaria.com', 'Gerente Teste', NOW(), NOW());

INSERT INTO user_roles (user_id, role, created_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'corretor', NOW()),
('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'gerente', NOW());

-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
```

---

## 🧪 **TESTAR SOLUÇÃO:**

Após executar a solução, teste:
```bash
node test-auth-final.js
```

**Resultado esperado:**
- ✅ Login corretor funcionando
- ✅ Login gerente funcionando
- ✅ Sem erro de chave duplicada
- ✅ Sem erro 400 na autenticação

---

## 🔍 **VERIFICAR STATUS:**

Execute para verificar se foi corrigido:
```bash
node check-existing-data.js
```

---

## 📋 **CHECKLIST:**

- [ ] Dados conflitantes removidos
- [ ] Usuários criados via Auth Dashboard
- [ ] Profiles inseridos via SQL
- [ ] Roles inseridos via SQL
- [ ] Teste de login funcionando
- [ ] Sem erro de chave duplicada
- [ ] Sem erro 400 na autenticação

---

## 🎯 **RESULTADO ESPERADO:**

Após executar a solução:
- ✅ Usuários criados com sucesso
- ✅ Profiles e roles inseridos
- ✅ Login funcionando
- ✅ Sistema operacional

**Esta é a solução definitiva para o erro de chave duplicada!** 🚀





