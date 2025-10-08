import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message, leadId } = await req.json();

    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ error: 'phoneNumber e message são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter token de autenticação do header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar usuário
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar configuração do WhatsApp
    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('status', 'conectado')
      .single();

    if (configError || !config) {
      console.error('Erro ao buscar configuração:', configError);
      return new Response(
        JSON.stringify({ error: 'WhatsApp não está conectado. Configure primeiro em /gerente/whatsapp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar mensagem via Evolution API
    const serverUrl = Deno.env.get('SERVER_URL');
    const apiKey = Deno.env.get('AUTHENTICATION_API_KEY');

    if (!serverUrl || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração de servidor não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Formatar número no padrão internacional (55 + DDD + número)
    const formattedNumber = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;

    const evolutionResponse = await fetch(`${serverUrl}/message/sendText/${config.instance_name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: `${formattedNumber}@s.whatsapp.net`,
        text: message
      })
    });

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.text();
      console.error('Erro da Evolution API:', errorData);
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar mensagem via WhatsApp API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Registrar interação no banco de dados
    if (leadId) {
      const { error: interactionError } = await supabase
        .from('interactions')
        .insert({
          user_id: user.id,
          lead_id: leadId,
          tipo: 'whatsapp',
          descricao: `Mensagem enviada via WhatsApp: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
        });

      if (interactionError) {
        console.error('Erro ao registrar interação:', interactionError);
      }

      // Atualizar última interação do lead
      const { error: updateError } = await supabase
        .from('leads')
        .update({ ultima_interacao: new Date().toISOString() })
        .eq('id', leadId);

      if (updateError) {
        console.error('Erro ao atualizar lead:', updateError);
      }
    }

    const result = await evolutionResponse.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
