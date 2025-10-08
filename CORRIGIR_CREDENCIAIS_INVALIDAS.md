# 🔧 CORRIGIR CREDENCIAIS INVÁLIDAS

## ❌ **ERRO IDENTIFICADO:**
```
Invalid login credentials
```

## 🔍 **POSSÍVEIS CAUSAS:**

1. **Usuário não existe** - Email não foi criado no banco
2. **Senha incorreta** - Senha não foi criptografada corretamente
3. **Email não confirmado** - Usuário existe mas email não foi confirmado
4. **Problema de criptografia** - Senha não está no formato correto
5. **Configuração incorreta** - Campos obrigatórios não foram preenchidos

---

## 🚀 **SOLUÇÕES:**

### **PASSO 1: Testar Credenciais Atuais**
```javascript
// Execute no console do navegador
// Arquivo: test-credentials.js
```

### **PASSO 2: Corrigir Credenciais**
```sql
-- Execute no Supabase Dashboard -> SQL Editor
-- Arquivo: fix-invalid-credentials.sql
```

---

## 📊 **DADOS DE LOGIN CORRETOS:**

**Email:** `corretor@imobiliaria.com`  
**Senha:** `12345678`

---

## 🧪 **TESTE APÓS EXECUTAR:**

### **1. Execute o JavaScript de Teste:**
```javascript
// Execute no console do navegador
// Arquivo: test-credentials.js
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
✅ Login bem-sucedido!
Usuário: corretor@imobiliaria.com
ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Email confirmado: Sim
✅ Roles encontradas: ['corretor']
✅ X leads encontrados
🎉 LOGIN BEM-SUCEDIDO!
```

### **❌ Se Login Ainda Falhar:**
```
❌ Erro: Invalid login credentials
🔍 Credenciais inválidas
```

---

## 🔍 **VERIFICAÇÃO MANUAL:**

### **No Supabase Dashboard:**
1. Vá em **Authentication** → **Users**
2. Procure por `corretor@imobiliaria.com`
3. Verifique se está **Confirmed**
4. Verifique se a senha está criptografada

### **No SQL Editor:**
```sql
-- Verificar usuário
SELECT email, email_confirmed_at, encrypted_password IS NOT NULL as senha_ok
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';

-- Testar senha
SELECT email,
       CASE 
           WHEN crypt('12345678', encrypted_password) = encrypted_password 
           THEN '✅ Senha correta'
           ELSE '❌ Senha incorreta'
       END as status_senha
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';
```

---

## 🛠️ **O QUE O SCRIPT FAZ:**

### **fix-invalid-credentials.sql:**
- ✅ Verifica usuário atual
- ✅ Remove usuário problemático
- ✅ Cria usuário com senha corretamente criptografada
- ✅ Cria perfil
- ✅ Cria role
- ✅ Testa senha
- ✅ Cria leads
- ✅ Verifica tudo

### **test-credentials.js:**
- ✅ Testa diferentes combinações de credenciais
- ✅ Identifica qual credencial funciona
- ✅ Verifica roles e leads
- ✅ Mostra resumo completo

---

## 🎯 **PASSOS PARA RESOLVER:**

1. **Teste:** Execute `test-credentials.js` para ver qual credencial funciona
2. **Corrija:** Execute `fix-invalid-credentials.sql` para recriar o usuário
3. **Confirme:** Execute `test-credentials.js` novamente
4. **Teste manual:** Login no navegador

---

## 📞 **SE AINDA NÃO FUNCIONAR:**

1. **Verifique o console** para erros específicos
2. **Execute o script de teste** para ver qual credencial funciona
3. **Confirme que o SQL** foi executado sem erros
4. **Verifique no Supabase Dashboard** se o usuário foi criado
5. **Teste com diferentes senhas** no script de teste

---

## 🎉 **RESULTADO ESPERADO:**

**✅ LOGIN FUNCIONANDO:**
- Email: `corretor@imobiliaria.com`
- Senha: `12345678`
- Status: Credenciais válidas
- Redirecionamento: `/dashboard`
- Sem erros de credenciais inválidas

---

## 🚀 **EXECUTE AGORA:**

1. **JavaScript:** `test-credentials.js` (para testar)
2. **SQL:** `fix-invalid-credentials.sql` (para corrigir)
3. **JavaScript:** `test-credentials.js` (para confirmar)
4. **Teste manual** no navegador

**As credenciais inválidas serão corrigidas!** 🎉





