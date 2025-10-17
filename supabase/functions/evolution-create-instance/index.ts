import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const evolutionUrl = Deno.env.get('EVOLUTION_API_URL') || 'https://api.urbanautobot.com';
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY') || 'cfd9b746ea9e400dc8f4d3e8d57b0180'; // ✅ FIX: API Key correta
    
    console.log('🔧 Evolution API URL:', evolutionUrl);
    
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // 1. Autenticar usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Usuário autenticado:', user.email);

    // 2. Verificar se já tem instância ativa
    const { data: existing } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('manager_id', user.id)
      .eq('provider', 'evolution-api')
      .is('deleted_at', null)
      .maybeSingle();

    if (existing && existing.status === 'authorized') {
      console.log('⚠️ Instância já existe:', existing.evolution_instance_name);
      return new Response(JSON.stringify({ 
        error: 'Você já tem um WhatsApp conectado. Desconecte primeiro para criar uma nova instância.' 
      }), { 
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Se existe instância pending antiga, deletar ela primeiro
    if (existing && existing.status === 'pending') {
      console.log('🧹 Deletando instância pending antiga...');
      
      // Tentar deletar do Evolution (pode falhar se não existir)
      try {
        await fetch(`${evolutionUrl}/instance/delete/${existing.evolution_instance_name}`, {
          method: 'DELETE',
          headers: { 'apikey': evolutionApiKey }
        });
      } catch (e) {
        console.warn('⚠️ Erro ao deletar instância antiga (ignorando):', e);
      }

      // Deletar do banco
      await supabase
        .from('whatsapp_config')
        .delete()
        .eq('id', existing.id);
    }

    // 4. Gerar nome único para instância
    const instanceName = `gerente_${user.id.replace(/-/g, '').substring(0, 12)}`;
    const instanceToken = crypto.randomUUID();

    console.log('🔄 Criando instância Evolution:', instanceName);

    // 5. Criar instância no Evolution API (v2 format)
    const createResponse = await fetch(`${evolutionUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': evolutionApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: instanceName,
        qrcode: true,
        // ✅ Evolution API v2: Webhook como objeto
        webhook: {
          url: 'https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/evolution-webhook',
          enabled: true,
          webhookByEvents: false,
          webhookBase64: false,
          events: [
            "MESSAGES_UPSERT",    // ✅ v2: MAIÚSCULAS
            "MESSAGES_UPDATE",
            "MESSAGES_DELETE",
            "SEND_MESSAGE",
            "CONNECTION_UPDATE"
          ]
        },
        // ✅ Evolution API v2: Settings separado
        settings: {
          rejectCall: false,
          msgCall: '',
          groupsIgnore: true,
          alwaysOnline: true,
          readMessages: false,
          readStatus: false,
          syncFullHistory: false
        }
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Erro Evolution API:', errorText);
      throw new Error(`Erro ao criar instância: ${errorText}`);
    }

    const evolutionData = await createResponse.json();
    console.log('✅ Resposta Evolution API:', evolutionData);

    // 6. Extrair QR Code
    let qrCodeBase64 = null;
    if (evolutionData.qrcode?.base64) {
      qrCodeBase64 = evolutionData.qrcode.base64;
    } else if (evolutionData.qrcode?.code) {
      // Se retornou apenas o código, gerar base64
      const qrCodeText = evolutionData.qrcode.code;
      qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeText)}`;
    }

    console.log('📱 QR Code:', qrCodeBase64 ? 'Gerado ✅' : 'Não disponível ❌');

    // 7. Salvar no banco
    const configData = {
      manager_id: user.id,
      provider: 'evolution-api',
      evolution_instance_name: instanceName,
      evolution_instance_token: instanceToken,
      status: 'pending', // Aguardando scan do QR
      qr_code: qrCodeBase64,
      auto_created: true,
      connected_at: new Date().toISOString()
    };

    const { data: inserted, error: insertError } = await supabase
      .from('whatsapp_config')
      .insert([configData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao salvar no banco:', insertError);
      
      // Rollback: Deletar instância do Evolution
      try {
        await fetch(`${evolutionUrl}/instance/delete/${instanceName}`, {
          method: 'DELETE',
          headers: { 'apikey': evolutionApiKey }
        });
      } catch (e) {
        console.warn('⚠️ Erro no rollback:', e);
      }

      throw insertError;
    }

    console.log('✅ Salvo no banco:', inserted.id);

    // 8. Retornar dados
    return new Response(JSON.stringify({
      success: true,
      instanceName: instanceName,
      instanceToken: instanceToken,
      qrCode: qrCodeBase64,
      configId: inserted.id,
      message: '✅ Instância criada com sucesso! Escaneie o QR Code para conectar.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro desconhecido ao criar instância'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

