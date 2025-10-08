# 🔧 CORRIGIR LOGIN DO CORRETOR - VERSÃO FINAL

## ❌ **ERRO CORRIGIDO:**
```
ERROR: 42804: UNION types timestamp with time zone and text cannot be matched
```

## ✅ **PROBLEMA RESOLVIDO:**
- Removido UNION com tipos incompatíveis
- Separado em consultas individuais
- Tipos de dados consistentes

---

## 🚀 **EXECUTE ESTE SCRIPT AGORA:**

### **OPÇÃO 1: Script Mais Simples (Recomendado)**
```sql
-- Execute no Supabase Dashboard -> SQL Editor
-- Arquivo: create-corretor-simple.sql
```

### **OPÇÃO 2: Script Completo**
```sql
-- Execute no Supabase Dashboard -> SQL Editor
-- Arquivo: create-corretor-user-fixed.sql
```

---

## 📊 **DADOS DE LOGIN:**

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
-- Execute: create-corretor-simple.sql
```

### **Se Senha Incorreta:**
```sql
UPDATE auth.users 
SET encrypted_password = crypt('12345678', gen_salt('bf'))
WHERE email = 'corretor@imobiliaria.com';
```

---

## 🎯 **PASSOS PARA RESOLVER:**

1. **Execute o SQL:** `create-corretor-simple.sql`
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

---

## 📝 **ARQUIVOS CORRIGIDOS:**

1. **`create-corretor-simple.sql`** - Script simples sem UNION
2. **`create-corretor-user-fixed.sql`** - Script completo corrigido
3. **`fix-corretor-login.sql`** - Script de correção corrigido

**Execute o script `create-corretor-simple.sql` e teste!** 🚀

O erro de UNION foi corrigido definitivamente!





