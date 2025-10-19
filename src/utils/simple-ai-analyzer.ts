/**
 * 🤖 ANALISADOR IA SIMPLIFICADO
 *
 * Análise de leads usando regex e lógica JavaScript
 * SEM dependências externas, SEM CORS, SEM APIs
 *
 * Funcionalidades:
 * - Detecta tipo de imóvel
 * - Detecta valor/orçamento
 * - Detecta localização
 * - Detecta urgência
 * - Calcula score (0-100)
 * - Define prioridade (baixa/media/alta)
 */

export interface SimpleAIAnalysis {
  tipo_imovel: string | null;
  localizacao: string | null;
  valor_estimado: number | null;
  urgencia: 'baixa' | 'media' | 'alta';
  prioridade: 'baixa' | 'media' | 'alta';
  score: number;
  observacoes: string;
}

export class SimpleAIAnalyzer {
  /**
   * Analisa uma mensagem e extrai informações
   */
  static analyze(message: string, senderName: string): SimpleAIAnalysis {
    const msg = message.toLowerCase();

    // Detectar tipo de imóvel
    const tipo = this.detectarTipoImovel(msg);

    // Detectar valor
    const valor = this.detectarValor(msg);

    // Detectar localização
    const localizacao = this.detectarLocalizacao(msg);

    // Detectar urgência
    const urgencia = this.detectarUrgencia(msg);

    // Calcular score
    const score = this.calcularScore(msg, tipo, valor, localizacao, urgencia);

    // Definir prioridade
    const prioridade = this.definirPrioridade(score, urgencia, valor);

    // Gerar observações
    const observacoes = this.gerarObservacoes(
      tipo,
      valor,
      localizacao,
      urgencia,
      score
    );

    return {
      tipo_imovel: tipo,
      localizacao: localizacao,
      valor_estimado: valor,
      urgencia,
      prioridade,
      score,
      observacoes,
    };
  }

  /**
   * Detecta tipo de imóvel na mensagem
   */
  private static detectarTipoImovel(msg: string): string | null {
    const tipos = [
      {
        pattern:
          /\b(ap[oô]?|apartamento|apê)\b.*?(\d+\s*(quarto|dormit[oó]rio|qto))/i,
        tipo: 'Apartamento',
      },
      { pattern: /\b(ap[oô]?|apartamento|apê)\b/i, tipo: 'Apartamento' },
      {
        pattern: /\b(casa|resid[eê]ncia)\b.*?(\d+\s*(quarto|dormit[oó]rio))/i,
        tipo: 'Casa',
      },
      { pattern: /\bcasa\b/i, tipo: 'Casa' },
      { pattern: /\b(cobertura|duplex|triplex)\b/i, tipo: 'Cobertura' },
      { pattern: /\b(kitnet|kitnete|kit|studio|stúdio)\b/i, tipo: 'Kitnet' },
      { pattern: /\b(terreno|lote|chácara|sítio)\b/i, tipo: 'Terreno' },
      {
        pattern: /\b(sala comercial|loja|ponto comercial)\b/i,
        tipo: 'Comercial',
      },
      { pattern: /\b(im[oó]vel)\b/i, tipo: 'Imóvel' },
    ];

    for (const { pattern, tipo } of tipos) {
      const match = msg.match(pattern);
      if (match) {
        // Se tiver quartos, incluir no tipo
        if (match[2]) {
          return `${tipo} ${match[2].trim()}`;
        }
        return tipo;
      }
    }

    return null;
  }

  /**
   * Detecta valor mencionado na mensagem
   */
  private static detectarValor(msg: string): number | null {
    // Padrões: "500 mil", "300k", "R$ 450.000", "até 600000"
    const patterns = [
      /\b(\d+)\s*mil(?:h[ãa]o)?\b/i, // 500 mil
      /\b(\d+)\s*k\b/i, // 300k
      /r\$?\s*(\d{3}[.,]?\d{3})/i, // R$ 450.000
      /\b(\d{3,})[.,]?(\d{3})\b/, // 450000 ou 450.000
      /at[eé]\s*(\d+)/i, // até 600
    ];

    for (const pattern of patterns) {
      const match = msg.match(pattern);
      if (match) {
        let valor = parseInt(match[1].replace(/[.,]/g, ''));

        // Converter "mil" ou "k" para milhares
        if (msg.includes('mil') || msg.includes('k')) {
          valor = valor * 1000;
        }

        // Se for menor que 1000, provavelmente são milhares
        if (valor < 1000) {
          valor = valor * 1000;
        }

        return valor;
      }
    }

    return null;
  }

