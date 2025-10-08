# 🚀 SUPABASE EDGE FUNCTIONS - GUIA COMPLETO

Baseado na [documentação oficial do Supabase](https://supabase.com/docs/guides/functions)

---

## 📋 **O QUE SÃO EDGE FUNCTIONS**

### **Definição:**
- **Funções TypeScript** executadas no servidor
- **Distribuídas globalmente** (edge) - próximas aos usuários
- **Desenvolvidas com Deno** - TypeScript nativo
- **Baixa latência** - execução próxima ao usuário

### **Como Funciona:**
1. **Request** → Edge Gateway (relay)
2. **Auth & Policies** → Validação JWT, rate-limits
3. **Edge Runtime** → Executa sua função
4. **Integrations** → APIs Supabase ou terceiros
5. **Response** → Retorna via gateway

---

## 🛠️ **CRIANDO EDGE FUNCTION**

### **MÉTODO 1: Dashboard (Recomendado)**
1. **Acesse** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Vá em** "Edge Functions"
3. **Clique** "Create a new function"
4. **Nome:** `whatsapp-connect`
5. **Cole** o código abaixo

### **MÉTODO 2: CLI**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link projeto
supabase link --project-ref bxtuynqauqasigcbocbm

# Criar função
supabase functions new whatsapp-connect

# Deploy
supabase functions deploy whatsapp-connect
```

---

## 📝 **CÓDIGO DA EDGE FUNCTION**

### **Arquivo: `whatsapp-connect/index.ts`**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Parse request body
    const { action, instanceName = 'empresa-whatsapp' } = await req.json()

    // Evolution API configuration
    const serverUrl = Deno.env.get('EVOLUTION_API_URL')
    const authApiKey = Deno.env.get('EVOLUTION_API_KEY')

    if (!serverUrl || !authApiKey) {
      throw new Error('Evolution API not configured')
    }

    console.log('🚀 Action:', action, 'User:', user.email)

    if (action === 'test') {
      return new Response(JSON.stringify({
        success: true,
        message: 'Edge Function working!',
        user: user.email,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'connect') {
      // 1. Check if instance exists
      let instanceExists = false
      try {
        const checkResponse = await fetch(`${serverUrl}/instance/connectionState/${instanceName}`, {
          method: 'GET',
          headers: { 'apikey': authApiKey },
        })
        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          if (checkData.instance?.instanceName === instanceName) {
            instanceExists = true
          }
        }
      } catch (e) {
        console.log('Instance check failed:', e.message)
      }

      // 2. Create instance if needed
      if (!instanceExists) {
        console.log('Creating instance...')
        const createResponse = await fetch(`${serverUrl}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': authApiKey,
          },
          body: JSON.stringify({
            instanceName: instanceName,
            webhook: `${supabaseUrl}/functions/v1/whatsapp-webhook`,
          }),
        })

        if (!createResponse.ok) {
          const errorText = await createResponse.text()
          throw new Error(`Create instance failed: ${createResponse.status} - ${errorText}`)
        }
        
        // Wait for instance to be ready
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // 3. Get QR Code
      const qrResponse = await fetch(`${serverUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: { 'apikey': authApiKey },
      })

      if (!qrResponse.ok) {
        const errorText = await qrResponse.text()
        throw new Error(`QR code failed: ${qrResponse.status} - ${errorText}`)
      }

      const qrData = await qrResponse.json()
      const qrCode = qrData.base64 || qrData.qrcode || qrData.data?.qrcode || qrData.data?.base64

      if (!qrCode) {
        throw new Error('No QR code in response')
      }

      // 4. Save to database
      const { data: existingConfig } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('manager_id', user.id)
        .eq('instance_name', instanceName)
        .single()

      if (existingConfig) {
        await supabase
          .from('whatsapp_config')
          .update({
            qrcode: qrCode,
            status: 'aguardando_qr',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id)
      } else {
        await supabase
          .from('whatsapp_config')
          .insert({
            manager_id: user.id,
            instance_name: instanceName,
            qrcode: qrCode,
            status: 'aguardando_qr'
          })
      }

      return new Response(JSON.stringify({
        success: true,
        qrcode: qrCode,
        message: 'QR Code generated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      error: 'Action not recognized',
      success: false
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

---

## 🔧 **CONFIGURANDO ENVIRONMENT VARIABLES**

### **No Dashboard:**
1. **Vá em** "Edge Functions" → "whatsapp-connect"
2. **Clique** "Settings"
3. **Adicione** estas variáveis:

```bash
SUPABASE_URL=https://bxtuynqauqasigcbocbm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-da-evolution-api
```

### **Obter Service Role Key:**
1. **Dashboard** → "Settings" → "API"
2. **Copie** "service_role" key (não a anon key!)

---

## 🧪 **TESTANDO EDGE FUNCTION**

### **Teste 1: Básico**
```javascript
// No console do navegador
const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ action: 'test' })
})

console.log(await response.json())
```

### **Teste 2: Conectar WhatsApp**
```javascript
const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    action: 'connect',
    instanceName: 'empresa-whatsapp'
  })
})

const data = await response.json()
console.log(data)
```

---

## 🚀 **DEPLOY E TESTE**

### **1. Criar Edge Function**
- Use o código acima no Dashboard

### **2. Configurar Environment Variables**
- Adicione todas as variáveis necessárias

### **3. Deploy**
- Clique "Deploy" no Dashboard

### **4. Testar**
- Execute os testes acima

---

## 🎯 **RESULTADO ESPERADO**

### **Teste 1 deve retornar:**
```json
{
  "success": true,
  "message": "Edge Function working!",
  "user": "gerente@imobiliaria.com",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### **Teste 2 deve retornar:**
```json
{
  "success": true,
  "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "message": "QR Code generated successfully"
}
```

---

## 🔗 **LINKS ÚTEIS**

- [Documentação Oficial Edge Functions](https://supabase.com/docs/guides/functions)
- [Exemplos GitHub](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [CLI Commands](https://supabase.com/docs/reference/cli/supabase-functions)

---

## 🎉 **PRÓXIMOS PASSOS**

1. ✅ **Criar** Edge Function no Dashboard
2. ✅ **Configurar** Environment Variables
3. ✅ **Deploy** a função
4. ✅ **Testar** com os scripts acima
5. ✅ **Verificar** se o frontend funciona

**Com este guia, você tem tudo para resolver o problema!** 🚀





