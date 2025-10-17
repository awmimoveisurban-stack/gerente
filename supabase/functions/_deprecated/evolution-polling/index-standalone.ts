import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVOLUTION_URL = Deno.env.get('EVOLUTION_API_URL') || 'https://api.urbanautobot.com';

// ✅ Cliente Supabase com service_role (acesso total)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// SERVIÇO DE IA - INLINE (para evitar import de _shared)
// ============================================================================

interface MessageAnalysis {
  nome?: string;
  tipo_imovel?: string;
  quartos?: number;
  regiao?: string;
  orcamento?: number;
  urgencia: 'baixa' | 'media' | 'alta';
  score: number;
  intencao: string;
  sugestao_resposta: string;
  dados_extraidos: {
    tem_nome: boolean;
    tem_orcamento: boolean;
    tem_regiao: boolean;
    tem_tipo_imovel: boolean;
  };
}

async function analyzeMessageWithAI(
  message: string, 
  senderName?: string
): Promise<MessageAnalysis> {
  const provider = Deno.env.get('AI_PROVIDER') || 'claude';
  const apiKey = provider === 'claude' 
    ? Deno.env.get('ANTHROPIC_API_KEY')
    : Deno.env.get('OPENAI_API_KEY');

  // Se não tiver API key, usar análise básica
  if (!apiKey) {
    console.log('⚠️ API Key não configurada. Usando análise básica.');
    return basicAnalysis(message, senderName);
  }

  try {
    console.log(`🤖 Analisando com ${provider.toUpperCase()}...`);
    
    if (provider === 'claude') {
      return await analyzeWithClaude(message, senderName, apiKey);
    } else {
      return await analyzeWithOpenAI(message, senderName, apiKey);
    }
  } catch (error) {
    console.error('❌ Erro na IA, usando análise básica:', error);
    return basicAnalysis(message, senderName);
  }
}

async function analyzeWithClaude(
  message: string,
  senderName?: string,
  apiKey?: string
): Promise<MessageAnalysis> {
  const prompt = buildPrompt(message, senderName);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.content[0].text;
  
  return parseAIResponse(aiResponse);
}

async function analyzeWithOpenAI(
  message: string,
  senderName?: string,
  apiKey?: string
): Promise<MessageAnalysis> {
  const prompt = buildPrompt(message, senderName);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  return parseAIResponse(aiResponse);
}

function buildPrompt(message: string, senderName?: string): string {
  return `Você é um assistente de uma imobiliária brasileira. Analise a mensagem do cliente e extraia informações estruturadas.

MENSAGEM DO CLIENTE:
"${message}"

Nome do Remetente: ${senderName || 'Não informado'}

TAREFA: Extraia informações e retorne APENAS um JSON válido (sem markdown, sem \`\`\`json):

{
  "nome": "string ou null",
  "tipo_imovel": "apartamento/casa/terreno/comercial/outro ou null",
  "quartos": number ou null,
  "regiao": "string ou null",
  "orcamento": number (apenas números) ou null,
  "urgencia": "baixa|media|alta",
  "score": number (0-100),
  "intencao": "resumo em 1 linha",
  "sugestao_resposta": "resposta profissional e amigável, 3-4 linhas, 1-2 emojis",
  "dados_extraidos": {
    "tem_nome": boolean,
    "tem_orcamento": boolean,
    "tem_regiao": boolean,
    "tem_tipo_imovel": boolean
  }
}

REGRAS PARA SCORE:
- Base: 20 pontos
- Tem orçamento específico: +25
- Tem região específica: +20
- Tem tipo de imóvel: +15
- Tem número de quartos: +10
- Urgência alta: +20
- Pergunta clara: +10
Total máximo: 100

CLASSIFICAÇÃO: 0-40 Frio | 41-70 Morno | 71-100 Quente`;
}

function parseAIResponse(aiResponse: string): MessageAnalysis {
  try {
    // Limpar markdown se existir
    let cleaned = aiResponse.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('❌ Erro ao parsear resposta da IA:', error);
    throw error;
  }
}

