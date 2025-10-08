#!/bin/bash

# 🚀 SCRIPT PARA CRIAR EDGE FUNCTION AUTOMATICAMENTE
# Baseado na documentação oficial do Supabase

echo "🚀 CRIANDO EDGE FUNCTION WHATSAPP-CONNECT"
echo "📋 Baseado na documentação oficial: https://supabase.com/docs/guides/functions"
echo "---"

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado"
    echo "💡 Instale com: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"

# Login no Supabase
echo "🔐 Fazendo login no Supabase..."
supabase login

# Link com o projeto
echo "🔗 Linkando com o projeto..."
supabase link --project-ref bxtuynqauqasigcbocbm

# Criar Edge Function
echo "📝 Criando Edge Function whatsapp-connect..."
supabase functions new whatsapp-connect

# Criar arquivo index.ts
echo "📝 Criando arquivo index.ts..."
cat > supabase/functions/whatsapp-connect/index.ts << 'EOF'
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
EOF

echo "✅ Arquivo index.ts criado"

# Deploy da Edge Function
echo "🚀 Fazendo deploy da Edge Function..."
supabase functions deploy whatsapp-connect

echo "✅ Edge Function criada e deployada com sucesso!"
echo "🔧 Agora configure as Environment Variables no Dashboard:"
echo "   - SUPABASE_URL=https://bxtuynqauqasigcbocbm.supabase.co"
echo "   - SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]"
echo "   - EVOLUTION_API_URL=[sua-evolution-api-url]"
echo "   - EVOLUTION_API_KEY=[sua-evolution-api-key]"
echo ""
echo "🧪 Teste com o script: test-edge-function.js"
