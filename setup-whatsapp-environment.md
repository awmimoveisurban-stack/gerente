# 🔧 CONFIGURAÇÃO AUTOMÁTICA DO SISTEMA WHATSAPP

## 📋 **PASSOS PARA CONFIGURAR O WHATSAPP:**

### **1. 🗄️ Executar SQL no Dashboard**
1. **Acesse**: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/sql
2. **Cole e execute**: O conteúdo do arquivo `fix-all-database-tables.sql`

### **2. 🔑 Configurar Variáveis de Ambiente**
1. **Acesse**: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/functions
2. **Clique em**: `whatsapp-connect`
3. **Vá em**: Settings → Environment Variables
4. **Adicione**:
   ```
   SUPABASE_URL = https://bxtuynqauqasigcbocbm.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = [SUA_SERVICE_ROLE_KEY]
   EVOLUTION_API_URL = [SUA_EVOLUTION_API_URL]
   EVOLUTION_API_KEY = [SUA_EVOLUTION_API_KEY]
   ```

### **3. 🚀 Fazer Deploy da Edge Function**
1. **Na mesma página**: Clique em "Deploy"
2. **Aguarde**: O deploy ser concluído

### **4. 🔐 Fazer Login**
1. **Acesse**: http://127.0.0.1:3006/auth
2. **Email**: `gerente@imobiliaria.com`
3. **Senha**: `admin123`
4. **Clique**: "Entrar"

### **5. 📱 Testar WhatsApp**
1. **Acesse**: http://127.0.0.1:3006/gerente/whatsapp
2. **Clique**: "Conectar WhatsApp"
3. **Escaneie**: O QR Code que aparecer

### **6. 🧪 Testar Sistema Completo**
1. **Pressione**: F12 (abrir DevTools)
2. **Vá na aba**: "Console"
3. **Cole**: O conteúdo do arquivo `test-complete-system.js`
4. **Pressione**: Enter

---

## ✅ **RESULTADO ESPERADO:**

- ✅ **Banco de dados** configurado corretamente
- ✅ **Autenticação** funcionando
- ✅ **Navegação** entre páginas funcionando
- ✅ **Kanban** com leads funcionando
- ✅ **WhatsApp** configurado e funcionando

---

## 🚨 **SE ALGO DER ERRADO:**

### **Erro de banco de dados:**
- Execute novamente o SQL `fix-all-database-tables.sql`

### **Erro de autenticação:**
- Verifique se o usuário `gerente@imobiliaria.com` foi criado
- Execute o SQL para criar o usuário se necessário

### **Erro de WhatsApp:**
- Verifique as variáveis de ambiente da Edge Function
- Faça o deploy novamente da função

### **Erro de navegação:**
- Execute o script `test-complete-system.js` para diagnosticar

---

## 🎯 **ORDEM DE EXECUÇÃO:**

1. **SQL** → 2. **Variáveis de Ambiente** → 3. **Deploy** → 4. **Login** → 5. **Teste**

**O sistema funcionará perfeitamente após seguir todos os passos!** 🎉





