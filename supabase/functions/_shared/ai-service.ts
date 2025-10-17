// Serviço de IA para análise de mensagens WhatsApp
// Suporta: Claude (Anthropic) e OpenAI GPT-4

export interface MessageAnalysis {
  nome?: string;
  tipo_imovel?: string;
  quartos?: number;
  regiao?: string;
  orcamento?: number;
  urgencia: 'baixa' | 'media' | 'alta';
  score: number; // 0-100
  intencao: string;
  sugestao_resposta: string;
  dados_extraidos: {
    tem_nome: boolean;
    tem_orcamento: boolean;
    tem_regiao: boolean;
    tem_tipo_imovel: boolean;
  };
}

export class AIService {
  private provider: 'claude' | 'openai';
  private apiKey: string;

  constructor() {
    this.provider = (Deno.env.get('AI_PROVIDER') || 'claude') as 'claude' | 'openai';
    this.apiKey = this.provider === 'claude' 
      ? Deno.env.get('ANTHROPIC_API_KEY') || ''
      : Deno.env.get('OPENAI_API_KEY') || '';
  }

  async analyzeMessage(
    message: string, 
    senderName?: string,
    conversationHistory?: string[]
  ): Promise<MessageAnalysis> {
    if (!this.apiKey) {
      console.warn('⚠️ API Key não configurada. Usando análise básica.');
      return this.basicAnalysis(message, senderName);
    }

    try {
      if (this.provider === 'claude') {
        return await this.analyzeWithClaude(message, senderName, conversationHistory);
      } else {
        return await this.analyzeWithOpenAI(message, senderName, conversationHistory);
      }
    } catch (error) {
      console.error('❌ Erro na análise de IA:', error);
      return this.basicAnalysis(message, senderName);
    }
  }

  private async analyzeWithClaude(
    message: string,
    senderName?: string,
    history?: string[]
  ): Promise<MessageAnalysis> {
    const prompt = this.buildAnalysisPrompt(message, senderName, history);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;
    
    return this.parseAIResponse(aiResponse);
  }

  private async analyzeWithOpenAI(
    message: string,
    senderName?: string,
    history?: string[]
  ): Promise<MessageAnalysis> {
    const prompt = this.buildAnalysisPrompt(message, senderName, history);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em análise de leads imobiliários.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    return JSON.parse(aiResponse);
  }

  private buildAnalysisPrompt(
    message: string,
    senderName?: string,
    history?: string[]
  ): string {
    return `Você é um assistente de uma imobiliária brasileira. Analise a mensagem do cliente e extraia informações estruturadas.

${history && history.length > 0 ? `HISTÓRICO DA CONVERSA:\n${history.join('\n')}\n\n` : ''}

MENSAGEM ATUAL DO CLIENTE:
"${message}"

${senderName ? `Nome do Remetente: ${senderName}\n` : ''}

TAREFA:
Extraia as seguintes informações e retorne APENAS um JSON válido no formato exato abaixo:

{
  "nome": "string ou null (nome completo se mencionado)",
  "tipo_imovel": "string ou null (apartamento/casa/terreno/comercial)",
  "quartos": "number ou null (quantidade de quartos se mencionado)",
  "regiao": "string ou null (bairro/região mencionada)",
  "orcamento": "number ou null (valor em reais, apenas números)",
  "urgencia": "baixa|media|alta (baseado no tom da mensagem)",
  "score": "number 0-100 (qualificação do lead)",
  "intencao": "string (resumo da intenção do cliente em 1 linha)",
  "sugestao_resposta": "string (sugestão de resposta profissional e amigável)",
  "dados_extraidos": {
    "tem_nome": boolean,
    "tem_orcamento": boolean,
    "tem_regiao": boolean,
    "tem_tipo_imovel": boolean
  }
}

CRITÉRIOS DE SCORE (0-100):
- Tem orçamento definido: +25 pontos
- Tem região específica: +20 pontos
- Tem tipo de imóvel: +15 pontos
- Tem número de quartos: +10 pontos
- Urgência alta: +20 pontos
- Pergunta clara/direta: +10 pontos

SCORE:
- 0-40: Lead Frio (pouco qualificado)
- 41-70: Lead Morno (potencial)
- 71-100: Lead Quente (prioridade máxima!)

SUGESTÃO DE RESPOSTA:
- Deve ser profissional mas amigável
- Usar emojis moderadamente (1-2)
- Máximo 3-4 linhas
- Fazer 1-2 perguntas qualificadoras
- Confirmar o interesse

Retorne APENAS o JSON, sem texto adicional.`;
  }

