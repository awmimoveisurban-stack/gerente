// =====================================================
// EDGE FUNCTION: ENVIAR NOTIFICAÇÕES DE PERFORMANCE
// Criado: 2025-10-12
// Objetivo: Enviar notificações push/email sobre alertas de performance
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') !;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔔 Iniciando envio de notificações de performance...');

    // Buscar corretores com problemas
    const { data: performances, error } = await supabase
      .from('v_corretor_performance')
      .select('*');

    if (error) throw error;

    if (!performances || performances.length === 0) {
      console.log('ℹ️ Nenhum corretor encontrado');
      return new Response(
        JSON.stringify({ message: 'Nenhum corretor encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Analisando ${performances.length} corretor(es)...`);

    const notificationsToSend: any[] = [];

    for (const perf of performances) {
      const alerts: string[] = [];

      // Alerta 1: Leads sem resposta
      if (perf.leads_sem_resposta && perf.leads_sem_resposta > 0) {
        alerts.push(`🚨 ${perf.leads_sem_resposta} lead(s) sem resposta há mais de 24h`);
      }

      // Alerta 2: Tempo de resposta alto
      if (perf.tempo_medio_primeira_resposta && perf.tempo_medio_primeira_resposta > 120) {
        const horas = Math.round(perf.tempo_medio_primeira_resposta / 60);
        alerts.push(`⏰ Tempo médio de resposta: ${horas}h (muito alto!)`);
      }

      // Alerta 3: Baixa conversão
      if (perf.total_leads >= 10 && perf.taxa_conversao < 40) {
        alerts.push(`📉 Taxa de conversão baixa: ${perf.taxa_conversao}% (meta: 50%)`);
      }

      // Alerta 4: Score baixo
      if (perf.score_qualidade && perf.score_qualidade < 50) {
        alerts.push(`⭐ Score de qualidade baixo: ${perf.score_qualidade}/100`);
      }

      // Se tiver alertas, criar notificação
      if (alerts.length > 0) {
        notificationsToSend.push({
          user_id: perf.user_id,
          corretor_nome: perf.corretor_nome,
          email: perf.email,
          alerts,
          severidade: alerts.length >= 3 ? 'critica' : alerts.length >= 2 ? 'alta' : 'media'
        });
      }
    }

    console.log(`📧 Enviando ${notificationsToSend.length} notificação(ões)...`);

    // Criar notificações no banco
    const notificationRecords = [];

    for (const notif of notificationsToSend) {
      // Criar notificação interna
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: notif.user_id,
          title: `Alerta de Performance - ${notif.severidade.toUpperCase()}`,
          message: notif.alerts.join('\n'),
          type: 'alert',
          read: false
        });

      if (notifError) {
        console.error('❌ Erro ao criar notificação:', notifError);
      } else {
        console.log(`✅ Notificação criada para ${notif.corretor_nome}`);
        notificationRecords.push(notif);
      }

      // TODO: Integrar com serviço de email (SendGrid, Resend, etc)
      // await enviarEmail(notif.email, notif.alerts);
      
      // TODO: Integrar com push notifications (OneSignal, Firebase, etc)
      // await enviarPush(notif.user_id, notif.alerts);
    }

    // Também notificar gerentes
    const { data: gerentes } = await supabase
      .from('profiles')
      .select('id, email, nome')
      .eq('cargo', 'gerente');

    if (gerentes && gerentes.length > 0 && notificationRecords.length > 0) {
      for (const gerente of gerentes) {
        const resumo = `📊 Resumo de Alertas:\n\n` +
          notificationRecords.map(n => 
            `• ${n.corretor_nome}: ${n.alerts.length} alerta(s)`
          ).join('\n');

        const { error: gerenteNotifError } = await supabase
          .from('notifications')
          .insert({
            user_id: gerente.id,
            title: `Resumo de Performance da Equipe`,
            message: resumo,
            type: 'info',
            read: false
          });

        if (!gerenteNotifError) {
          console.log(`✅ Resumo enviado para gerente ${gerente.nome}`);
        }
      }
    }

    console.log('✅ Notificações enviadas com sucesso!');

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notificationRecords.length,
        gerentes_notificados: gerentes?.length || 0,
        details: notificationRecords
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Erro ao enviar notificações:', error);
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

2. Configurar cron job para executar diariamente:
   - Horário recomendado: 09:00 (início do expediente)
   - URL: https://SEU-PROJETO.supabase.co/functions/v1/send-performance-notifications
   - Headers: 
     * Authorization: Bearer SEU_SERVICE_ROLE_KEY
     * Content-Type: application/json

3. Ou chamar manualmente:
   curl -X POST https://SEU-PROJETO.supabase.co/functions/v1/send-performance-notifications \
     -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json"

PRÓXIMOS PASSOS:
- Integrar com SendGrid/Resend para emails
- Integrar com OneSignal/Firebase para push
- Adicionar template de email HTML
- Adicionar preferências de notificação por usuário
*/









