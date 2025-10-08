# 🚀 CONFIGURAR NOVO PROJETO SUPABASE

## 📊 Novas Credenciais Recebidas
- ✅ **Projeto**: `bxtuynqauqasigcbocbm`
- ✅ **URL**: `https://bxtuynqauqasigcbocbm.supabase.co`
- ✅ **Chave Pública**: Configurada
- ✅ **Evolution API**: Configurada

---

## 🔧 CONFIGURAÇÃO COMPLETA

### **PASSO 1: Atualizar .env Local**
1. **Abra** o arquivo `.env` do projeto
2. **Substitua** as credenciais antigas pelas novas:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="bxtuynqauqasigcbocbm"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o"
VITE_SUPABASE_URL="https://bxtuynqauqasigcbocbm.supabase.co"
```

### **PASSO 2: Configurar Edge Functions no Supabase**
1. **Acesse**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Selecione** o projeto `bxtuynqauqasigcbocbm`
3. **Vá em** Edge Functions
4. **Clique** em "Settings" ou "Environment Variables"
5. **Adicione** as seguintes variáveis:

```env
AUTHENTICATION_API_KEY="cfd9b746ea9e400dc8f4d3e8d57b0180"
SERVER_URL="https://api.urbanautobot.com"
SERVER_PORT="8080"
DATABASE_ENABLED="true"
DATABASE_CONNECTION_URI="file:./evolution.db"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZuZ2Fvb2dxYWd3YWNqZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMzI1MywiZXhwIjoyMDczODc5MjUzfQ.NOtKmJIWXlPhEPPLIS_y9-i0G1ApPoPatgnfyShQ8Z0"
```

### **PASSO 3: Criar Edge Function whatsapp-simple**
1. **No Dashboard** → Edge Functions
2. **Clique** "Create a new function"
3. **Nome**: `whatsapp-simple`
4. **Criar** a função

### **PASSO 4: Copiar Código da Edge Function**
1. **Abra** o arquivo: `supabase/functions/whatsapp-simple/index.ts`
2. **Selecione TODO** o código (Ctrl+A)
3. **Copie** (Ctrl+C)

### **PASSO 5: Colar no Dashboard**
1. **No editor** da Edge Function `whatsapp-simple`
2. **Selecione tudo** (Ctrl+A)
3. **Delete** código padrão
4. **Cole** novo código (Ctrl+V)

### **PASSO 6: Deploy**
1. **Clique** "Deploy"
2. **Aguarde** alguns segundos
3. **Verifique** sucesso

---

## 🧪 TESTAR NOVA CONFIGURAÇÃO

### **PASSO 7: Testar Sistema**
1. **Recarregue** o servidor de desenvolvimento
2. **Vá para** `/gerente/whatsapp`
3. **Clique** "🔍 Test Edge Function"

#### **Resultado Esperado:**
```
✅ Edge Function OK
Edge Function está funcionando perfeitamente
```

### **PASSO 8: Testar Conexão WhatsApp**
1. **Se o teste passou**, clique "Conectar WhatsApp"
2. **Deve funcionar** sem erro 500
3. **QR Code** deve aparecer

---

## 🔍 VERIFICAR CONFIGURAÇÃO

### **Frontend (.env):**
- [ ] **VITE_SUPABASE_URL** atualizada
- [ ] **VITE_SUPABASE_PUBLISHABLE_KEY** atualizada
- [ ] **VITE_SUPABASE_PROJECT_ID** atualizada

### **Edge Functions (Dashboard):**
- [ ] **AUTHENTICATION_API_KEY** configurada
- [ ] **SERVER_URL** configurada
- [ ] **SUPABASE_SERVICE_ROLE_KEY** configurada
- [ ] **Edge Function** `whatsapp-simple` criada
- [ ] **Edge Function** deployada

---

## 🎯 RESULTADO ESPERADO

### **Após Configurar:**
```
✅ Nova configuração Supabase
✅ Edge Functions configuradas
✅ Sistema funcionando
✅ WhatsApp conectando
✅ QR Code aparecendo
```

---

## 🎉 CONCLUSÃO

**Nova configuração Supabase pronta!**

**Execute os 8 passos acima para configurar o sistema completamente!** 🚀

**Após configurar, o sistema funcionará perfeitamente!** ✅





