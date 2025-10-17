import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EVOLUTION_URL = 'https://api.urbanautobot.com';
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || 'cfd9b746ea9e400dc8f4d3e8d57b0180';

console.log('🔄 Evolution Polling com IA - Iniciado');

// ============================================================================
// FUNÇÃO DE ANÁLISE COM CLAUDE AI
// ============================================================================

interface LeadAnalysis {
  nome: string | null;
  tipo_imovel: string | null;
  localizacao: string | null;
  valor_estimado: number | null;
  forma_pagamento: string | null;
  urgencia: 'baixa' | 'media' | 'alta';
  prioridade: 'baixa' | 'media' | 'alta';
  score: number;
  observacoes: string | null;
}

async function analyzeWithClaude(message: string, senderName: string): Promise<LeadAnalysis | null> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!apiKey) {
    console.log('⚠️ ANTHROPIC_API_KEY não configurada');
    return null;
  }

  try {
    const prompt = `Você é um assistente de qualificação de leads para uma imobiliária brasileira.

Analise a seguinte mensagem de WhatsApp:

MENSAGEM: "${message}"
REMETENTE: ${senderName}

Extraia as seguintes informações (retorne null se não houver):

1. nome: Nome completo (se mencionado ou use o remetente)
2. tipo_imovel: Tipo desejado (ex: "Apartamento 2 quartos", "Casa")
3. localizacao: Região/bairro/cidade
4. valor_estimado: Valor em reais (só número)
5. forma_pagamento: Como pretende pagar (ex: "À vista", "Financiado")
6. urgencia: "baixa", "media" ou "alta"
7. prioridade: Classifique como "baixa", "media" ou "alta"
8. score: Nota de 0 a 100 para qualidade do lead
9. observacoes: Resumo da análise

IMPORTANTE:
- Urgência alta se mencionar "urgente", "rápido", "logo"
- Prioridade alta se tem orçamento definido e específico
- Entenda gírias BR: "apê" = apartamento, "kit" = kitnet, "300k" = 300 mil

Responda APENAS com JSON válido (sem markdown):

{
  "nome": "string ou null",
  "tipo_imovel": "string ou null",
  "localizacao": "string ou null",
  "valor_estimado": number ou null,
  "forma_pagamento": "string ou null",
  "urgencia": "baixa" | "media" | "alta",
  "prioridade": "baixa" | "media" | "alta",
  "score": number,
  "observacoes": "string ou null"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      console.error('❌ Erro na Claude API:', response.status);
      return null;
    }

    const data = await response.json();
    let jsonText = data.content[0].text.trim();
    
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
    }

    const analysis: LeadAnalysis = JSON.parse(jsonText);
    console.log('🤖 Análise IA:', analysis);
    
    return analysis;

  } catch (error: any) {
    console.error('❌ Erro ao analisar:', error.message);
    return null;
  }
}

// ============================================================================
// POLLING DE MENSAGENS
// ============================================================================

serve(async (req) => {
  // CORS headers - permitir acesso de qualquer origem
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando polling de mensagens...');

    // Buscar todas as instâncias ativas
    const { data: configs } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('status', 'authorized')
      .is('deleted_at', null);

    if (!configs || configs.length === 0) {
      console.log('⏭️ Nenhuma instância ativa');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhuma instância para processar' 
      }), {
        headers: corsHeaders
      });
    }

    console.log(`📱 ${configs.length} instância(s) ativa(s)`);

    let totalLeads = 0;
    const results = [];

    // Para cada instância, buscar mensagens
    for (const config of configs) {
      try {
        console.log(`🔍 Buscando mensagens: ${config.evolution_instance_name}`);

        // Buscar mensagens não lidas (últimas 24h)
        const response = await fetch(
          `${EVOLUTION_URL}/message/list/${config.evolution_instance_name}?limit=50`,
          {
            headers: { 'apikey': EVOLUTION_API_KEY }
          }
        );

        if (!response.ok) {
          console.log(`⚠️ Erro ao buscar mensagens: ${response.status}`);
          continue;
        }

        const messages = await response.json();
        console.log(`📨 ${messages?.length || 0} mensagem(ns) encontrada(s)`);

        if (!messages || messages.length === 0) continue;

        // Processar apenas mensagens recebidas (não enviadas)
        for (const msg of messages) {
          try {
            // Verificar se é mensagem recebida
            if (msg.key?.fromMe) continue;

            // Extrair texto
            const messageText = 
              msg.message?.conversation ||
              msg.message?.extendedTextMessage?.text ||
              msg.text ||
              '';

            if (!messageText) continue;

            // Extrair telefone
            const phoneNumber = (msg.key?.remoteJid || '')
              .replace('@s.whatsapp.net', '')
              .replace('@c.us', '');

            if (!phoneNumber) continue;

            const senderName = msg.pushName || phoneNumber;

            // Verificar se lead já existe
            const { data: existingLead } = await supabase
              .from('leads')
              .select('id')
              .eq('telefone', phoneNumber)
              .maybeSingle();

            if (existingLead) {
              console.log(`⏭️ Lead já existe: ${phoneNumber}`);
              continue;
            }

            console.log(`💬 Nova mensagem de: ${senderName} (${phoneNumber})`);
            console.log(`📝 Texto: ${messageText}`);

            // 🤖 ANALISAR COM CLAUDE AI
            const analysis = await analyzeWithClaude(messageText, senderName);

            // Preparar dados do lead
            const leadData: any = {
              nome: analysis?.nome || senderName,
              telefone: phoneNumber,
              mensagem_inicial: messageText,
              origem: 'whatsapp_evolution_polling',
              status: 'novo',
              manager_id: config.manager_id,
              atribuido_a: config.manager_id,
              data_contato: new Date().toISOString()
            };

            // Adicionar campos da IA
            if (analysis) {
              if (analysis.tipo_imovel) leadData.interesse = analysis.tipo_imovel;
              if (analysis.localizacao) leadData.cidade = analysis.localizacao;
              if (analysis.valor_estimado) leadData.orcamento = analysis.valor_estimado;
              if (analysis.observacoes) {
                leadData.observacoes = `[IA Score: ${analysis.score}/100 | Prioridade: ${analysis.prioridade}]\n${analysis.observacoes}`;
              }
            }

            // Criar lead
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .insert(leadData)
              .select()
              .single();

            if (leadError) {
              console.error('❌ Erro ao criar lead:', leadError);
            } else {
              console.log(`✅ Lead criado: ${lead.id}`);
              console.log(`🤖 Com IA: ${analysis ? 'Sim ✅' : 'Não'}`);
              totalLeads++;
            }

          } catch (msgError: any) {
            console.error('❌ Erro ao processar mensagem:', msgError.message);
          }
        }

        results.push({
          instance: config.evolution_instance_name,
          messagesProcessed: messages.length,
          leadsCreated: totalLeads
        });

      } catch (instanceError: any) {
        console.error(`❌ Erro na instância ${config.evolution_instance_name}:`, instanceError.message);
      }
    }

    console.log(`✅ Polling concluído: ${totalLeads} lead(s) criado(s)`);

    return new Response(JSON.stringify({ 
      success: true, 
      totalLeads,
      results
    }), {
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('❌ Erro no polling:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});

