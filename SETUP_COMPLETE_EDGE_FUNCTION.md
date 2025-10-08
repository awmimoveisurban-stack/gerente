# 🚀 CONFIGURAÇÃO COMPLETA DA EDGE FUNCTION

## ✅ **CREDENCIAIS OBTIDAS:**
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcxNTY0OSwiZXhwIjoyMDc1MjkxNjQ5fQ.uO21tOTVuHIoP05Z-0GNZCDZXePfRde99vmkVK_0xfg`
- **Project URL**: `bxtuynqauqasigcbocbm.supabase.co`

---

## 🎯 **PASSO A PASSO COMPLETO:**

### **1. 🗄️ CRIAR EDGE FUNCTION NO DASHBOARD**

#### **Acesse:**
- **URL**: https://supabase.com/dashboard/project/bxtuynqauqasigcbocbm/functions
- **Clique**: "Create a new function"
- **Nome**: `whatsapp-connect`

#### **Cole este código:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    const { action, instanceName = 'empresa-whatsapp' } = await req.json()

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
        
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

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

### **2. 🔧 CONFIGURAR ENVIRONMENT VARIABLES**

#### **No Dashboard da Edge Function:**
1. **Vá em** "Settings" da função `whatsapp-connect`
2. **Adicione** estas variáveis:

```bash
SUPABASE_URL=https://bxtuynqauqasigcbocbm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcxNTY0OSwiZXhwIjoyMDc1MjkxNjQ5fQ.uO21tOTVuHIoP05Z-0GNZCDZXePfRde99vmkVK_0xfg
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-da-evolution-api
```

**⚠️ IMPORTANTE:** Substitua `EVOLUTION_API_URL` e `EVOLUTION_API_KEY` pelos seus valores reais!

### **3. 🚀 DEPLOY**

#### **Clique em "Deploy"** no Dashboard

### **4. 🧪 TESTAR**

#### **Execute este script no console do navegador:**
```javascript
// Teste completo da Edge Function
async function testComplete() {
  console.log('🚀 TESTANDO EDGE FUNCTION COMPLETA');
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ Não autenticado');
      return;
    }
    
    console.log('✅ Usuário:', session.user.email);
    
    // Teste básico
    const response = await fetch('https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/whatsapp-connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'test' })
    });
    
    console.log('📊 Status:', response.status);
    const data = await response.json();
    console.log('📊 Dados:', data);
    
    if (response.ok) {
      console.log('✅ EDGE FUNCTION FUNCIONANDO!');
      console.log('🎉 SISTEMA PRONTO!');
    } else {
      console.log('❌ Erro:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testComplete();
```

---

## 🎯 **RESULTADO ESPERADO:**

### **Se tudo estiver correto:**
```json
{
  "success": true,
  "message": "Edge Function working!",
  "user": "gerente@imobiliaria.com",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### **Se houver erro:**
- **404**: Edge Function não existe
- **500**: Environment Variables incorretas
- **401**: Token inválido

---

## 🔧 **PRÓXIMOS PASSOS:**

1. ✅ **Criar** Edge Function (passo 1)
2. ✅ **Configurar** Environment Variables (passo 2)
3. ✅ **Deploy** (passo 3)
4. ✅ **Testar** (passo 4)
5. ✅ **Verificar** se o frontend funciona

---

## 🚨 **PRECISO SABER:**

**Qual é sua Evolution API URL e API Key?**
- **URL**: `https://???`
- **API Key**: `???`

**Com essas informações, o sistema estará 100% funcional!** 🚀





