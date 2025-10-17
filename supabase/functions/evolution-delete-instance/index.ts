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
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY') || 'cfd9b746ea9e400dc8f4d3e8d57b0180';
    
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

    // 2. Buscar configuração atual do WhatsApp
    const { data: config } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('manager_id', user.id)
      .eq('provider', 'evolution-api')
      .is('deleted_at', null)
      .maybeSingle();

    if (!config) {
      console.log('⚠️ Nenhuma instância encontrada para deletar');
      return new Response(JSON.stringify({ 
        error: 'Nenhuma instância encontrada para deletar' 
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const instanceName = config.evolution_instance_name;
    const instanceToken = config.evolution_instance_token;

    console.log('🗑️ Deletando instância:', instanceName);

    let evolutionLogoutSuccess = false;
    let evolutionDeleteSuccess = false;

    // 3. Fazer logout do WhatsApp (desconectar sessão)
    try {
      console.log('📤 Fazendo logout da sessão WhatsApp...');
      const logoutResponse = await fetch(
        `${evolutionUrl}/instance/logout/${instanceName}`,
        {
          method: 'DELETE',
          headers: { 'apikey': instanceToken }
        }
      );

      if (logoutResponse.ok) {
        console.log('✅ Logout realizado com sucesso');
        evolutionLogoutSuccess = true;
      } else {
        const errorText = await logoutResponse.text();
        console.warn('⚠️ Erro no logout (continuando):', errorText);
      }
    } catch (logoutError) {
      console.warn('⚠️ Erro no logout (continuando):', logoutError);
    }

    // 4. Deletar instância do Evolution API
    try {
      console.log('🗑️ Deletando instância do Evolution...');
      const deleteResponse = await fetch(
        `${evolutionUrl}/instance/delete/${instanceName}`,
        {
          method: 'DELETE',
          headers: { 'apikey': evolutionApiKey }
        }
      );

      if (deleteResponse.ok) {
        console.log('✅ Instância deletada do Evolution com sucesso');
        evolutionDeleteSuccess = true;
      } else {
        const errorText = await deleteResponse.text();
        console.warn('⚠️ Erro ao deletar instância (continuando limpeza local):', errorText);
      }
    } catch (deleteError) {
      console.warn('⚠️ Erro ao deletar instância (continuando limpeza local):', deleteError);
    }

    // 5. Deletar do banco (SEMPRE, mesmo se falhar no Evolution)
    // Usar soft delete para manter auditoria
    const { error: dbError } = await supabase
      .from('whatsapp_config')
      .update({ 
        deleted_at: new Date().toISOString(),
        status: 'disconnected'
      })
      .eq('id', config.id);

    if (dbError) {
      console.error('❌ Erro ao marcar como deletado no banco:', dbError);
      throw dbError;
    }

    console.log('✅ Instância marcada como deletada no banco');

    // 6. Retornar sucesso
    return new Response(JSON.stringify({
      success: true,
      instanceName: instanceName,
      evolutionLogoutSuccess,
      evolutionDeleteSuccess,
      message: evolutionDeleteSuccess 
        ? '✅ WhatsApp desconectado e instância deletada com sucesso!' 
        : '✅ WhatsApp desconectado localmente (instância pode já ter sido removida do Evolution)'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro desconhecido ao deletar instância'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
