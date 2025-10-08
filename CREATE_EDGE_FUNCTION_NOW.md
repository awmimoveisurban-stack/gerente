# 🚀 CRIAR EDGE FUNCTION AGORA

## ❌ Erro
```
FunctionsHttpError: Edge Function returned a non-2xx status code
```

## ✅ Solução
**Edge Function `whatsapp-connect` não existe no novo projeto**

---

## 🚀 CRIAR EM 4 PASSOS

### **1. Criar Edge Function**
- **Supabase Dashboard** → Edge Functions
- **"Create a new function"**
- **Nome**: `whatsapp-connect`
- **Create**

### **2. Environment Variables**
**Edge Functions** → Settings → Adicionar:
```
AUTHENTICATION_API_KEY="cfd9b746ea9e400dc8f4d3e8d57b0180"
SERVER_URL="https://api.urbanautobot.com"
SERVER_PORT="8080"
DATABASE_ENABLED="true"
DATABASE_CONNECTION_URI="file:./evolution.db"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZuZ2Fvb2dxYWd3YWNqZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMzI1MywiZXhwIjoyMDczODc5MjUzfQ.NOtKmJIWXlPhEPPLIS_y9-i0G1ApPoPatgnfyShQ8Z0"
```

### **3. Copiar e Deploy Código**
- **Abrir**: `supabase/functions/whatsapp-connect/index.ts`
- **Copiar** todo o código (Ctrl+A, Ctrl+C)
- **Colar** no editor da Edge Function
- **Deploy**

### **4. Testar**
- **Frontend** → "🔍 Test Edge Function"
- **Deve retornar**: ✅ SUCCESS

---

## ✅ RESULTADO
```
✅ Edge Function criada
✅ Environment Variables configuradas
✅ Código deployado
✅ Test Edge Function passa
✅ Conectar WhatsApp funciona
```

**Execute os 4 passos!** 🚀