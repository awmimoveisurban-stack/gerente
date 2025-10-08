# 🧹 LIMPAR E RECRIAR USUÁRIOS - SOLUÇÃO DEFINITIVA

## 🚨 **PROBLEMA ATUAL:**
```
ERROR: 23505: duplicate key value violates unique constraint "profiles_pkey"
DETAIL: Key (id)=(cec3f29d-3904-43b1-a0d5-bc99124751bc) already exists
```

**Causa:** Tentativa de inserir usuário com ID que já existe. Precisamos limpar tudo e recomeçar.

---

## ✅ **SOLUÇÃO DEFINITIVA:**

### **PASSO 1 - ACESSAR SUPABASE DASHBOARD:**
1. **Abra:** https://supabase.com/dashboard
2. **Login** na sua conta
3. **Selecione:** Projeto `bxtuynqauqasigcbocbm`

### **PASSO 2 - EXECUTAR SQL DE LIMPEZA:**
1. **Vá para:** SQL Editor
2. **Execute este SQL completo:**

```sql
-- LIMPAR TUDO E RECOMEÇAR
DELETE FROM user_roles;
DELETE FROM profiles;

-- Verificar se foi limpo
SELECT 'Profiles restantes:' as tabela, COUNT(*) as total FROM profiles
UNION ALL
SELECT 'Roles restantes:' as tabela, COUNT(*) as total FROM user_roles;
```

### **PASSO 3 - VERIFICAR USUÁRIOS EM AUTH:**
Execute este SQL para ver quais usuários existem:

```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com')
ORDER BY created_at;
```

### **PASSO 4 - CRIAR PROFILES E ROLES:**
Execute este SQL:

```sql
-- Inserir profiles baseado nos usuários existentes
INSERT INTO profiles (id, email, full_name, created_at, updated_at) 
SELECT 
  id,
  email,
  split_part(email, '@', 1) as full_name,
  created_at,
  NOW() as updated_at
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

### **PASSO 5 - VERIFICAR RESULTADO:**
```sql
SELECT 
  'RESULTADO FINAL:' as status,
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

## 🔄 **ALTERNATIVA - SE NÃO FUNCIONAR:**

### **OPÇÃO A - DELETAR USUÁRIOS EM AUTH:**
1. **Vá para:** Authentication > Users
2. **Delete** os usuários existentes:
   - `corretor@imobiliaria.com`
   - `gerente@imobiliaria.com`
3. **Recrie** os usuários:
   - Email: `corretor@imobiliaria.com`
   - Password: `corretor123`
   - **✅ Auto Confirm User**
   
   - Email: `gerente@imobiliaria.com`
   - Password: `gerente123`
   - **✅ Auto Confirm User**

### **OPÇÃO B - USAR IDs DIFERENTES:**
Se ainda der erro, use IDs fixos:

```sql
-- Limpar tudo
DELETE FROM user_roles;
DELETE FROM profiles;

-- Inserir com IDs fixos
INSERT INTO profiles (id, email, full_name, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'corretor@imobiliaria.com', 'Corretor Teste', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'gerente@imobiliaria.com', 'Gerente Teste', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

INSERT INTO user_roles (user_id, role, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'corretor', NOW()),
('22222222-2222-2222-2222-222222222222', 'gerente', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  created_at = NOW();
```

---

## 🧪 **TESTAR APÓS LIMPEZA:**

Execute para testar:
```bash
node test-auth-final.js
```

**Resultado esperado:**
- ✅ Profiles criados com sucesso
- ✅ Roles criados com sucesso
- ✅ Login funcionando
- ✅ Sem erro de chave duplicada

---

## 📋 **CHECKLIST:**

- [ ] Dados antigos deletados
- [ ] Tabelas limpas (profiles e user_roles)
- [ ] Usuários verificados em auth.users
- [ ] Profiles inseridos com sucesso
- [ ] Roles inseridos com sucesso
- [ ] Teste de login funcionando
- [ ] Sistema operacional

---

## 🎯 **RESULTADO ESPERADO:**

Após executar a limpeza:
- ✅ **Dados limpos e organizados**
- ✅ **Usuários criados sem conflitos**
- ✅ **Login funcionando perfeitamente**
- ✅ **Sistema operacional 100%**

**Execute os passos em ordem e o sistema funcionará!** 🚀

**IMPORTANTE:** Execute o SQL de limpeza PRIMEIRO para evitar conflitos!





