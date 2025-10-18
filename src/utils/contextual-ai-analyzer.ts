/**
 * 🤖 ANALISADOR IA COM CONTEXTO HISTÓRICO
 *
 * Análise de leads usando histórico completo de conversas
 * Sistema inteligente que entende evolução do interesse
 *
 * Funcionalidades:
 * - Analisa últimas 5-10 mensagens
 * - Detecta evolução de interesse
 * - Calcula score baseado em contexto
 * - Identifica mudanças de prioridade
 * - Análise temporal de engajamento
 */

export interface ConversationContext {
  id: string;
  mensagem: string;
  canal: string;
  tipo: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ContextualAIAnalysis {
  // Análise da mensagem atual
  tipo_imovel: string | null;
  localizacao: string | null;
  valor_estimado: number | null;
  urgencia: 'baixa' | 'media' | 'alta';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  score: number;
  observacoes: string;
  
  // Análise contextual (NOVO)
  evolucao_interesse: 'crescendo' | 'estavel' | 'diminuindo' | 'novo';
  engajamento_temporal: 'alto' | 'medio' | 'baixo';
  mudanca_prioridade: boolean;
  contexto_completo: string;
  mensagens_analisadas: number;
  
  // Insights avançados (NOVO)
  padroes_comportamento: string[];
  proximos_passos: string[];
  alertas_contexto: string[];
}

export class ContextualAIAnalyzer {
  private static readonly MAX_CONTEXT_MESSAGES = 8;
  private static readonly MIN_CONTEXT_MESSAGES = 3;

  /**
   * Analisa mensagem com contexto histórico completo
   */
  static analyzeWithContext(
    currentMessage: string,
    senderName: string,
    conversationHistory: ConversationContext[]
  ): ContextualAIAnalysis {
    // Filtrar e ordenar histórico
    const recentHistory = this.prepareContext(conversationHistory);
    
    // Análise da mensagem atual
    const currentAnalysis = this.analyzeCurrentMessage(currentMessage, senderName);
    
    // Análise contextual
    const contextualAnalysis = this.analyzeContextualPatterns(
      currentMessage,
      recentHistory,
      currentAnalysis
    );
    
    // Análise de evolução
    const evolutionAnalysis = this.analyzeEvolution(recentHistory, currentAnalysis);
    
    // Análise de engajamento temporal
    const engagementAnalysis = this.analyzeTemporalEngagement(recentHistory);
    
    // Gerar insights avançados
    const advancedInsights = this.generateAdvancedInsights(
      currentMessage,
      recentHistory,
      currentAnalysis,
      contextualAnalysis
    );

    return {
      // Análise atual (mantida)
      ...currentAnalysis,
      
      // Análise contextual (nova)
      evolucao_interesse: evolutionAnalysis.evolucao,
      engajamento_temporal: engagementAnalysis.nivel,
      mudanca_prioridade: evolutionAnalysis.mudancaPrioridade,
      contexto_completo: contextualAnalysis.resumo,
      mensagens_analisadas: recentHistory.length,
      
      // Insights avançados (novos)
      padroes_comportamento: advancedInsights.padroes,
      proximos_passos: advancedInsights.proximosPassos,
      alertas_contexto: advancedInsights.alertas,
    };
  }

  /**
   * Prepara contexto das conversas recentes
   */
  private static prepareContext(history: ConversationContext[]): ConversationContext[] {
    return history
      .filter(conv => conv.mensagem && conv.mensagem.trim().length > 0)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-this.MAX_CONTEXT_MESSAGES);
  }

