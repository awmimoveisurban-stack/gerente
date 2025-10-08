# 🔧 CORRIGIR LOGIN AGORA - SOLUÇÃO DIRETA

## ❌ **ERRO ATUAL:**
```
POST https://bxtuynqauqasigcbocbm.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
```

## 🚀 **SOLUÇÃO IMEDIATA:**

### **PASSO 1: Execute o SQL**
```sql
-- Execute no Supabase Dashboard -> SQL Editor
-- Arquivo: fix-corretor-now.sql
```

### **PASSO 2: Teste o Login**
```javascript
// Execute no console do navegador
// Arquivo: test-login-simple.js
```

---

## 📊 **DADOS DE LOGIN:**

**Email:** `corretor@imobiliaria.com`  
**Senha:** `12345678`

---

## 🧪 **TESTE RÁPIDO:**

### **1. Execute o JavaScript:**
```javascript
// Execute no console do navegador
// Arquivo: test-login-simple.js
```

### **2. Teste Manual:**
1. Acesse a página de login
2. Digite: `corretor@imobiliaria.com`
3. Digite: `12345678`
4. Clique em "Entrar"

---

## 📋 **RESULTADOS ESPERADOS:**

### **✅ Se Login Funcionar:**
```
✅ Login realizado com sucesso!
✅ Roles encontradas: ['corretor']
✅ X leads encontrados
🎉 LOGIN FUNCIONANDO PERFEITAMENTE!
```

### **❌ Se Login Ainda Falhar:**
```
❌ Erro no login: Invalid login credentials
```

---

## 🔍 **VERIFICAÇÃO RÁPIDA:**

### **No Supabase Dashboard:**
1. Vá em **Authentication** → **Users**
2. Procure por `corretor@imobiliaria.com`
3. Verifique se está **Confirmed**

### **No SQL Editor:**
```sql
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';
```

---

## 🎯 **PASSOS SIMPLES:**

1. **Execute:** `fix-corretor-now.sql`
2. **Teste:** `test-login-simple.js`
3. **Confirme:** Login manual

---

## 🎉 **RESULTADO ESPERADO:**

**✅ LOGIN FUNCIONANDO:**
- Email: `corretor@imobiliaria.com`
- Senha: `12345678`
- Redirecionamento: `/dashboard`
- Sem erros 400

---

## 📞 **SE AINDA NÃO FUNCIONAR:**

1. **Verifique o console** para erros
2. **Execute o script de teste** para ver o erro específico
3. **Confirme que o SQL** foi executado sem erros
4. **Verifique no Supabase Dashboard** se o usuário foi criado

---

## 🚀 **EXECUTE AGORA:**

1. **SQL:** `fix-corretor-now.sql`
2. **JavaScript:** `test-login-simple.js`
3. **Teste manual** no navegador

**O login do corretor funcionará!** 🎉





