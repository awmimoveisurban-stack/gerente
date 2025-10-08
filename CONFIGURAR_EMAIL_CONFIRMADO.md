# 🔧 CONFIGURAR EMAIL DO CORRETOR COMO CONFIRMADO

## 🎯 **OBJETIVO:**
Configurar o email do corretor como já confirmado para resolver o erro 400 de autenticação.

---

## 🚀 **SOLUÇÕES:**

### **OPÇÃO 1: Apenas Confirmar Email (Se usuário já existe)**
```sql
-- Execute no Supabase Dashboard -> SQL Editor
-- Arquivo: confirm-corretor-email.sql
```

### **OPÇÃO 2: Configuração Completa (Recomendado)**
```sql
-- Execute no Supabase Dashboard -> SQL Editor
-- Arquivo: setup-corretor-complete.sql
```

---

## 📊 **DADOS DE LOGIN:**

**Email:** `corretor@imobiliaria.com`  
**Senha:** `12345678`  
**Status:** Email confirmado automaticamente

---

## 🧪 **TESTE APÓS EXECUTAR:**

### **1. Execute o JavaScript:**
```javascript
// Execute no console do navegador
// Arquivo: test-confirmed-login.js
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
✅ Email confirmado: Sim
✅ Roles encontradas: ['corretor']
✅ X leads encontrados para o corretor
✅ Deveria redirecionar para /dashboard
🎉 LOGIN DO CORRETOR FUNCIONANDO PERFEITAMENTE!
```

### **❌ Se Login Ainda Falhar:**
```
❌ Erro no login: Invalid login credentials
```

---

## 🔍 **VERIFICAÇÃO MANUAL:**

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

## 🛠️ **O QUE OS SCRIPTS FAZEM:**

### **confirm-corretor-email.sql:**
- ✅ Verifica status atual do email
- ✅ Confirma o email do corretor
- ✅ Verifica se foi confirmado
- ✅ Mostra dados de login

### **setup-corretor-complete.sql:**
- ✅ Remove usuário existente (se houver problemas)
- ✅ Cria usuário com email já confirmado
- ✅ Cria perfil
- ✅ Cria role
- ✅ Cria leads de exemplo
- ✅ Verifica tudo

---

## 🎯 **PASSOS RECOMENDADOS:**

1. **Execute:** `setup-corretor-complete.sql` (configuração completa)
2. **Teste:** `test-confirmed-login.js`
3. **Confirme:** Login manual no navegador

---

## 🎉 **RESULTADO ESPERADO:**

**✅ LOGIN FUNCIONANDO:**
- Email: `corretor@imobiliaria.com`
- Senha: `12345678`
- Status: Email confirmado
- Redirecionamento: `/dashboard`
- Sem erros 400

---

## 📞 **SE AINDA NÃO FUNCIONAR:**

1. **Verifique o console** para erros
2. **Execute o script de teste** para ver o erro específico
3. **Confirme que o SQL** foi executado sem erros
4. **Verifique no Supabase Dashboard** se o usuário foi criado e confirmado

---

## 🚀 **EXECUTE AGORA:**

1. **SQL:** `setup-corretor-complete.sql`
2. **JavaScript:** `test-confirmed-login.js`
3. **Teste manual** no navegador

**O email do corretor será confirmado e o login funcionará!** 🎉