  /**
   * Analisa apenas a mensagem atual (método existente)
   */
  private static analyzeCurrentMessage(message: string, senderName: string) {
    // Reutilizar lógica do SimpleAIAnalyzer existente
    const msg = message.toLowerCase();

    const tipo = this.detectarTipoImovel(msg);
    const valor = this.detectarValor(msg);
    const localizacao = this.detectarLocalizacao(msg);
    const urgencia = this.detectarUrgencia(msg);
    const score = this.calcularScore(msg, tipo, valor, localizacao, urgencia);
    const prioridade = this.definirPrioridade(score, urgencia, valor);
    const observacoes = this.gerarObservacoes(tipo, valor, localizacao, urgencia, score);

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
   * Analisa padrões contextuais nas conversas
   */
  private static analyzeContextualPatterns(
    currentMessage: string,
    history: ConversationContext[],
    currentAnalysis: any
  ): { resumo: string } {
    if (history.length === 0) {
      return { resumo: 'Primeira interação - sem contexto histórico' };
    }

    const patterns = [];
    
    // Analisar consistência de interesse
    const tiposImovel = history.map(h => this.detectarTipoImovel(h.mensagem.toLowerCase())).filter(Boolean);
    if (tiposImovel.length > 0) {
      const tipoMaisComum = this.getMostFrequent(tiposImovel);
      patterns.push(`Interesse consistente em: ${tipoMaisComum}`);
    }

    // Analisar evolução de valores
    const valores = history.map(h => this.detectarValor(h.mensagem.toLowerCase())).filter(Boolean);
    if (valores.length > 1) {
      const valorMin = Math.min(...valores);
      const valorMax = Math.max(...valores);
      if (valorMax > valorMin * 1.5) {
        patterns.push('Orçamento aumentou significativamente');
      }
    }

    // Analisar frequência de contato
    const tempoTotal = this.calculateTimeSpan(history);
    const frequencia = history.length / Math.max(1, tempoTotal / (24 * 60 * 60 * 1000)); // mensagens por dia
    if (frequencia > 2) {
      patterns.push('Alto engajamento - múltiplas interações diárias');
    }

    return {
      resumo: patterns.length > 0 ? patterns.join('; ') : 'Contexto básico estabelecido'
    };
  }

  /**
   * Analisa evolução do interesse ao longo do tempo
   */
  private static analyzeEvolution(
    history: ConversationContext[],
    currentAnalysis: any
  ): { evolucao: 'crescendo' | 'estavel' | 'diminuindo' | 'novo', mudancaPrioridade: boolean } {
    if (history.length < 2) {
      return { evolucao: 'novo', mudancaPrioridade: false };
    }

    // Analisar evolução de scores
    const scores = history.map(h => this.calcularScore(
      h.mensagem.toLowerCase(),
      this.detectarTipoImovel(h.mensagem.toLowerCase()),
      this.detectarValor(h.mensagem.toLowerCase()),
      this.detectarLocalizacao(h.mensagem.toLowerCase()),
      this.detectarUrgencia(h.mensagem.toLowerCase())
    ));

    const scoreAtual = currentAnalysis.score;
    const scoreAnterior = scores[scores.length - 2];
    const scoreInicial = scores[0];

    let evolucao: 'crescendo' | 'estavel' | 'diminuindo' | 'novo';
    let mudancaPrioridade = false;

    if (scoreAtual > scoreAnterior + 10) {
      evolucao = 'crescendo';
      mudancaPrioridade = true;
    } else if (scoreAtual < scoreAnterior - 10) {
      evolucao = 'diminuindo';
    } else {
      evolucao = 'estavel';
    }

    // Verificar mudança de prioridade
    const prioridadeAtual = currentAnalysis.prioridade;
    const prioridadeAnterior = this.definirPrioridade(
      scoreAnterior,
      this.detectarUrgencia(history[history.length - 2].mensagem.toLowerCase()),
      this.detectarValor(history[history.length - 2].mensagem.toLowerCase())
    );

    if (prioridadeAtual !== prioridadeAnterior) {
      mudancaPrioridade = true;
    }

    return { evolucao, mudancaPrioridade };
  }

  /**
   * Analisa engajamento temporal
   */
  private static analyzeTemporalEngagement(history: ConversationContext[]): { nivel: 'alto' | 'medio' | 'baixo' } {
    if (history.length === 0) return { nivel: 'baixo' };

    const tempoTotal = this.calculateTimeSpan(history);
    const frequencia = history.length / Math.max(1, tempoTotal / (60 * 60 * 1000)); // mensagens por hora

    if (frequencia > 0.5) return { nivel: 'alto' };
    if (frequencia > 0.1) return { nivel: 'medio' };
    return { nivel: 'baixo' };
  }

  /**
   * Gera insights avançados baseados no contexto
   */
  private static generateAdvancedInsights(
    currentMessage: string,
    history: ConversationContext[],
    currentAnalysis: any,
    contextualAnalysis: any
  ): { padroes: string[], proximosPassos: string[], alertas: string[] } {
    const padroes: string[] = [];
    const proximosPassos: string[] = [];
    const alertas: string[] = [];

    // Padrões de comportamento
    if (contextualAnalysis.evolucao_interesse === 'crescendo') {
      padroes.push('Interesse crescente detectado');
      proximosPassos.push('Acelerar processo de qualificação');
    }

    if (contextualAnalysis.engajamento_temporal === 'alto') {
      padroes.push('Cliente muito engajado');
      proximosPassos.push('Manter comunicação ativa');
    }

    // Alertas contextuais
    if (history.length > 5 && currentAnalysis.score < 30) {
      alertas.push('Lead com baixo score após múltiplas interações');
    }

    if (contextualAnalysis.mudanca_prioridade) {
      alertas.push('Mudança de prioridade detectada - revisar estratégia');
    }

    // Próximos passos baseados no contexto
    if (currentAnalysis.tipo_imovel && !history.some(h => h.mensagem.toLowerCase().includes('visita'))) {
      proximosPassos.push('Sugerir agendamento de visita');
    }

    if (currentAnalysis.valor_estimado && currentAnalysis.valor_estimado > 500000) {
      proximosPassos.push('Preparar proposta personalizada');
    }

    return { padroes, proximosPassos, alertas };
  }

  // =====================================================
  // MÉTODOS AUXILIARES (reutilizados do SimpleAIAnalyzer)
  // =====================================================

  private static detectarTipoImovel(msg: string): string | null {
    const tipos = [
      { keywords: ['apartamento', 'apto', 'ap'], result: 'Apartamento' },
      { keywords: ['casa', 'residência', 'sobrado'], result: 'Casa' },
      { keywords: ['terreno', 'lote'], result: 'Terreno' },
      { keywords: ['comercial', 'loja', 'sala'], result: 'Comercial' },
      { keywords: ['investimento', 'renda'], result: 'Investimento' },
    ];

    for (const tipo of tipos) {
      if (tipo.keywords.some(keyword => msg.includes(keyword))) {
        return tipo.result;
      }
    }
    return null;
  }

  private static detectarValor(msg: string): number | null {
    const valorRegex = /(?:r\$|reais?|valor|até|máximo|mínimo|orçamento)[\s:]*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i;
    const match = msg.match(valorRegex);
    
    if (match) {
      const valorStr = match[1].replace(/\./g, '').replace(',', '.');
      const valor = parseFloat(valorStr);
      return valor > 1000 ? valor : valor * 1000; // Se menor que 1000, assumir que está em milhares
    }
    
    return null;
  }

  private static detectarLocalizacao(msg: string): string | null {
    const localizacoes = [
      'centro', 'zona sul', 'zona norte', 'zona leste', 'zona oeste',
      'barra', 'copacabana', 'ipanema', 'leblon', 'botafogo',
      'tijuca', 'vila isabel', 'méier', 'madureira', 'campo grande'
    ];

    for (const loc of localizacoes) {
      if (msg.includes(loc)) {
        return loc.charAt(0).toUpperCase() + loc.slice(1);
      }
    }
    
    return null;
  }

  private static detectarUrgencia(msg: string): 'baixa' | 'media' | 'alta' {
    const urgenciaAlta = ['urgente', 'rápido', 'asap', 'hoje', 'amanhã', 'imediato'];
    const urgenciaMedia = ['breve', 'logo', 'em breve', 'próxima semana'];

    if (urgenciaAlta.some(u => msg.includes(u))) {
      return 'alta';
    }
    
    if (urgenciaMedia.some(u => msg.includes(u))) {
      return 'media';
    }

    return 'baixa';
  }

  private static calcularScore(
    msg: string,
    tipo: string | null,
    valor: number | null,
    localizacao: string | null,
    urgencia: 'baixa' | 'media' | 'alta'
  ): number {
    let score = 0;

    if (msg.length > 10) score += 20;
    if (tipo) score += 25;
    if (valor) score += 25;
    if (localizacao) score += 15;
    
    if (urgencia === 'alta') score += 15;
    else if (urgencia === 'media') score += 10;
    else score += 5;

    if (msg.length > 50) score += 10;
    if (/\b(contato|ligar|falar|whats|telefone)\b/i.test(msg)) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  private static definirPrioridade(
    score: number,
    urgencia: 'baixa' | 'media' | 'alta',
    valor: number | null
  ): 'baixa' | 'media' | 'alta' | 'urgente' {
    if (score >= 80 || urgencia === 'alta') return 'urgente';
    if (score >= 60 || urgencia === 'media' || (valor && valor > 1000000)) return 'alta';
    if (score >= 40) return 'media';
    return 'baixa';
  }

  private static gerarObservacoes(
    tipo: string | null,
    valor: number | null,
    localizacao: string | null,
    urgencia: 'baixa' | 'media' | 'alta',
    score: number
  ): string {
    const observacoes = [];
    
    if (tipo) observacoes.push(`Interesse em: ${tipo}`);
    if (valor) observacoes.push(`Orçamento: R$ ${valor.toLocaleString()}`);
    if (localizacao) observacoes.push(`Localização: ${localizacao}`);
    if (urgencia === 'alta') observacoes.push('URGENTE - Alta prioridade');
    
    return observacoes.join(' | ');
  }

  // =====================================================
  // MÉTODOS AUXILIARES ADICIONAIS
  // =====================================================

  private static getMostFrequent<T>(arr: T[]): T {
    const frequency: Record<string, number> = {};
    arr.forEach(item => {
      const key = String(item);
      frequency[key] = (frequency[key] || 0) + 1;
    });
    
    return arr.reduce((a, b) => 
      frequency[String(a)] > frequency[String(b)] ? a : b
    );
  }

  private static calculateTimeSpan(history: ConversationContext[]): number {
    if (history.length < 2) return 0;
    
    const first = new Date(history[0].created_at).getTime();
    const last = new Date(history[history.length - 1].created_at).getTime();
    
    return last - first;
  }
}
