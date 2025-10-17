import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVOLUTION_URL = Deno.env.get('EVOLUTION_API_URL') || 'https://api.urbanautobot.com';

// ✅ Cliente Supabase com service_role (acesso total)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Evolution API Polling - Iniciado');

serve(async (req) => {
  try {
    console.log('📡 Polling iniciado...');

    // ✅ 1. BUSCAR TODAS AS INSTÂNCIAS ATIVAS
    // Buscar por 'connected' OU 'authorized' (Evolution API usa ambos)
    const { data: configs, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .in('status', ['connected', 'authorized'])
      .is('deleted_at', null)
      .not('evolution_instance_name', 'is', null);

    if (configError) {
      console.error('❌ Erro ao buscar configs:', configError);
      return new Response(JSON.stringify({ error: configError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📱 ${configs?.length || 0} instância(s) ativa(s)`);

    let totalMessages = 0;
    let totalLeads = 0;

    // ✅ 2. PROCESSAR CADA INSTÂNCIA
    for (const config of configs || []) {
      try {
        console.log(`🔍 Verificando instância: ${config.evolution_instance_name}`);

        // ✅ 3. BUSCAR MENSAGENS RECEBIDAS
        const fetchUrl = `${EVOLUTION_URL}/message/fetchInstances/${config.evolution_instance_name}?number=false`;
        
        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            'apikey': config.evolution_instance_token || ''
          }
        });

        if (!response.ok) {
          console.warn(`⚠️ Erro ao buscar mensagens: ${response.status}`);
          continue;
        }

        const messages = await response.json();
        console.log(`📨 ${messages?.length || 0} mensagem(ns) encontrada(s)`);

        // ✅ 4. PROCESSAR CADA MENSAGEM
        for (const msg of messages || []) {
          try {
            // Verificar se é mensagem recebida (não enviada)
            if (!msg.key?.fromMe && msg.message?.conversation) {
              totalMessages++;
              
              const phoneNumber = msg.key.remoteJid?.replace('@s.whatsapp.net', '') || '';
              const messageText = msg.message.conversation;
              const senderName = msg.pushName || phoneNumber;

              console.log(`💬 Mensagem de: ${senderName} (${phoneNumber})`);
              console.log(`📝 Texto: ${messageText}`);

              // ✅ 5. ANÁLISE BÁSICA (pode integrar IA depois)
              const score = messageText.toLowerCase().includes('urgente') ? 85 : 
                           messageText.toLowerCase().includes('quero') ? 70 : 50;

              // ✅ 6. CRIAR LEAD
              const { data: lead, error: leadError } = await supabase
                .from('leads')
                .insert({
                  nome: senderName,
                  telefone: phoneNumber,
                  mensagem_inicial: messageText,
                  origem: 'whatsapp_evolution',
                  status: 'novo',
                  score_ia: score,
                  manager_id: config.manager_id,
                  atribuido_a: config.manager_id, // Atribuir ao gerente por padrão
                  data_contato: new Date().toISOString()
                })
                .select()
                .single();

              if (leadError) {
                console.error('❌ Erro ao criar lead:', leadError);
              } else {
                totalLeads++;
                console.log(`✅ Lead criado: ${lead.id}`);
              }
            }
          } catch (msgError) {
            console.error('❌ Erro ao processar mensagem:', msgError);
          }
        }

      } catch (instanceError) {
        console.error(`❌ Erro na instância ${config.evolution_instance_name}:`, instanceError);
      }
    }

    console.log(`✅ Polling concluído: ${totalMessages} mensagem(ns), ${totalLeads} lead(s) criado(s)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        instances: configs?.length || 0,
        messages: totalMessages,
        leads: totalLeads
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Erro no polling:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

