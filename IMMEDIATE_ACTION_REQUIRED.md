# 🚨 AÇÃO IMEDIATA REQUERIDA - Edge Function Error 500

## 🔍 Problema Crítico Identificado
**Edge Function retorna erro 500 em MÚLTIPLAS ações**:
- ❌ `action: 'test'` - Falha
- ❌ `action: 'status'` - Falha  
- ❌ `action: 'connect'` - Falha
- ❌ Todas as ações estão falhando

**Isso indica um problema fundamental na Edge Function!**

## ⚡ AÇÃO IMEDIATA - 3 Passos

### **Passo 1: Verificar Logs da Edge Function** 🚨
1. **Acesse** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Vá para** seu projeto
3. **Clique** em **"Functions"**
4. **Clique** em **"whatsapp-connect"**
5. **Clique** na aba **"Logs"**
6. **Procure** logs dos últimos 15 minutos
7. **Copie** o erro completo

### **Passo 2: Verificar Environment Variables** 🚨
1. **Supabase Dashboard** > **Settings** > **Edge Functions**
2. **Verificar** se estas variáveis estão configuradas:
   - `SERVER_URL=https://api.evolution-api.com`
   - `AUTHENTICATION_API_KEY=[sua-api-key]`
   - `SUPABASE_URL=[sua-url]`
   - `SUPABASE_SERVICE_ROLE_KEY=[sua-service-key]`

### **Passo 3: Testar Evolution API** 🚨
```bash
# Testar Evolution API diretamente
curl -X GET "https://api.evolution-api.com/instance/fetchInstances" \
  -H "apikey: YOUR_API_KEY"
```

## 🔍 Possíveis Causas (Por Prioridade)

### **Causa 1: Environment Variables Missing** 🚨
**Sintomas:**
- Edge Function não consegue conectar na Evolution API
- Erro 500 em todas as ações

**Solução:**
1. Configurar environment variables no Supabase
2. Fazer redeploy da Edge Function

### **Causa 2: Evolution API Connection Failed** 🚨
**Sintomas:**
- API Key inválida ou expirada
- Evolution API fora do ar

**Solução:**
1. Verificar API Key da Evolution API
2. Testar Evolution API diretamente

### **Causa 3: Database Schema Issues** 🚨
**Sintomas:**
- Erro ao salvar no banco
- RLS bloqueando operações

**Solução:**
1. Verificar se tabela `whatsapp_config` existe
2. Verificar políticas RLS

### **Causa 4: Edge Function Deployment Issue** 🚨
**Sintomas:**
- Edge Function não está deployada
- Versão incorreta deployada

**Solução:**
1. Fazer redeploy da Edge Function
2. Verificar se está usando versão correta

## 🧪 Teste Sequencial

### **Teste 1: Edge Function Básica**
```javascript
// Clique "🔧 Check Env Vars"
// Deve retornar status das environment variables
```

### **Teste 2: Verificar Logs**
```javascript
// Se Teste 1 falhar, verificar logs
// Identificar linha específica do erro
```

### **Teste 3: Evolution API**
```bash
# Testar Evolution API diretamente
curl -X GET "https://api.evolution-api.com/instance/fetchInstances" \
  -H "apikey: YOUR_API_KEY"
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

**1. Execute "🔧 Check Env Vars" para diagnóstico**
**2. Verifique os logs da Edge Function no Supabase Dashboard**
**3. Identifique o erro específico nos logs**
**4. Reporte o erro encontrado para solução específica**

## 📊 Informações para Debugging

### **Request que está falhando:**
```json
{
  "action": "test"
}
```

### **Headers enviados:**
```
Authorization: Bearer [jwt-token]
Content-Type: application/json
```

### **Timestamp do erro:**
Agora (últimos 15 minutos)

### **Status esperado:**
200 OK com dados de environment variables

### **Status atual:**
500 Internal Server Error

## 🚨 Urgência

**Este é um problema crítico que afeta TODAS as funcionalidades do WhatsApp!**

**A Edge Function não está funcionando para NENHUMA ação!**

**Ação imediata necessária:**
1. **Verificar logs da Edge Function AGORA**
2. **Verificar environment variables**
3. **Testar Evolution API diretamente**

**O erro 500 em TODAS as ações indica problema fundamental na Edge Function!** 🚨

**Execute "🔧 Check Env Vars" e verifique os logs AGORA!** ⚡





