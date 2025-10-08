# ⚡ CONFIGURAR BACKEND RAPIDAMENTE

## 🔧 BACKEND - EDGE FUNCTIONS

---

## 🚀 CONFIGURAÇÃO EM 5 PASSOS

### **1. Environment Variables**
**Edge Functions** → Settings → Adicionar:
```env
AUTHENTICATION_API_KEY="cfd9b746ea9e400dc8f4d3e8d57b0180"
SERVER_URL="https://api.urbanautobot.com"
SERVER_PORT="8080"
DATABASE_ENABLED="true"
DATABASE_CONNECTION_URI="file:./evolution.db"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZuZ2Fvb2dxYWd3YWNqZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMzI1MywiZXhwIjoyMDczODc5MjUzfQ.NOtKmJIWXlPhEPPLIS_y9-i0G1ApPoPatgnfyShQ8Z0"
```

### **2. Criar whatsapp-connect**
- **Criar** função `whatsapp-connect`
- **Copiar** código do arquivo `index.ts`
- **Deploy**

### **3. Criar whatsapp-send-message**
- **Criar** função `whatsapp-send-message`
- **Copiar** código do arquivo `index.ts`
- **Deploy**

### **4. Testar Edge Function**
- **Frontend** → "🔍 Test Edge Function"
- **Deve retornar**: ✅ SUCCESS

### **5. Testar WhatsApp**
- **Frontend** → "Conectar WhatsApp"
- **QR Code** deve aparecer

---

## ✅ RESULTADO
```
✅ Environment Variables configuradas
✅ Edge Functions criadas e deployadas
✅ Test Edge Function passa
✅ Conectar WhatsApp funciona
✅ QR Code aparece
✅ Backend funcionando
```

**Execute os 5 passos!** 🚀





