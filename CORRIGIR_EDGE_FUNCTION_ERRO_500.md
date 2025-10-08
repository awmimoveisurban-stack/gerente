# 🚨 CORRIGIR ERRO 500 - Edge Function

## 📊 Problema Identificado
- ❌ **Edge Function**: Retornando erro 500 (Internal Server Error)
- ❌ **Status**: FunctionsHttpError: Edge Function returned a non-2xx status code
- ❌ **Causa**: Variáveis de ambiente não configuradas ou Edge Function não deployada

---

## 🔧 SOLUÇÃO IMEDIATA

### **PASSO 1: Configurar Variáveis de Ambiente (5 minutos)**

#### **1.1. Acessar Supabase Dashboard**
1. **Acesse**: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/settings/functions
2. **Clique** em "Environment Variables"
3. **Adicione** as seguintes variáveis:

```
EVOLUTION_API_URL=https://api.urbanautobot.com
EVOLUTION_API_KEY=cfd9b746ea9e400dc8f4d3e8d57b0180
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcxNTY0OSwiZXhwIjoyMDc1MjkxNjQ5fQ.uO21tOTVuHIoP05Z-0GNZCDZXePfRde99vmkVK_0xfg
```

4. **Clique** em "Save"

### **PASSO 2: Verificar/Criar Edge Function (10 minutos)**

#### **2.1. Acessar Edge Functions**
1. **Acesse**: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/functions
2. **Verifique** se existe a função `whatsapp-connect`

#### **2.2. Se NÃO existir, criar:**
1. **Clique** "Create a new function"
2. **Nome**: `whatsapp-connect`
3. **Criar** a função

#### **2.3. Se existir, verificar código:**
1. **Abra** a função `whatsapp-connect`
2. **Verifique** se o código está correto
3. **Se necessário**, copie o código de `supabase/functions/whatsapp-connect/index.ts`

#### **2.4. Deploy**
1. **Clique** "Deploy"
2. **Aguarde** alguns segundos
3. **Verifique** sucesso

### **PASSO 3: Testar Edge Function (5 minutos)**

#### **3.1. Teste Básico**
```javascript
// Execute no console do navegador:
async function testEdgeFunction() {
  try {
    const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || 'test-token'}`
      },
      body: JSON.stringify({
        action: 'test'
      })
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Edge Function funcionando:', data);
    } else {
      const error = await response.text();
      console.log('❌ Erro:', error);
    }
  } catch (error) {
    console.log('❌ Erro:', error);
  }
}

testEdgeFunction();
```

---

## 🧪 SCRIPTS DE TESTE

### **Teste Rápido da Edge Function**
```javascript
// Cole no console:
async function quickTest() {
  const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'test' })
  });
  console.log('Status:', response.status);
  const data = await response.text();
  console.log('Response:', data);
}
quickTest();
```

### **Teste com Autenticação**
```javascript
// Cole no console:
async function testWithAuth() {
  const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || 'test-token'}`
    },
    body: JSON.stringify({ action: 'test' })
  });
  console.log('Status:', response.status);
  const data = await response.text();
  console.log('Response:', data);
}
testWithAuth();
```

---

## 🔧 TROUBLESHOOTING

### **Se erro 500 persistir:**
1. **Verifique** variáveis de ambiente
2. **Redeploy** a Edge Function
3. **Verifique** logs no Supabase Dashboard

### **Se erro 401 (Unauthorized):**
1. **Verifique** se está logado no Supabase
2. **Verifique** token de autenticação
3. **Teste** sem autenticação primeiro

### **Se erro 404 (Not Found):**
1. **Verifique** se a função foi criada
2. **Verifique** se foi deployada
3. **Verifique** URL da função

---

## 🎯 RESULTADO ESPERADO

### **Após Corrigir:**
```
✅ Variáveis de ambiente configuradas
✅ Edge Function deployada
✅ Teste retorna status 200
✅ Sistema funcionando
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Configure** variáveis de ambiente
2. **Deploy** Edge Function
3. **Teste** a função
4. **Teste** integração com WhatsApp

**Execute os passos acima para corrigir o erro 500!**
