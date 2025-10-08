# 🔧 CORRIGIR LOGIN DO CORRETOR

## ❌ **PROBLEMA IDENTIFICADO:**
```
Não está aceitando os dados de login do corretor
```

## 🔍 **POSSÍVEIS CAUSAS:**

1. **Email não confirmado** - Usuário criado mas email não confirmado
2. **Senha incorreta** - Senha não foi criptografada corretamente
3. **Usuário não existe** - Usuário não foi criado no banco
4. **Role não configurada** - Usuário existe mas não tem role de corretor
5. **Perfil não criado** - Usuário existe mas perfil não foi criado

---

## 🚀 **SOLUÇÕES:**

### **OPÇÃO 1: Corrigir Usuário Existente**
```sql
-- Execute no Supabase Dashboard -> SQL Editor
-- Arquivo: fix-corretor-login.sql
```

### **OPÇÃO 2: Recriar Usuário (Recomendado)**
```sql
-- Execute no Supabase Dashboard -> SQL Editor
-- Arquivo: create-corretor-user-fixed.sql
```

---

## 📊 **DADOS DE LOGIN CORRETOS:**

**Email:** `corretor@imobiliaria.com`  
**Senha:** `12345678`

---

## 🧪 **TESTE APÓS EXECUTAR:**

### **1. Execute o JavaScript:**
```javascript
// Execute no console do navegador na página de login
// Arquivo: test-corretor-login.js
```

### **2. Teste Manual:**
1. Acesse a página de login
2. Digite: `corretor@imobiliaria.com`
3. Digite: `12345678`
4. Clique em "Entrar"
5. Deve redirecionar para `/dashboard`

---

## 📋 **RESULTADOS ESPERADOS:**

### **✅ Se Login Funcionar:**
```
✅ Login realizado com sucesso!
✅ Usuário tem role de corretor!
✅ Perfil encontrado
✅ X leads encontrados para o corretor
✅ Deveria redirecionar para /dashboard
🎉 LOGIN DO CORRETOR FUNCIONANDO PERFEITAMENTE!
```

### **❌ Se Login Falhar:**
```
❌ Erro no login: Invalid login credentials
🔍 Possíveis causas:
- Email não existe
- Senha incorreta
- Email não confirmado
```

---

## 🔍 **VERIFICAÇÃO MANUAL:**

### **1. Verificar no Supabase Dashboard:**
- Vá em **Authentication** → **Users**
- Procure por `corretor@imobiliaria.com`
- Verifique se está **Confirmed**

### **2. Verificar no SQL Editor:**
```sql
-- Verificar usuário
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';

-- Verificar role
SELECT u.email, ur.role 
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com';
```

---

## 🛠️ **SOLUÇÕES ESPECÍFICAS:**

### **Se Email Não Confirmado:**
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'corretor@imobiliaria.com';
```

### **Se Usuário Não Existe:**
```sql
-- Execute: create-corretor-user-fixed.sql
```

### **Se Senha Incorreta:**
```sql
UPDATE auth.users 
SET encrypted_password = crypt('12345678', gen_salt('bf'))
WHERE email = 'corretor@imobiliaria.com';
```

---

## 🎯 **PASSOS PARA RESOLVER:**

1. **Execute o SQL:** `create-corretor-user-fixed.sql`
2. **Teste o JavaScript:** `test-corretor-login.js`
3. **Teste manual:** Login com `corretor@imobiliaria.com` / `12345678`
4. **Verifique redirecionamento:** Deve ir para `/dashboard`

---

## 📞 **SE AINDA NÃO FUNCIONAR:**

1. **Verifique os logs** do console do navegador
2. **Execute o script de teste** para ver o erro específico
3. **Confirme que o SQL** foi executado sem erros
4. **Verifique no Supabase Dashboard** se o usuário foi criado

---

## 🎉 **RESULTADO ESPERADO:**

**✅ LOGIN DO CORRETOR FUNCIONANDO:**
- Email: `corretor@imobiliaria.com`
- Senha: `12345678`
- Redirecionamento: `/dashboard`
- Acesso às funcionalidades de corretor

**Execute o script `create-corretor-user-fixed.sql` e teste!** 🚀





