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
      const error = await response.json();
      console.error('❌ Erro na API da Claude:', error);
      return null;
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;
    
    console.log('🤖 Resposta da Claude:', aiResponse);

    // Tentar extrair JSON da resposta
    let jsonText = aiResponse.trim();
    
    // Remover markdown code blocks se houver
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
    }

    const analysis: LeadAnalysis = JSON.parse(jsonText);
    
    console.log('✅ Análise IA concluída:', analysis);
    
    return analysis;

  } catch (error: any) {
    console.error('❌ Erro ao analisar com Claude:', error.message);
    return null;
  }
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, apikey, authorization'
      }
    });
  }

  try {
    // Receber webhook da Evolution
    const webhook = await req.json();
    
    console.log('📨 Webhook recebido:', JSON.stringify(webhook, null, 2));

    // Verificar diferentes formatos de webhook que Evolution pode enviar
    const event = webhook.event || webhook.type;
    const messageData = webhook.data || webhook.message || webhook;

    console.log('🔍 Event type:', event);

    // Processar apenas mensagens recebidas
    // ✅ Suporta Evolution API v2 (MESSAGES_UPSERT) e v1 (messages.upsert)
    if (
      event === 'MESSAGES_UPSERT' ||      // ✅ Evolution API v2 (oficial)
      event === 'messages.upsert' ||      // ✅ v1 compatibility
      event === 'message.received' ||     // ✅ Alternativa
      event === 'messages_received' ||    // ✅ Alternativa
      messageData.message
    ) {
      // Extrair dados da mensagem (Evolution pode enviar em formatos diferentes)
      const message = messageData.message || messageData;
      const key = message.key || messageData.key;
      
      // Verificar se não é mensagem enviada por nós
      if (key?.fromMe) {
        console.log('⏭️ Mensagem enviada por nós, ignorando...');
        return new Response(
          JSON.stringify({ success: true, skipped: 'sent_by_us' }),
          { 
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }

      // Extrair texto da mensagem (diferentes formatos possíveis)
      let messageText = '';
      if (message.message?.conversation) {
        messageText = message.message.conversation;
      } else if (message.message?.extendedTextMessage?.text) {
        messageText = message.message.extendedTextMessage.text;
      } else if (message.text) {
        messageText = message.text;
      } else if (typeof message.message === 'string') {
        messageText = message.message;
      }

      if (!messageText) {
        console.log('⏭️ Sem texto na mensagem, ignorando...');
        return new Response(
          JSON.stringify({ success: true, skipped: 'no_text' }),
          { 
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }

      // Extrair número de telefone
      const phoneNumber = (key?.remoteJid || messageData.from || '')
        .replace('@s.whatsapp.net', '')
        .replace('@c.us', '');
      
      const senderName = message.pushName || messageData.pushName || phoneNumber;

      console.log(`💬 Nova mensagem de: ${senderName} (${phoneNumber})`);
      console.log(`📝 Texto: ${messageText}`);

      // Buscar manager_id da instância que recebeu a mensagem
      const instanceName = webhook.instance || webhook.instanceName;
      let managerId = null;

      if (instanceName) {
        const { data: config } = await supabase
          .from('whatsapp_config')
          .select('manager_id')
          .eq('evolution_instance_name', instanceName)
          .single();
        
        managerId = config?.manager_id;
      }

      // 🤖 ANALISAR MENSAGEM COM CLAUDE AI
      const analysis = await analyzeWithClaude(messageText, senderName);

      // Preparar dados do lead (com ou sem IA)
      const leadData: any = {
        nome: analysis?.nome || senderName,
        telefone: phoneNumber,
        mensagem_inicial: messageText,
        origem: 'whatsapp_evolution',
        status: 'novo',
        manager_id: managerId,
        atribuido_a: managerId,
        data_contato: new Date().toISOString()
      };

      // Se tiver análise da IA, adicionar campos extras
      if (analysis) {
        if (analysis.tipo_imovel) leadData.interesse = analysis.tipo_imovel;
        if (analysis.localizacao) leadData.cidade = analysis.localizacao;
        if (analysis.valor_estimado) leadData.orcamento = analysis.valor_estimado;
        if (analysis.observacoes) {
          leadData.observacoes = `[IA Score: ${analysis.score}/100 | Prioridade: ${analysis.prioridade}]\n${analysis.observacoes}\n\nMensagem original: ${messageText}`;
        }
        // Adicionar tags para filtrar depois
        leadData.tags = [
          `urgencia_${analysis.urgencia}`,
          `prioridade_${analysis.prioridade}`,
          `score_${analysis.score}`,
          'qualificado_ia'
        ];
      }

      console.log('💾 Dados do lead:', leadData);

      // ✅ CRIAR LEAD AUTOMATICAMENTE
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (leadError) {
        // Verificar se é erro de duplicação
        if (leadError.code === '23505') {
          console.log('⚠️ Lead já existe:', phoneNumber);
          
          // Atualizar lead existente com nova mensagem e análise
          const updateData: any = {
            mensagem_inicial: messageText,
            data_contato: new Date().toISOString()
          };

          if (analysis) {
            if (analysis.tipo_imovel) updateData.interesse = analysis.tipo_imovel;
            if (analysis.localizacao) updateData.cidade = analysis.localizacao;
            if (analysis.valor_estimado) updateData.orcamento = analysis.valor_estimado;
            if (analysis.observacoes) {
              updateData.observacoes = `[IA Score: ${analysis.score}/100 | Prioridade: ${analysis.prioridade}]\n${analysis.observacoes}\n\nÚltima mensagem: ${messageText}`;
            }
          }

          const { data: updated } = await supabase
            .from('leads')
            .update(updateData)
            .eq('telefone', phoneNumber)
            .select()
            .single();

          console.log(`✅ Lead atualizado: ${updated?.id}`);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              action: 'updated',
              lead_id: updated?.id,
              ai_analysis: analysis 
            }),
            { 
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        }

        console.error('❌ Erro ao criar lead:', leadError);
        return new Response(
          JSON.stringify({ error: leadError.message }),
          { 
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      } else {
        console.log(`✅ Lead criado: ${lead.id}`);
        console.log(`🤖 Com análise IA: ${analysis ? 'Sim ✅' : 'Não ⏭️'}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            action: 'created',
            lead_id: lead.id,
            ai_analysis: analysis
          }),
          { 
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }
    }

    // Se não for mensagem relevante, retornar sucesso mesmo assim
    console.log('⏭️ Evento não processado:', event);
    return new Response(
      JSON.stringify({ success: true, skipped: true }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error: any) {
    console.error('❌ Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});

