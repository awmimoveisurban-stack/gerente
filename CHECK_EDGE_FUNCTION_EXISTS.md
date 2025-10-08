# 🔍 VERIFICAR SE EDGE FUNCTION EXISTE

## ❌ Erro Atual
```
FunctionsHttpError: Edge Function returned a non-2xx status code
```

## 🔍 DIAGNÓSTICO
- **Correção aplicada**: ✅ Frontend usando ação `connect`
- **Problema atual**: Edge Function `whatsapp-connect` provavelmente não existe

---

## 🚀 VERIFICAÇÕES NECESSÁRIAS

### **PASSO 1: Verificar se Edge Function Existe**
1. **Supabase Dashboard** → Edge Functions
2. **Verificar** se `whatsapp-connect` aparece na lista
3. **Se não existe**: ❌ **PROBLEMA IDENTIFICADO**

### **PASSO 2: Se Edge Function não existe - CRIAR**
1. **Edge Functions** → "Create a new function"
2. **Nome**: `whatsapp-connect`
3. **Criar** a função

### **PASSO 3: Configurar Environment Variables**
1. **Edge Functions** → Settings
2. **Adicionar**:
```
AUTHENTICATION_API_KEY="cfd9b746ea9e400dc8f4d3e8d57b0180"
SERVER_URL="https://api.urbanautobot.com"
SERVER_PORT="8080"
DATABASE_ENABLED="true"
DATABASE_CONNECTION_URI="file:./evolution.db"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHZuZ2Fvb2dxYWd3YWNqZWVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwMzI1MywiZXhwIjoyMDczODc5MjUzfQ.NOtKmJIWXlPhEPPLIS_y9-i0G1ApPoPatgnfyShQ8Z0"
```

### **PASSO 4: Copiar Código da Edge Function**
1. **Abrir** arquivo: `supabase/functions/whatsapp-connect/index.ts`
2. **Selecionar TODO** o código (Ctrl+A)
3. **Copiar** (Ctrl+C)

### **PASSO 5: Colar no Dashboard**
1. **No editor** da Edge Function `whatsapp-connect`
2. **Selecionar tudo** (Ctrl+A)
3. **Delete** código padrão
4. **Cole** novo código (Ctrl+V)

### **PASSO 6: Deploy**
1. **Clique** "Deploy"
2. **Aguarde** alguns segundos
3. **Verifique** se aparece mensagem de sucesso

---

## 🧪 TESTAR APÓS CRIAR

### **PASSO 7: Testar Edge Function**
1. **Frontend** → `/gerente/whatsapp`
2. **Clique** "🔍 Test Edge Function"
3. **Resultado esperado**: ✅ SUCCESS

### **PASSO 8: Testar Conexão WhatsApp**
1. **Se o teste passou**, clique "Conectar WhatsApp"
2. **Deve funcionar** sem erro
3. **QR Code** deve aparecer

---

## 🎯 RESULTADO ESPERADO

### **Após Criar Edge Function:**
```
✅ Edge Function whatsapp-connect existe
✅ Environment Variables configuradas
✅ Código copiado e deployado
✅ Test Edge Function passa
✅ Conectar WhatsApp funciona
✅ QR Code aparece
✅ Sistema funcionando perfeitamente
```

---

## 🎉 CONCLUSÃO

**O problema é que a Edge Function não existe no novo projeto!**

**Execute os 8 passos acima para criar a Edge Function!** 🚀

**Após criar, o sistema funcionará perfeitamente!** ✅





