import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Usar service_role_key para não exigir autenticação (webhook público)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔔 Evolution Webhook v2.0 - Iniciado (Public + Claude AI + manager_id)');

// ============================================================================
// 🤖 FUNÇÃO DE ANÁLISE COM CLAUDE AI
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
    console.log('⚠️ ANTHROPIC_API_KEY não configurada, pulando análise IA');
    return null;
  }

  try {
    console.log('🤖 Analisando mensagem com Claude AI...');

    const prompt = `Você é um assistente de qualificação de leads para uma imobiliária brasileira.

Analise a seguinte mensagem de WhatsApp e extraia as informações:

MENSAGEM:
"${message}"

NOME DO REMETENTE: ${senderName}

Extraia as seguintes informações (se não houver informação, retorne null):

1. **nome**: Nome completo da pessoa (se mencionado na mensagem ou use o nome do remetente)
2. **tipo_imovel**: Tipo de imóvel desejado (ex: "Apartamento 2 quartos", "Casa", "Cobertura", "Lote")
3. **localizacao**: Região/bairro/cidade desejada
4. **valor_estimado**: Valor em reais (apenas número, sem R$ ou pontos)
5. **forma_pagamento**: Como pretende pagar (ex: "À vista", "Financiado", "FGTS")
6. **urgencia**: Classifique como "baixa", "media" ou "alta"
7. **prioridade**: Classifique o lead como "baixa", "media" ou "alta" (considere: orçamento definido, urgência, especificidade)
8. **score**: Dê uma nota de 0 a 100 para a qualidade deste lead
9. **observacoes**: Resumo da análise e pontos importantes

IMPORTANTE:
- Se o cliente mencionar urgência ("urgente", "rápido", "logo"), urgencia = "alta"
- Se o cliente tem orçamento definido e específico, prioridade = "alta", score alto
- Se a mensagem é vaga ou só pergunta genérica, prioridade = "baixa", score baixo
- Entenda gírias brasileiras: "apê" = apartamento, "kit" = kitnet, "até Xk" = até X mil reais

Responda APENAS com um JSON válido (sem markdown, sem explicações):

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
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na API Claude:', errorData);
      return null;
    }

    const data = await response.json();
    const analysisText = data.content[0].text;
    
    // Limpar markdown se houver
    const cleanText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis: LeadAnalysis = JSON.parse(cleanText);
    
    console.log(`✅ IA: Score ${analysis.score}/100 | Prioridade: ${analysis.prioridade}`);
    
    return analysis;

  } catch (error: any) {
    console.error('❌ Erro ao analisar com Claude:', error.message);
    return null;
  }
}

// ============================================================================
// 🔔 WEBHOOK HANDLER
// ============================================================================

serve(async (req) => {
  // ✅ CORS Headers para aceitar requisições de qualquer origem
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // ✅ Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const webhook = await req.json();
    console.log('📥 Webhook recebido:', JSON.stringify(webhook, null, 2));

    // ✅ Extrair mensagem (Evolution API v2)
    const event = webhook.event || webhook.type;
    
    // Aceitar tanto v1 quanto v2
    const messages = webhook.data?.messages || 
                    webhook.messages || 
                    (webhook.data ? [webhook.data] : []);

    if (!messages || messages.length === 0) {
      console.log('⚠️ Nenhuma mensagem no webhook');
      return new Response(JSON.stringify({ ok: true, message: 'No messages' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ✅ Processar cada mensagem
    for (const messageData of messages) {
      try {
        // Ignorar mensagens enviadas por nós
        if (messageData.key?.fromMe) {
          console.log('⏭️ Ignorando mensagem enviada por nós');
          continue;
        }

        // Extrair texto
        const messageText = 
          messageData.message?.conversation ||
          messageData.message?.extendedTextMessage?.text ||
          messageData.text ||
          '';

        if (!messageText) {
          console.log('⚠️ Mensagem sem texto');
          continue;
        }

        // Extrair telefone
        const phoneNumber = (messageData.key?.remoteJid || messageData.from || '')
          .replace('@s.whatsapp.net', '')
          .replace('@c.us', '');

        if (!phoneNumber) {
          console.log('⚠️ Mensagem sem telefone');
          continue;
        }

        const senderName = messageData.pushName || phoneNumber;

        console.log(`💬 Nova mensagem de ${senderName} (${phoneNumber})`);

        // ✅ Verificar se lead JÁ existe (evitar duplicatas)
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id, nome')
          .eq('telefone', phoneNumber)
          .maybeSingle();

        if (existingLead) {
          console.log(`⏭️ Lead já existe: ${existingLead.nome} (ID: ${existingLead.id})`);
          continue;
        }

        // 🤖 ANALISAR COM CLAUDE AI
        const analysis = await analyzeWithClaude(messageText, senderName);

        // ✅ Buscar manager_id da instância WhatsApp
        const instanceName = webhook.instance || webhook.instanceName;
        let managerId = null;

        if (instanceName) {
          const { data: config } = await supabase
            .from('whatsapp_config')
            .select('manager_id')
            .eq('evolution_instance_name', instanceName)
            .maybeSingle();
          
          managerId = config?.manager_id || null;
        }

        // ✅ CRIAR LEAD COM IA + manager_id
        const leadData: any = {
          nome: analysis?.nome || senderName,
          telefone: phoneNumber,
          origem: 'whatsapp_webhook',
          status: 'novo',
          observacoes: messageText ? `WhatsApp: ${messageText}` : null,
          manager_id: managerId,
          atribuido_a: managerId
        };

        // ✅ Adicionar dados da IA (se disponível)
        if (analysis) {
          if (analysis.tipo_imovel) leadData.interesse = analysis.tipo_imovel;
          if (analysis.localizacao) leadData.cidade = analysis.localizacao;
          if (analysis.valor_estimado) leadData.orcamento = analysis.valor_estimado;
          if (analysis.prioridade) leadData.prioridade = analysis.prioridade;
          
          // Adicionar score e observações da IA
          if (analysis.score) {
            leadData.observacoes = `[IA Score: ${analysis.score}/100 | Prioridade: ${analysis.prioridade}]\n${analysis.observacoes || ''}\n\nMensagem original: ${messageText}`;
          }
        }

        // ✅ INSERT no banco
        const { data: newLead, error: insertError } = await supabase
          .from('leads')
          .insert(leadData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erro ao criar lead:', insertError);
          continue;
        }

        console.log(`✅ Lead criado: ${newLead.nome} (ID: ${newLead.id})`);
        
        if (analysis) {
          console.log(`   🤖 Score: ${analysis.score}/100 | Prioridade: ${analysis.prioridade}`);
        }

      } catch (msgError: any) {
        console.error('❌ Erro ao processar mensagem:', msgError.message);
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: messages.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('❌ Erro no webhook:', error.message);
    
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
