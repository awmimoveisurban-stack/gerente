# 🚀 DEPLOY MANUAL DA EDGE FUNCTION

## 📊 Problema Identificado
- ❌ **Edge Function**: Erro 500 - endpoint incorreto
- ✅ **Correção**: Endpoint `/instance/create/empresa-whatsapp` → `/instance/create`
- 🔧 **Solução**: Deploy manual via Supabase Dashboard

---

## 🚀 SOLUÇÃO MANUAL

### **PASSO 1: Acessar Supabase Dashboard (5 minutos)**

1. **Acesse**: https://supabase.com/dashboard
2. **Faça login** na sua conta
3. **Selecione** o projeto: `bxtuynqauqasigcbocbm`

### **PASSO 2: Navegar para Edge Functions (5 minutos)**

1. **Clique** em "Edge Functions" no menu lateral
2. **Localize** a função `whatsapp-connect`
3. **Clique** em "Edit" ou "Deploy"

### **PASSO 3: Copiar Código Corrigido (5 minutos)**

Copie o código corrigido do arquivo:
`supabase/functions/whatsapp-connect/index.ts`

**Mudança principal:**
```typescript
// ANTES (incorreto):
const createResponse = await makeAPIRequest(`${serverUrl}/instance/create/${instanceName}`, {

// DEPOIS (correto):
const createResponse = await makeAPIRequest(`${serverUrl}/instance/create`, {
```

### **PASSO 4: Deploy da Função (5 minutos)**

1. **Cole** o código corrigido
2. **Clique** em "Deploy"
3. **Aguarde** o deploy completar
4. **Verifique** se não há erros

### **PASSO 5: Testar Edge Function (5 minutos)**

Execute no console:
```javascript
// Testar Edge Function corrigida
async function testFixedEdgeFunction() {
  console.log('🧪 Testando Edge Function corrigida...');
  
  if (!window.supabase) {
    console.log('❌ Supabase client não encontrado');
    return;
  }
  
  const { data: { session }, error } = await window.supabase.auth.getSession();
  
  if (error || !session) {
    console.log('❌ Erro na sessão:', error);
    return;
  }
  
  console.log('✅ Sessão ativa:', session.user?.email);
  
  // Testar Edge Function com ação de conexão
  console.log('\n📋 Testando Edge Function corrigida...');
  
  const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ action: 'connect' })
  });
  
  console.log('Edge Function Status:', response.status);
  const data = await response.text();
  console.log('Response:', data);
  
  if (response.status === 200) {
    console.log('🎉 Edge Function funcionando corretamente!');
  } else {
    console.log('⚠️ Edge Function ainda com problemas');
  }
}
testFixedEdgeFunction();
```

---

## 🔧 ALTERNATIVA: Deploy via CLI

Se preferir usar o CLI:

```bash
# 1. Fazer login
npx supabase login

# 2. Deploy da função
npx supabase functions deploy whatsapp-connect

# 3. Verificar logs
npx supabase functions logs whatsapp-connect
```

---

## 🎯 RESULTADO ESPERADO

### **Após Deploy:**
```
✅ Edge Function deployada
✅ Endpoint corrigido
✅ Status 200 (funcionando)
✅ WhatsApp connection funcionando
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Deploy** a Edge Function corrigida
2. **Teste** a funcionalidade
3. **Verifique** o status da conexão WhatsApp
4. **Monitore** os logs

**Deploy a Edge Function corrigida via Dashboard!** 🔧