  private parseAIResponse(response: string): MessageAnalysis {
    try {
      // Tentar extrair JSON se vier com texto extra
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Erro ao parsear resposta da IA:', error);
      throw error;
    }
  }

  // Análise básica sem IA (fallback)
  private basicAnalysis(message: string, senderName?: string): MessageAnalysis {
    const messageLower = message.toLowerCase();
    
    // Detecção básica de tipo de imóvel
    let tipo_imovel = null;
    if (messageLower.includes('apartamento') || messageLower.includes('apto')) tipo_imovel = 'apartamento';
    if (messageLower.includes('casa')) tipo_imovel = 'casa';
    if (messageLower.includes('terreno')) tipo_imovel = 'terreno';
    
    // Detecção de quartos
    const quartosMatch = message.match(/(\d+)\s*quarto/i);
    const quartos = quartosMatch ? parseInt(quartosMatch[1]) : null;
    
    // Detecção de valor
    const valorMatch = message.match(/(\d+(?:\.\d{3})*(?:k|mil)?)/i);
    let orcamento = null;
    if (valorMatch) {
      const valor = valorMatch[1].replace(/\./g, '');
      if (valor.includes('k') || valor.includes('mil')) {
        orcamento = parseInt(valor) * 1000;
      } else {
        orcamento = parseInt(valor);
      }
    }
    
    // Score básico
    let score = 30; // Base
    if (tipo_imovel) score += 15;
    if (quartos) score += 10;
    if (orcamento) score += 25;
    if (message.length > 20) score += 10;
    
    return {
      nome: senderName || null,
      tipo_imovel,
      quartos,
      regiao: null,
      orcamento,
      urgencia: 'media',
      score,
      intencao: 'Interessado em imóvel',
      sugestao_resposta: `Olá${senderName ? ' ' + senderName : ''}! 😊\n\nObrigado pelo contato! Vi que você tem interesse${tipo_imovel ? ' em ' + tipo_imovel : ''}.\n\nPara te ajudar melhor, pode me informar:\n• Qual região você prefere?\n• Qual seu orçamento?\n\nAguardo! 🏠`,
      dados_extraidos: {
        tem_nome: !!senderName,
        tem_orcamento: !!orcamento,
        tem_regiao: false,
        tem_tipo_imovel: !!tipo_imovel
      }
    };
  }

  // Gerar sugestão de resposta contextual
  async generateResponse(
    analysis: MessageAnalysis,
    leadHistory?: any[]
  ): Promise<string> {
    // Se já tem sugestão da análise, usar
    if (analysis.sugestao_resposta) {
      return analysis.sugestao_resposta;
    }

    // Gerar baseado no contexto
    let response = 'Olá! 😊\n\n';
    
    if (analysis.score > 70) {
      response += 'Que ótimo ter você aqui!\n\n';
      response += `Já vi que você procura ${analysis.tipo_imovel || 'um imóvel'}`;
      if (analysis.regiao) response += ` na ${analysis.regiao}`;
      response += '.\n\n';
      response += 'Vou conectar você com nosso especialista que tem as melhores opções!\n\n';
      response += 'Um momento... ⏱️';
    } else {
      response += 'Obrigado pelo contato!\n\n';
      response += 'Para encontrar o imóvel ideal para você, preciso de mais algumas informações:\n\n';
      
      if (!analysis.dados_extraidos.tem_tipo_imovel) {
        response += '• Que tipo de imóvel você procura?\n';
      }
      if (!analysis.dados_extraidos.tem_regiao) {
        response += '• Qual região você prefere?\n';
      }
      if (!analysis.dados_extraidos.tem_orcamento) {
        response += '• Qual seu orçamento?\n';
      }
      
      response += '\nAguardo! 🏠';
    }
    
    return response;
  }
}










