# 🚨 Edge Function Error 500 - Verificar Logs Imediatamente

## 🔍 Problema Identificado
**Edge Function retorna erro 500 (Internal Server Error)** quando tenta executar `action: 'connect'`.

## 📋 Como Verificar os Logs

### **Método 1: Supabase Dashboard**
1. **Acesse** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Vá para** seu projeto
3. **Clique** em **"Functions"** no menu lateral
4. **Clique** em **"whatsapp-connect"**
5. **Clique** na aba **"Logs"**
6. **Procure** por logs recentes (últimos 5 minutos)
7. **Procure** por erros em vermelho

### **Método 2: Via CLI (se configurado)**
```bash
supabase functions logs whatsapp-connect --follow
```

## 🔍 O que Procurar nos Logs

### **Logs Esperados:**
```
🚀 Edge Function started
Request method: POST
Request URL: https://...
🔐 Starting request processing...
📝 Request body parsed: {action: "connect", instanceName: "empresa-whatsapp"}
🔑 Auth header exists: true
Authenticated user: [user-id]
🎯 Extracted action: connect
🎯 Extracted instanceName: empresa-whatsapp
Getting QR code for instance: empresa-whatsapp
```

### **Possíveis Erros:**
```
❌ Error in whatsapp-connect function: [erro específico]
❌ QR code error: [status] [mensagem]
❌ Update QR error: [erro de banco]
❌ Environment variables missing
❌ Evolution API connection failed
```

## 🎯 Próximos Passos

### **Se encontrar logs de erro:**
1. **Copie** o erro completo
2. **Identifique** em qual linha falha
3. **Verifique** se é problema de:
   - Evolution API
   - Banco de dados
   - Environment variables
   - Lógica da função

### **Se não encontrar logs:**
1. **Edge Function pode não estar deployada** com as últimas mudanças
2. **Verificar** se está usando a versão correta
3. **Fazer deploy** da Edge Function novamente

## 🔧 Soluções Rápidas

### **Solução 1: Verificar Environment Variables**
```typescript
// Verificar se estas variáveis estão configuradas:
SERVER_URL=https://api.evolution-api.com
AUTHENTICATION_API_KEY=[sua-api-key]
SUPABASE_URL=[sua-url]
SUPABASE_SERVICE_ROLE_KEY=[sua-service-key]
```

### **Solução 2: Testar Evolution API Diretamente**
```bash
curl -X GET "https://api.evolution-api.com/instance/connect/empresa-whatsapp" \
  -H "apikey: YOUR_API_KEY"
```

### **Solução 3: Verificar se Instância Existe**
```bash
curl -X GET "https://api.evolution-api.com/instance/fetchInstances" \
  -H "apikey: YOUR_API_KEY"
```

## 📊 Informações para Debugging

### **Request que está falhando:**
```json
{
  "action": "connect",
  "instanceName": "empresa-whatsapp"
}
```

### **Headers enviados:**
```
Authorization: Bearer [jwt-token]
Content-Type: application/json
```

### **Timestamp do erro:**
Agora (últimos 5 minutos)

## 🎯 Ação Imediata

**1. Verifique os logs da Edge Function AGORA**
**2. Copie o erro completo dos logs**
**3. Identifique em qual linha está falhando**
**4. Reporte o erro específico encontrado**

**O erro 500 indica problema interno na Edge Function - precisamos ver os logs para identificar exatamente onde está falhando!** 🔍