function basicAnalysis(message: string, senderName?: string): MessageAnalysis {
  const lower = message.toLowerCase();
  
  // Extração básica por keywords
  const hasOrcamento = /\d{3,7}/.test(message) || lower.includes('mil') || lower.includes('reais');
  const hasRegiao = lower.includes('zona') || lower.includes('bairro') || lower.includes('região');
  const hasTipo = lower.includes('apto') || lower.includes('casa') || lower.includes('terreno');
  const urgente = lower.includes('urgente') || lower.includes('rápido') || lower.includes('agora');
  
  let score = 20; // Base
  if (hasOrcamento) score += 25;
  if (hasRegiao) score += 20;
  if (hasTipo) score += 15;
  if (urgente) score += 20;
  if (lower.includes('quero') || lower.includes('preciso')) score += 10;

  return {
    nome: senderName,
    tipo_imovel: lower.includes('apto') || lower.includes('apartamento') ? 'apartamento' :
                 lower.includes('casa') ? 'casa' :
                 lower.includes('terreno') ? 'terreno' : undefined,
    quartos: undefined,
    regiao: undefined,
    orcamento: undefined,
    urgencia: urgente ? 'alta' : lower.includes('quero') ? 'media' : 'baixa',
    score,
    intencao: 'Cliente interessado em imóvel',
    sugestao_resposta: `Olá${senderName ? ' ' + senderName : ''}! 😊 Obrigado pelo contato. Vou verificar as melhores opções para você e retorno em breve!`,
    dados_extraidos: {
      tem_nome: !!senderName,
      tem_orcamento: hasOrcamento,
      tem_regiao: hasRegiao,
      tem_tipo_imovel: hasTipo,
    }
  };
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE POLLING
// ============================================================================

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

              console.log(`💬 Mensagem de: ${senderName}`);
              console.log(`📝 Texto: ${messageText.substring(0, 100)}...`);

              // ✅ 5. VERIFICAR SE LEAD JÁ EXISTE
              const { data: existingLead } = await supabase
                .from('leads')
                .select('id')
                .eq('telefone', phoneNumber)
                .maybeSingle();

              if (existingLead) {
                console.log(`ℹ️ Lead já existe, pulando...`);
                continue;
              }

              // ✅ 6. ANALISAR COM IA 🤖
              const analysis = await analyzeMessageWithAI(messageText, senderName);
              
              console.log(`📊 Score: ${analysis.score}/100`);
              console.log(`🎯 Urgência: ${analysis.urgencia}`);

              // ✅ 7. CRIAR LEAD COM DADOS DA IA
              const leadData = {
                nome: analysis.nome || senderName,
                telefone: phoneNumber,
                status: 'novo',
                origem: 'whatsapp',
                user_id: config.manager_id,
                imovel_interesse: analysis.tipo_imovel || null,
                valor_interesse: analysis.orcamento || null,
                observacoes: [
                  `💬 MENSAGEM ORIGINAL:`,
                  `"${messageText}"`,
                  ``,
                  `🤖 ANÁLISE IA (Score: ${analysis.score}/100):`,
                  `• Urgência: ${analysis.urgencia.toUpperCase()}`,
                  `• Intenção: ${analysis.intencao}`,
                  analysis.tipo_imovel ? `• Tipo: ${analysis.tipo_imovel}` : null,
                  analysis.quartos ? `• Quartos: ${analysis.quartos}` : null,
                  analysis.regiao ? `• Região: ${analysis.regiao}` : null,
                  analysis.orcamento ? `• Orçamento: R$ ${analysis.orcamento.toLocaleString('pt-BR')}` : null,
                  ``,
                  `💡 SUGESTÃO DE RESPOSTA:`,
                  analysis.sugestao_resposta,
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
                console.log(`✅ Lead criado: ${lead.id} (Score: ${analysis.score}/100)`);
                
                // ✅ 8. CRIAR NOTIFICAÇÃO
                const isHot = analysis.score >= 70;
                await supabase
                  .from('notifications')
                  .insert({
                    user_id: config.manager_id,
                    title: isHot ? '🔥 Novo Lead QUENTE!' : '📱 Novo Lead via WhatsApp',
                    message: `${senderName} - Score: ${analysis.score}/100`,
                    type: isHot ? 'lead_quente' : 'novo_lead',
                    lead_id: lead.id,
                  });
              }
            }
          } catch (msgError) {
            console.error('❌ Erro ao processar mensagem:', msgError);
          }
        }

      } catch (instanceError) {
        console.error(`❌ Erro na instância:`, instanceError);
      }
    }

    console.log(`✅ Polling concluído: ${totalMessages} mensagem(ns), ${totalLeads} lead(s)`);

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

