# 🚨 SOLUÇÃO CRÍTICA - Edge Function Error 500

## 🔍 Problema Confirmado
**Edge Function retorna erro 500 em TODAS as ações**:
- ❌ `action: 'test'` - Falha
- ❌ `action: 'status'` - Falha  
- ❌ `action: 'connect'` - Falha
- ❌ `action: 'create'` - Falha

**Erro consistente**: `FunctionsHttpError: Edge Function returned a non-2xx status code`

## ⚡ SOLUÇÃO IMEDIATA - 5 Passos

### **Passo 1: Verificar Logs da Edge Function** 🚨
1. **Acesse** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Vá para** seu projeto
3. **Clique** em **"Functions"**
4. **Clique** em **"whatsapp-connect"**
5. **Clique** na aba **"Logs"**
6. **Procure** logs dos últimos 15 minutos
7. **Copie** o erro completo e reporte

### **Passo 2: Verificar Environment Variables** 🚨
1. **Supabase Dashboard** > **Settings** > **Edge Functions**
2. **Verificar** se estas variáveis estão configuradas:
   ```
   SERVER_URL=https://api.evolution-api.com
   AUTHENTICATION_API_KEY=[sua-api-key]
   SUPABASE_URL=[sua-url]
   SUPABASE_SERVICE_ROLE_KEY=[sua-service-key]
   ```

### **Passo 3: Verificar Evolution API** 🚨
```bash
# Testar Evolution API diretamente
curl -X GET "https://api.evolution-api.com/instance/fetchInstances" \
  -H "apikey: YOUR_API_KEY"
```

### **Passo 4: Verificar Database** 🚨
```sql
-- Verificar se tabela existe
SELECT * FROM whatsapp_config LIMIT 1;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'whatsapp_config';
```

### **Passo 5: Redeploy da Edge Function** 🚨
1. **Supabase Dashboard** > **Functions** > **whatsapp-connect**
2. **Clique** em **"Deploy"**
3. **Aguarde** deploy completar
4. **Teste** novamente

## 🔍 Possíveis Causas e Soluções

### **Causa 1: Environment Variables Missing** 🚨
**Sintomas:**
- Edge Function não consegue conectar na Evolution API
- Erro 500 em todas as ações

**Solução:**
```bash
# Configurar no Supabase Dashboard > Settings > Edge Functions
SERVER_URL=https://api.evolution-api.com
AUTHENTICATION_API_KEY=your-api-key-here
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Causa 2: Evolution API Connection Failed** 🚨
**Sintomas:**
- API Key inválida ou expirada
- Evolution API fora do ar

**Solução:**
1. Verificar API Key da Evolution API
2. Testar Evolution API diretamente
3. Verificar se Evolution API está funcionando

### **Causa 3: Database Schema Issues** 🚨
**Sintomas:**
- Erro ao salvar no banco
- RLS bloqueando operações

**Solução:**
```sql
-- Verificar se tabela existe
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES auth.users(id),
  instance_id TEXT,
  instance_name TEXT NOT NULL,
  qrcode TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar políticas RLS
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own config" ON whatsapp_config
  FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Users can insert own config" ON whatsapp_config
  FOR INSERT WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Users can update own config" ON whatsapp_config
  FOR UPDATE USING (auth.uid() = manager_id);
```

### **Causa 4: Edge Function Code Error** 🚨
**Sintomas:**
- Erro na lógica da função
- Parsing de request falha

**Solução:**
1. Verificar logs para erro específico
2. Verificar se código está correto
3. Fazer redeploy da função

## 🧪 Teste Sequencial

### **Teste 1: Environment Variables**
```javascript
// Clique "🔧 Check Env Vars"
// Deve retornar status das environment variables
```

### **Teste 2: Evolution API**
```bash
# Testar Evolution API diretamente
curl -X GET "https://api.evolution-api.com/instance/fetchInstances" \
  -H "apikey: YOUR_API_KEY"
```

### **Teste 3: Database**
```sql
-- Verificar se tabela existe e tem dados
SELECT * FROM whatsapp_config LIMIT 1;
```

### **Teste 4: Edge Function Logs**
1. **Supabase Dashboard** > **Functions** > **whatsapp-connect** > **Logs**
2. **Procurar** logs dos últimos 15 minutos
3. **Identificar** erro específico

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

**1. Execute "🔧 Check Env Vars" para diagnóstico**
**2. Verifique os logs da Edge Function no Supabase Dashboard**
**3. Identifique o erro específico nos logs**
**4. Aplique a solução correspondente**
**5. Faça redeploy da Edge Function**

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
Agora (últimos 15 minutos)

### **Status esperado:**
200 OK com dados

### **Status atual:**
500 Internal Server Error

## 🚨 Urgência

**Este é um problema crítico que afeta TODAS as funcionalidades do WhatsApp!**

**A Edge Function não está funcionando para NENHUMA ação!**

**Ação imediata necessária:**
1. **Verificar logs da Edge Function AGORA**
2. **Verificar environment variables**
3. **Testar Evolution API diretamente**
4. **Fazer redeploy da Edge Function**

**O erro 500 em TODAS as ações indica problema fundamental na Edge Function!** 🚨

**Execute "🔧 Check Env Vars" e verifique os logs AGORA!** ⚡





