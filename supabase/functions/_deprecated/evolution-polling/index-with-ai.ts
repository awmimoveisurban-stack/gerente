import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AIService } from "../_shared/ai-service.ts";

const EVOLUTION_URL = Deno.env.get('EVOLUTION_API_URL') || 'https://api.urbanautobot.com';

// ✅ Cliente Supabase com service_role (acesso total)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ✅ Inicializar serviço de IA
const aiService = new AIService();

console.log('🚀 Evolution API Polling com IA - Iniciado');

serve(async (req) => {
  try {
    console.log('📡 Polling iniciado...');

    // ✅ 1. BUSCAR TODAS AS INSTÂNCIAS ATIVAS
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

              // ✅ 5. VERIFICAR SE LEAD JÁ EXISTE (evitar duplicatas)
              const { data: existingLead } = await supabase
                .from('leads')
                .select('id')
                .eq('telefone', phoneNumber)
                .maybeSingle();

              if (existingLead) {
                console.log(`ℹ️ Lead já existe para ${phoneNumber}, pulando...`);
                continue;
              }

              // ✅ 6. ANÁLISE COM IA 🤖
              console.log('🤖 Analisando com IA...');
              const analysis = await aiService.analyzeMessage(messageText, senderName);
              
              console.log(`📊 Score IA: ${analysis.score}/100`);
              console.log(`🎯 Urgência: ${analysis.urgencia}`);
              console.log(`💡 Sugestão: ${analysis.sugestao_resposta.substring(0, 50)}...`);

              // ✅ 7. CRIAR LEAD COM DADOS DA IA
              const leadData = {
                nome: analysis.nome || senderName,
                telefone: phoneNumber,
                email: null, // WhatsApp não fornece email
                status: 'novo',
                origem: 'whatsapp',
                user_id: config.manager_id,
                imovel_interesse: analysis.tipo_imovel || null,
                valor_interesse: analysis.orcamento || null,
                observacoes: [
                  `💬 Mensagem: "${messageText}"`,
                  ``,
                  `🤖 ANÁLISE IA:`,
                  `Score: ${analysis.score}/100`,
                  `Urgência: ${analysis.urgencia.toUpperCase()}`,
                  `Intenção: ${analysis.intencao}`,
                  analysis.regiao ? `Região: ${analysis.regiao}` : null,
                  analysis.quartos ? `Quartos: ${analysis.quartos}` : null,
                  ``,
                  `💡 SUGESTÃO DE RESPOSTA:`,
                  analysis.sugestao_resposta,
                  ``,
                  `📊 Dados Extraídos:`,
                  analysis.dados_extraidos.tem_nome ? '✅ Nome' : '❌ Nome',
                  analysis.dados_extraidos.tem_orcamento ? '✅ Orçamento' : '❌ Orçamento',
                  analysis.dados_extraidos.tem_regiao ? '✅ Região' : '❌ Região',
                  analysis.dados_extraidos.tem_tipo_imovel ? '✅ Tipo' : '❌ Tipo',
                ].filter(Boolean).join('\n'),
              };

              const { data: lead, error: leadError } = await supabase
                .from('leads')
                .insert(leadData)
                .select()
                .single();

              if (leadError) {
                console.error('❌ Erro ao criar lead:', leadError);
              } else {
                totalLeads++;
                console.log(`✅ Lead criado com IA: ${lead.id} (Score: ${analysis.score}/100)`);
                
                // ✅ 8. CRIAR NOTIFICAÇÃO
                await supabase
                  .from('notifications')
                  .insert({
                    user_id: config.manager_id,
                    title: `🔥 Novo Lead ${analysis.score >= 70 ? 'QUENTE' : 'via WhatsApp'}`,
                    message: `${senderName} - Score: ${analysis.score}/100`,
                    type: analysis.score >= 70 ? 'lead_quente' : 'novo_lead',
                    lead_id: lead.id,
                  });
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

