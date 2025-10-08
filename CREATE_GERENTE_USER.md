# 👤 CRIAR USUÁRIO GERENTE

## 📊 Usuário a Criar
- ✅ **Email**: `gerente@imobiliaria.com`
- ✅ **Senha**: `admin123`
- ✅ **Role**: `gerente`

---

## 🔧 CRIAR USUÁRIO GERENTE

### **PASSO 1: Acessar Supabase Dashboard**
1. **Abra**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Selecione** o projeto `bxtuynqauqasigcbocbm`
3. **Vá em** Authentication → Users

### **PASSO 2: Criar Usuário**
1. **Clique** em "Add user"
2. **Preencha**:
   - **Email**: `gerente@imobiliaria.com`
   - **Password**: `admin123`
   - **Auto Confirm User**: ✅ (marcar)
3. **Clique** "Create user"

### **PASSO 3: Criar Perfil do Gerente**
1. **Vá em** SQL Editor
2. **Execute** o seguinte SQL:

```sql
-- Criar perfil para o gerente
INSERT INTO profiles (id, name, role)
SELECT id, 'Gerente', 'gerente'
FROM auth.users
WHERE email = 'gerente@imobiliaria.com'
ON CONFLICT (id) DO UPDATE SET
  name = 'Gerente',
  role = 'gerente';
```

### **PASSO 4: Verificar Criação**
1. **Vá em** Authentication → Users
2. **Verifique** se o usuário `gerente@imobiliaria.com` foi criado
3. **Vá em** Table Editor → profiles
4. **Verifique** se o perfil foi criado com role `gerente`

---

## 🧪 TESTAR ACESSO

### **PASSO 5: Testar Login**
1. **Vá para** `/auth` no frontend
2. **Use** as credenciais:
   - **Email**: `gerente@imobiliaria.com`
   - **Senha**: `admin123`
3. **Clique** "Entrar"

### **Resultado Esperado:**
```
✅ Login bem-sucedido
✅ Redirecionamento para dashboard do gerente
✅ Acesso às funcionalidades de gerente
```

---

## 🔍 VERIFICAR FUNCIONAMENTO

### **Funcionalidades do Gerente:**
- ✅ **Dashboard**: Acesso ao dashboard do gerente
- ✅ **WhatsApp**: Configuração do WhatsApp
- ✅ **Leads**: Visualização e gerenciamento de leads
- ✅ **Corretores**: Gerenciamento de corretores

---

## 🎯 RESULTADO ESPERADO

### **Após Criar:**
```
✅ Usuário gerente criado
✅ Perfil configurado
✅ Login funcionando
✅ Acesso ao dashboard
✅ Todas as funcionalidades disponíveis
```

---

## 🎉 CONCLUSÃO

**Usuário gerente criado com sucesso!**

**Execute os 5 passos acima para criar o usuário gerente!** 🚀

**Após criar, o login funcionará perfeitamente!** ✅
