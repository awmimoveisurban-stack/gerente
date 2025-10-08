# 🔧 CONFIGURAR BACKEND - EDGE FUNCTIONS

## 📊 Status Atual
- ✅ **Frontend**: Configurado com nova URL Supabase
- ✅ **Banco de dados**: Configurado
- 🔄 **Próximo**: Configurar Edge Functions

---

## 🚀 CONFIGURAÇÃO COMPLETA DO BACKEND

### **PASSO 1: Configurar Environment Variables**
1. **Supabase Dashboard** → Edge Functions → Settings
2. **Adicionar** as seguintes variáveis:

```env
# Evolution API Configuration
AUTHENTICATION_API_KEY="cfd9b746ea9e400dc8f4d3e8d57b0180"
SERVER_URL="https://api.urbanautobot.com"
SERVER_PORT="8080"
DATABASE_ENABLED="true"
DATABASE_CONNECTION_URI="file:./evolution.db"

# Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZuZ2Fvb2dxYWd3YWNqZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMzI1MywiZXhwIjoyMDczODc5MjUzfQ.NOtKmJIWXlPhEPPLIS_y9-i0G1ApPoPatgnfyShQ8Z0"
```

### **PASSO 2: Criar Edge Function whatsapp-connect**
1. **Edge Functions** → "Create a new function"
2. **Nome**: `whatsapp-connect`
3. **Criar** a função

### **PASSO 3: Copiar Código da Edge Function**
1. **Abra** o arquivo: `supabase/functions/whatsapp-connect/index.ts`
2. **Selecione TODO** o código (Ctrl+A)
3. **Copie** (Ctrl+C)

### **PASSO 4: Colar no Dashboard**
1. **No editor** da Edge Function `whatsapp-connect`
2. **Selecione tudo** (Ctrl+A)
3. **Delete** código padrão
4. **Cole** novo código (Ctrl+V)

### **PASSO 5: Deploy whatsapp-connect**
1. **Clique** "Deploy"
2. **Aguarde** alguns segundos
3. **Verifique** sucesso

### **PASSO 6: Criar Edge Function whatsapp-send-message**
1. **Edge Functions** → "Create a new function"
2. **Nome**: `whatsapp-send-message`
3. **Criar** a função

### **PASSO 7: Copiar Código whatsapp-send-message**
1. **Abra** o arquivo: `supabase/functions/whatsapp-send-message/index.ts`
2. **Selecione TODO** o código (Ctrl+A)
3. **Copie** (Ctrl+C)

### **PASSO 8: Colar no Dashboard**
1. **No editor** da Edge Function `whatsapp-send-message`
2. **Selecione tudo** (Ctrl+A)
3. **Delete** código padrão
4. **Cole** novo código (Ctrl+V)

### **PASSO 9: Deploy whatsapp-send-message**
1. **Clique** "Deploy"
2. **Aguarde** alguns segundos
3. **Verifique** sucesso

---

## 🧪 TESTAR BACKEND

### **PASSO 10: Testar Edge Functions**
1. **Vá para** `/gerente/whatsapp`
2. **Clique** "🔍 Test Edge Function"

#### **Resultado Esperado:**
```
✅ Edge Function OK
Edge Function está funcionando perfeitamente
```

### **PASSO 11: Testar Conexão WhatsApp**
1. **Se o teste passou**, clique "Conectar WhatsApp"
2. **Deve funcionar** sem erro 500
3. **QR Code** deve aparecer

---

## 🔍 VERIFICAR CONFIGURAÇÃO

### **Edge Functions Criadas:**
- [ ] **whatsapp-connect** criada e deployada
- [ ] **whatsapp-send-message** criada e deployada
- [ ] **Environment Variables** configuradas

### **Testes:**
- [ ] **Test Edge Function** passa
- [ ] **Conectar WhatsApp** funciona
- [ ] **QR Code** aparece
- [ ] **Sem erro 500**

---

## 🎯 RESULTADO ESPERADO

### **Após Configurar:**
```
✅ Environment Variables configuradas
✅ Edge Function whatsapp-connect criada
✅ Edge Function whatsapp-send-message criada
✅ Ambas deployadas com sucesso
✅ Test Edge Function passa
✅ Conectar WhatsApp funciona
✅ QR Code aparece
✅ Backend funcionando perfeitamente
```

---

## 🎉 CONCLUSÃO

**Execute os 11 passos acima para configurar o backend completamente!** 🚀

**Após configurar, o sistema WhatsApp funcionará perfeitamente!** ✅





