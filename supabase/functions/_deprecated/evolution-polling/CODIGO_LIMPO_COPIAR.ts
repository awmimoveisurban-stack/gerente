import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVOLUTION_URL = Deno.env.get('EVOLUTION_API_URL') || 'https://api.urbanautobot.com';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Evolution Polling - Iniciado');

serve(async (req) => {
  try {
    console.log('📡 Polling...');

    const { data: configs, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .in('status', ['connected', 'authorized'])
      .is('deleted_at', null)
      .not('evolution_instance_name', 'is', null);

    if (configError) {
      console.error('❌ Erro:', configError);
      return new Response(JSON.stringify({ error: configError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📱 ${configs?.length || 0} instância(s)`);

    let totalMessages = 0;
    let totalLeads = 0;

    for (const config of configs || []) {
      try {
        console.log(`🔍 Instância: ${config.evolution_instance_name}`);

        const fetchUrl = `${EVOLUTION_URL}/message/fetchInstances/${config.evolution_instance_name}?number=false`;
        
        const response = await fetch(fetchUrl, {
          method: 'GET',
          headers: { 'apikey': config.evolution_instance_token || '' }
        });

        if (!response.ok) {
          console.warn(`⚠️ Erro: ${response.status}`);
          continue;
        }

        const messages = await response.json();
        console.log(`📨 ${messages?.length || 0} mensagem(ns)`);

        for (const msg of messages || []) {
          try {
            if (!msg.key?.fromMe && msg.message?.conversation) {
              totalMessages++;
              
              const phoneNumber = msg.key.remoteJid?.replace('@s.whatsapp.net', '') || '';
              const messageText = msg.message.conversation;
              const senderName = msg.pushName || phoneNumber;

              console.log(`💬 De: ${senderName}`);

              // Verificar duplicata
              const { data: existingLead } = await supabase
                .from('leads')
                .select('id')
                .eq('telefone', phoneNumber)
                .maybeSingle();

              if (existingLead) {
                console.log(`ℹ️ Lead existe, pulando`);
                continue;
              }

              // ✅ ANÁLISE COM IA
              const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
              let analysis;

              if (apiKey) {
                console.log('🤖 Analisando com IA...');
                try {
                  analysis = await analyzeWithAI(messageText, senderName, apiKey);
                } catch (error) {
                  console.warn('⚠️ Erro na IA, usando básico:', error);
                  analysis = analyzeBasic(messageText, senderName);
                }
              } else {
                console.log('⚠️ Sem API key, análise básica');
                analysis = analyzeBasic(messageText, senderName);
              }
              
              console.log(`📊 Score: ${analysis.score}/100`);

              // Criar lead
              const { data: lead, error: leadError } = await supabase
                .from('leads')
                .insert({
                  nome: analysis.nome || senderName,
                  telefone: phoneNumber,
                  status: 'novo',
                  origem: 'whatsapp',
                  user_id: config.manager_id,
                  imovel_interesse: analysis.tipo || null,
                  valor_interesse: analysis.valor || null,
                  observacoes: `💬 "${messageText}"\n\n📊 Score: ${analysis.score}/100\n${analysis.sugestao || ''}`
                })
                .select()
                .single();

              if (leadError) {
                console.error('❌ Erro lead:', leadError);
              } else {
                totalLeads++;
                console.log(`✅ Lead: ${lead.id}`);
              }
            }
          } catch (msgError) {
            console.error('❌ Erro msg:', msgError);
          }
        }

      } catch (instanceError) {
        console.error(`❌ Erro instância:`, instanceError);
      }
    }

    console.log(`✅ Total: ${totalMessages} msgs, ${totalLeads} leads`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        instances: configs?.length || 0,
        messages: totalMessages,
        leads: totalLeads
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// FUNÇÕES DE IA
// ============================================================================

async function analyzeWithAI(message: string, senderName: string, apiKey: string) {
  const prompt = `Analise esta mensagem de cliente imobiliário e retorne APENAS JSON (sem markdown):

MENSAGEM: "${message}"
NOME: ${senderName}

Retorne:
{
  "nome": "string ou null",
  "tipo": "apartamento|casa|terreno ou null",
  "quartos": number ou null,
  "regiao": "string ou null",
  "valor": number ou null,
  "urgencia": "baixa|media|alta",
  "score": number (0-100),
  "intencao": "resumo",
  "sugestao": "resposta profissional 2-3 linhas"
}

Score: Base 20 + orçamento(25) + região(20) + tipo(15) + quartos(10) + urgência(20)`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`IA error: ${response.statusText}`);
  }

  const data = await response.json();
  let text = data.content[0].text.trim();
  text = text.replace(/```json\n?/g, '').replace(/```/g, '');
  
  return JSON.parse(text);
}

function analyzeBasic(message: string, senderName: string) {
  const lower = message.toLowerCase();
  
  const hasValor = /\d{3,7}/.test(message);
  const hasRegiao = lower.includes('zona') || lower.includes('bairro');
  const hasTipo = lower.includes('apto') || lower.includes('casa');
  const urgente = lower.includes('urgente') || lower.includes('rápido');
  
  let score = 20;
  if (hasValor) score += 25;
  if (hasRegiao) score += 20;
  if (hasTipo) score += 15;
  if (urgente) score += 20;
  if (lower.includes('quero')) score += 10;

  return {
    nome: senderName,
    tipo: lower.includes('apto') ? 'apartamento' : lower.includes('casa') ? 'casa' : null,
    quartos: null,
    regiao: null,
    valor: null,
    urgencia: urgente ? 'alta' : 'media',
    score,
    intencao: 'Interesse em imóvel',
    sugestao: `Olá ${senderName}! 😊 Obrigado pelo contato. Vou verificar as melhores opções para você!`
  };
}