// ============================================================================
// FUNÇÕES AUXILIARES DE IA
// ============================================================================

async function analyzeWithClaude(
  message: string,
  senderName?: string,
  apiKey?: string
): Promise<MessageAnalysis> {
  const prompt = buildPrompt(message, senderName);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Claude error:', errorText);
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.content[0].text;
  
  return parseAIResponse(aiResponse);
}

async function analyzeWithOpenAI(
  message: string,
  senderName?: string,
  apiKey?: string
): Promise<MessageAnalysis> {
  const prompt = buildPrompt(message, senderName);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ OpenAI error:', errorText);
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  return parseAIResponse(aiResponse);
}

function buildPrompt(message: string, senderName?: string): string {
  return `Você é um assistente de uma imobiliária brasileira. Analise a mensagem e extraia informações.

MENSAGEM: "${message}"
NOME: ${senderName || 'Não informado'}

Retorne APENAS JSON (sem markdown):
{
  "nome": "string ou null",
  "tipo_imovel": "apartamento|casa|terreno|comercial|null",
  "quartos": number ou null,
  "regiao": "string ou null",
  "orcamento": number ou null,
  "urgencia": "baixa|media|alta",
  "score": number (0-100),
  "intencao": "resumo em 1 linha",
  "sugestao_resposta": "resposta profissional, 3-4 linhas, 1-2 emojis",
  "dados_extraidos": {
    "tem_nome": boolean,
    "tem_orcamento": boolean,
    "tem_regiao": boolean,
    "tem_tipo_imovel": boolean
  }
}

SCORE: Base 20 + orçamento(25) + região(20) + tipo(15) + quartos(10) + urgência(20) + clareza(10)`;
}

function parseAIResponse(aiResponse: string): MessageAnalysis {
  try {
    let cleaned = aiResponse.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('❌ Erro ao parsear IA, usando fallback');
    throw error;
  }
}

function basicAnalysis(message: string, senderName?: string): MessageAnalysis {
  const lower = message.toLowerCase();
  
  const hasOrcamento = /\d{3,7}/.test(message);
  const hasRegiao = lower.includes('zona') || lower.includes('bairro');
  const hasTipo = lower.includes('apto') || lower.includes('casa') || lower.includes('terreno');
  const urgente = lower.includes('urgente') || lower.includes('rápido');
  
  let score = 20;
  if (hasOrcamento) score += 25;
  if (hasRegiao) score += 20;
  if (hasTipo) score += 15;
  if (urgente) score += 20;
  if (lower.includes('quero')) score += 10;

  return {
    nome: senderName,
    tipo_imovel: lower.includes('apto') ? 'apartamento' :
                 lower.includes('casa') ? 'casa' : undefined,
    quartos: undefined,
    regiao: undefined,
    orcamento: undefined,
    urgencia: urgente ? 'alta' : 'media',
    score,
    intencao: 'Cliente interessado em imóvel',
    sugestao_resposta: `Olá${senderName ? ' ' + senderName : ''}! 😊 Obrigado pelo contato. Vou verificar as melhores opções para você!`,
    dados_extraidos: {
      tem_nome: !!senderName,
      tem_orcamento: hasOrcamento,
      tem_regiao: hasRegiao,
      tem_tipo_imovel: hasTipo,
    }
  };
}

