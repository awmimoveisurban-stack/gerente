# 🚨 SOLUÇÃO RÁPIDA - Erro 500 Edge Function

## 🔍 Problema Confirmado
**Edge Function retorna erro 500** quando executa `action: 'connect'`.

## ⚡ Ação Imediata

### **1. Verificar Logs da Edge Function**
1. **Acesse** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Vá para** seu projeto
3. **Clique** em **"Functions"**
4. **Clique** em **"whatsapp-connect"**
5. **Clique** na aba **"Logs"**
6. **Procure** logs dos últimos 5 minutos

### **2. Testar Edge Function Passo a Passo**
Use os novos botões criados:
1. **"🔍 Test Edge Function"** - Testa função básica primeiro
2. **"🚨 Check Edge Function Logs"** - Indica onde verificar logs

## 🔍 Possíveis Causas do Erro 500

### **Causa 1: Environment Variables Missing**
```typescript
// Verificar se estas variáveis estão configuradas:
SERVER_URL=https://api.evolution-api.com
AUTHENTICATION_API_KEY=[sua-api-key]
SUPABASE_URL=[sua-url]
SUPABASE_SERVICE_ROLE_KEY=[sua-service-key]
```

### **Causa 2: Evolution API Connection Failed**
- **API Key inválida**
- **URL da Evolution API incorreta**
- **Evolution API fora do ar**

### **Causa 3: Database Error**
- **Tabela `whatsapp_config` não existe**
- **RLS (Row Level Security) bloqueando**
- **Usuário não tem permissão**

### **Causa 4: Logic Error na Edge Function**
- **Erro na lógica de conexão**
- **Endpoint incorreto da Evolution API**
- **Parsing de resposta falha**

## 🛠️ Soluções por Causa

### **Se Environment Variables Missing:**
1. **Supabase Dashboard** > **Settings** > **Edge Functions**
2. **Adicionar** variáveis de ambiente
3. **Fazer redeploy** da função

### **Se Evolution API Connection Failed:**
1. **Verificar** API Key da Evolution API
2. **Testar** Evolution API diretamente:
   ```bash
   curl -X GET "https://api.evolution-api.com/instance/fetchInstances" \
     -H "apikey: YOUR_API_KEY"
   ```

### **Se Database Error:**
1. **Verificar** se tabela `whatsapp_config` existe
2. **Verificar** políticas RLS
3. **Verificar** se usuário é gerente

### **Se Logic Error:**
1. **Verificar** logs para linha específica do erro
2. **Verificar** endpoint da Evolution API
3. **Verificar** parsing da resposta

## 🧪 Teste Sequencial

### **Teste 1: Edge Function Básica**
```javascript
// Clique "🔍 Test Edge Function"
// Deve retornar: {"success": true}
```

### **Teste 2: Ação Connect**
```javascript
// Se Teste 1 passou, testa connect
// Deve identificar onde falha especificamente
```

### **Teste 3: Logs Específicos**
```javascript
// Verificar logs para erro específico
// Identificar linha exata do erro
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

## 🎯 Próxima Ação

**1. Execute "🔍 Test Edge Function" para diagnóstico**
**2. Verifique os logs da Edge Function no Supabase Dashboard**
**3. Identifique o erro específico nos logs**
**4. Aplique a solução correspondente**

## 📞 Informações para Debugging

### **Request que está falhando:**
```json
{
  "action": "connect",
  "instanceName": "empresa-whatsapp"
}
```

### **Timestamp do erro:**
Agora (últimos 5 minutos)

### **Status esperado:**
200 OK com QR Code

### **Status atual:**
500 Internal Server Error

**O erro 500 indica problema interno - precisamos ver os logs para identificar exatamente onde está falhando!** 🔍

**Execute "🔍 Test Edge Function" e verifique os logs AGORA!** ⚡





