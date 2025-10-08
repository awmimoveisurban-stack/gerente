# 🚨 Análise Detalhada - Edge Function Error 500

## 🔍 Problema Confirmado
**Edge Function retorna erro 500** em **MÚLTIPLAS ações**:
- ❌ `action: 'connect'` - Falha
- ❌ `action: 'status'` - Falha  
- ❌ Outras ações podem estar falhando

**Erro específico**: `FunctionsHttpError: Edge Function returned a non-2xx status code`

## 🎯 Ações Afetadas
1. **"🔄 Check API Status"** - `action: 'status'` ❌
2. **"🧪 Test Evolution API"** - `action: 'connect'` ❌
3. **"Conectar WhatsApp"** - `action: 'create'` + `action: 'connect'` ❌

## 🔍 Possíveis Causas

### **Causa 1: Environment Variables Missing** 🚨
```typescript
// Variáveis que podem estar faltando:
SERVER_URL=https://api.evolution-api.com
AUTHENTICATION_API_KEY=[sua-api-key]
SUPABASE_URL=[sua-url]
SUPABASE_SERVICE_ROLE_KEY=[sua-service-key]
```

### **Causa 2: Evolution API Connection Failed** 🚨
- **API Key inválida ou expirada**
- **Evolution API fora do ar**
- **URL incorreta da Evolution API**

### **Causa 3: Database Schema Issues** 🚨
- **Tabela `whatsapp_config` não existe**
- **RLS (Row Level Security) mal configurado**
- **Usuário não tem permissão**

### **Causa 4: Edge Function Logic Error** 🚨
- **Erro na lógica de parsing**
- **Endpoint incorreto da Evolution API**
- **Error handling inadequado**

## 🛠️ Soluções por Prioridade

### **Solução 1: Verificar Environment Variables** ⚡
1. **Supabase Dashboard** > **Settings** > **Edge Functions**
2. **Verificar** se todas as variáveis estão configuradas:
   - `SERVER_URL`
   - `AUTHENTICATION_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### **Solução 2: Verificar Evolution API** ⚡
```bash
# Testar Evolution API diretamente
curl -X GET "https://api.evolution-api.com/instance/fetchInstances" \
  -H "apikey: YOUR_API_KEY"
```

### **Solução 3: Verificar Database** ⚡
```sql
-- Verificar se tabela existe
SELECT * FROM whatsapp_config LIMIT 1;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'whatsapp_config';
```

### **Solução 4: Verificar Edge Function Logs** ⚡
1. **Supabase Dashboard** > **Functions** > **whatsapp-connect** > **Logs**
2. **Procurar** logs dos últimos 10 minutos
3. **Identificar** erro específico

## 🧪 Teste Sequencial

### **Teste 1: Edge Function Básica**
```javascript
// Usar botão "🔍 Test Edge Function"
// Deve testar action: 'test' primeiro
```

### **Teste 2: Verificar Logs**
```javascript
// Se Teste 1 falhar, verificar logs
// Identificar linha específica do erro
```

### **Teste 3: Environment Variables**
```javascript
// Verificar se variáveis estão configuradas
// Verificar se API Key é válida
```

## 📋 Checklist de Verificação

### **Edge Function:**
- [ ] Edge Function está deployada
- [ ] Environment variables configuradas
- [ ] Logs mostram erro específico
- [ ] Usuário autenticado corretamente

### **Evolution API:**
- [ ] API Key válida
- [ ] URL correta da Evolution API
- [ ] Evolution API respondendo
- [ ] Instância pode ser criada

### **Database:**
- [ ] Tabela `whatsapp_config` existe
- [ ] RLS configurado corretamente
- [ ] Usuário tem permissão
- [ ] Dados podem ser inseridos

## 🎯 Ação Imediata

### **1. Verificar Logs da Edge Function**
1. **Supabase Dashboard** > **Functions** > **whatsapp-connect** > **Logs**
2. **Procurar** logs dos últimos 10 minutos
3. **Identificar** erro específico

### **2. Testar Edge Function Básica**
1. **Clique** "🔍 Test Edge Function"
2. **Deve** testar `action: 'test'` primeiro
3. **Se falhar**, problema é fundamental

### **3. Verificar Environment Variables**
1. **Supabase Dashboard** > **Settings** > **Edge Functions**
2. **Verificar** se todas as variáveis estão configuradas

## 📊 Informações para Debugging

### **Request que está falhando:**
```json
{
  "action": "status",
  "instanceName": "empresa-whatsapp"
}
```

### **Headers enviados:**
```
Authorization: Bearer [jwt-token]
Content-Type: application/json
```

### **Timestamp do erro:**
Agora (últimos 10 minutos)

### **Status esperado:**
200 OK com dados de status

### **Status atual:**
500 Internal Server Error

## 🚨 Urgência

**Este é um problema crítico que afeta TODAS as funcionalidades do WhatsApp!**

**Ação imediata necessária:**
1. **Verificar logs da Edge Function AGORA**
2. **Verificar environment variables**
3. **Testar Evolution API diretamente**

**O erro 500 em múltiplas ações indica problema fundamental na Edge Function!** 🚨