  /**
   * Detecta localização na mensagem
   */
  private static detectarLocalizacao(msg: string): string | null {
    // Bairros e regiões comuns de Goiânia
    const locais = [
      'setor bueno',
      'bueno',
      'setor oeste',
      'oeste',
      'setor marista',
      'marista',
      'jardim goi[aá]s',
      'setor sul',
      'sul',
      'setor pedro ludovico',
      'jardim am[eé]rica',
      'centro',
      'campinas',
      'nova suíça',
      'vila nova',
      'parque amazônia',
      'alto da gl[oó]ria',
      'setor aeroporto',
      'jardim europa',
      'setor coimbra',
      'eldorado',
    ];

    for (const local of locais) {
      const regex = new RegExp(`\\b${local}\\b`, 'i');
      if (regex.test(msg)) {
        // Capitalizar primeira letra
        return local
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
          .replace(/goi[aá]s/i, 'Goiás');
      }
    }

    return null;
  }

  /**
   * Detecta urgência na mensagem
   */
  private static detectarUrgencia(msg: string): 'baixa' | 'media' | 'alta' {
    const urgentePalavras = [
      'urgente',
      'urgência',
      'rápido',
      'r[aá]pido',
      'imediato',
      'agora',
      'hoje',
    ];
    const medioPalavras = ['logo', 'breve', 'semana', 'mês', 'pr[oó]ximo'];

    for (const palavra of urgentePalavras) {
      if (new RegExp(`\\b${palavra}\\b`, 'i').test(msg)) {
        return 'alta';
      }
    }

    for (const palavra of medioPalavras) {
      if (new RegExp(`\\b${palavra}\\b`, 'i').test(msg)) {
        return 'media';
      }
    }

    return 'baixa';
  }

  /**
   * Calcula score do lead (0-100)
   */
  private static calcularScore(
    msg: string,
    tipo: string | null,
    valor: number | null,
    localizacao: string | null,
    urgencia: 'baixa' | 'media' | 'alta'
  ): number {
    let score = 0;

    // Base: mensagem tem conteúdo (+20)
    if (msg.length > 10) score += 20;

    // Tem tipo de imóvel (+25)
    if (tipo) score += 25;

    // Tem valor definido (+25)
    if (valor) score += 25;

    // Tem localização (+15)
    if (localizacao) score += 15;

    // Urgência (+5 a +15)
    if (urgencia === 'alta') score += 15;
    else if (urgencia === 'media') score += 10;
    else score += 5;

    // Bonus: mensagem detalhada (+10)
    if (msg.length > 50) score += 10;

    // Bonus: menciona contato (+5)
    if (/\b(contato|ligar|falar|whats|telefone)\b/i.test(msg)) score += 5;

    // Limitar entre 0-100
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Define prioridade baseada em score e outros fatores
   */
  private static definirPrioridade(
    score: number,
    urgencia: 'baixa' | 'media' | 'alta',
    valor: number | null
  ): 'baixa' | 'media' | 'alta' {
    // Urgência alta = sempre prioridade alta
    if (urgencia === 'alta') return 'alta';

    // Score alto + valor alto = prioridade alta
    if (score >= 70 && valor && valor >= 300000) return 'alta';

    // Score alto = prioridade média
    if (score >= 60) return 'media';

    // Score médio = prioridade média
    if (score >= 40) return 'media';

    // Score baixo = prioridade baixa
    return 'baixa';
  }

  /**
   * Gera observações da análise
   */
  private static gerarObservacoes(
    tipo: string | null,
    valor: number | null,
    localizacao: string | null,
    urgencia: 'baixa' | 'media' | 'alta',
    score: number
  ): string {
    const obs: string[] = [];

    if (score >= 70) {
      obs.push('✅ Lead qualificado');
    } else if (score >= 40) {
      obs.push('⚠️ Lead médio');
    } else {
      obs.push('ℹ️ Lead básico');
    }

    if (tipo) obs.push(`Interesse: ${tipo}`);
    if (valor) obs.push(`Orçamento: R$ ${valor.toLocaleString('pt-BR')}`);
    if (localizacao) obs.push(`Região: ${localizacao}`);

    if (urgencia === 'alta') {
      obs.push('🔥 URGENTE - Atender imediatamente!');
    } else if (urgencia === 'media') {
      obs.push('⏰ Atender em breve');
    }

    return obs.join(' | ');
  }
}




