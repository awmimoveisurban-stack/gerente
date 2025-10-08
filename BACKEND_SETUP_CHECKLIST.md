# 📋 CHECKLIST - CONFIGURAÇÃO BACKEND

## 🔧 EDGE FUNCTIONS SETUP

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### **1. Environment Variables**
- [ ] **Acessar**: Edge Functions → Settings
- [ ] **Adicionar**:
  ```
  AUTHENTICATION_API_KEY="cfd9b746ea9e400dc8f4d3e8d57b0180"
  SERVER_URL="https://api.urbanautobot.com"
  SERVER_PORT="8080"
  DATABASE_ENABLED="true"
  DATABASE_CONNECTION_URI="file:./evolution.db"
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZuZ2Fvb2dxYWd3YWNqZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMzI1MywiZXhwIjoyMDczODc5MjUzfQ.NOtKmJIWXlPhEPPLIS_y9-i0G1ApPoPatgnfyShQ8Z0"
  ```

### **2. Edge Function whatsapp-connect**
- [ ] **Criar** função `whatsapp-connect`
- [ ] **Abrir** arquivo: `supabase/functions/whatsapp-connect/index.ts`
- [ ] **Copiar** todo o código (Ctrl+A, Ctrl+C)
- [ ] **Colar** no editor da Edge Function
- [ ] **Deploy** a função
- [ ] **Verificar** sucesso do deploy

### **3. Edge Function whatsapp-send-message**
- [ ] **Criar** função `whatsapp-send-message`
- [ ] **Abrir** arquivo: `supabase/functions/whatsapp-send-message/index.ts`
- [ ] **Copiar** todo o código (Ctrl+A, Ctrl+C)
- [ ] **Colar** no editor da Edge Function
- [ ] **Deploy** a função
- [ ] **Verificar** sucesso do deploy

---

## 🧪 TESTES DE FUNCIONAMENTO

### **4. Testar Edge Functions**
- [ ] **Frontend** → `/gerente/whatsapp`
- [ ] **Clique** "🔍 Test Edge Function"
- [ ] **Resultado esperado**: ✅ SUCCESS

### **5. Testar Conexão WhatsApp**
- [ ] **Clique** "Conectar WhatsApp"
- [ ] **Resultado esperado**: QR Code aparece
- [ ] **Sem erro 500**

---

## 🎯 RESULTADO FINAL

### **Após Completar Checklist:**
```
✅ Environment Variables configuradas
✅ whatsapp-connect criada e deployada
✅ whatsapp-send-message criada e deployada
✅ Test Edge Function passa
✅ Conectar WhatsApp funciona
✅ QR Code aparece
✅ Backend funcionando perfeitamente
```

---

## 🎉 CONCLUSÃO

**Complete todos os itens do checklist acima!** 🚀

**Após completar, o backend estará funcionando perfeitamente!** ✅





