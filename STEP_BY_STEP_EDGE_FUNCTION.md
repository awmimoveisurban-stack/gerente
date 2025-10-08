# 📋 PASSO A PASSO - Edge Function

## ❌ Problema
```
FunctionsHttpError: Edge Function returned a non-2xx status code
```

## ✅ Solução
**Criar Edge Function `whatsapp-connect` no novo projeto**

---

## 🚀 PASSO A PASSO

### **1. Abrir Supabase Dashboard**
- **URL**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Login** na sua conta
- **Selecionar** projeto `bxtuynqauqasigcbocbm`

### **2. Ir para Edge Functions**
- **Menu lateral** → **Edge Functions**
- **Verificar** se `whatsapp-connect` existe na lista

### **3. Se NÃO EXISTE - Criar**
- **Botão** "Create a new function"
- **Nome**: `whatsapp-connect`
- **Create**

### **4. Configurar Variáveis**
- **Edge Functions** → **Settings**
- **Adicionar**:
```
AUTHENTICATION_API_KEY="cfd9b746ea9e400dc8f4d3e8d57b0180"
SERVER_URL="https://api.urbanautobot.com"
SERVER_PORT="8080"
DATABASE_ENABLED="true"
DATABASE_CONNECTION_URI="file:./evolution.db"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZuZ2Fvb2dxYWd3YWNqZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMzI1MywiZXhwIjoyMDczODc5MjUzfQ.NOtKmJIWXlPhEPPLIS_y9-i0G1ApPoPatgnfyShQ8Z0"
```

### **5. Copiar Código**
- **Abrir**: `supabase/functions/whatsapp-connect/index.ts`
- **Selecionar tudo** (Ctrl+A)
- **Copiar** (Ctrl+C)

### **6. Colar e Deploy**
- **No editor** da Edge Function
- **Selecionar tudo** (Ctrl+A)
- **Deletar** código padrão
- **Colar** novo código (Ctrl+V)
- **Deploy**

### **7. Testar**
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
✅ Sistema funcionando
```

**Execute os 7 passos!** 🚀





