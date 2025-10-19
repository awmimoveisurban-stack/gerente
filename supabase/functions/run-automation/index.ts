// =====================================================
// EDGE FUNCTION: EXECUTAR AUTOMAÇÃO
// Criado: 2025-10-12
// Objetivo: Executar regras de automação agendadas
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 Iniciando execução de automações...');

    // Executar todas as regras ativas
    const { data, error } = await supabase
      .rpc('executar_todas_automacoes');

    if (error) throw error;

    console.log('✅ Automações executadas:', data);

    return new Response(
      JSON.stringify({
        success: true,
        resultado: data,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Erro ao executar automações:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/* 
COMO USAR:

1. Deploy desta Edge Function no Supabase

2. Configurar cron job (Cron-Job.org ou similar):
   - Horário: Diariamente às 08:00
   - URL: https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/run-automation
   - Method: POST
   - Headers:
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcxNTY0OSwiZXhwIjoyMDc1MjkxNjQ5fQ.uO21tOTVuHIoP05Z-0GNZCDZXePfRde99vmkVK_0xfg
     * Content-Type: application/json

3. Ou chamar manualmente:
   curl -X POST https://bxtuynqauqasigcbocbm.supabase.co/functions/v1/run-automation \
     -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json"
*/









