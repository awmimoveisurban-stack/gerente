import { formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// 🎯 INTERFACE PARA LEAD COM DADOS COMPLETOS
export interface LeadCompleto {
  id: string;
  nome: string;
  corretor: string;
  status: string;
  valor: number | null;
  created_at: string;
  score?: number | null;
  origem?: string | null;
  observacoes?: string | null;
  mensagem_inicial?: string | null;
  prioridade?: string | null;
  cidade?: string | null;
  interesse?: string | null;
  last_interaction_at?: string | null;
  telefone?: string | null;
  email?: string | null;
  orcamento?: number | null;
  valor_interesse?: number | null;
}

// 🎯 CALCULAR PROBABILIDADE DE FECHAMENTO
export const calcularProbabilidadeFechamento = (lead: LeadCompleto): number => {
  let probabilidade = 0;

  // Score base (0-40 pontos)
  if (lead.score) {
    probabilidade += Math.min(lead.score * 0.4, 40);
  }

  // Status do lead (0-30 pontos)
  switch (lead.status?.toLowerCase()) {
    case 'fechado':
      probabilidade += 30;
      break;
    case 'proposta_enviada':
      probabilidade += 25;
      break;
    case 'visita_agendada':
      probabilidade += 20;
      break;
    case 'interessado':
      probabilidade += 15;
      break;
    case 'contato_inicial':
      probabilidade += 10;
      break;
    case 'qualificado':
      probabilidade += 5;
      break;
    default:
      probabilidade += 5;
  }

  // Prioridade (0-15 pontos)
  switch (lead.prioridade?.toLowerCase()) {
    case 'urgente':
      probabilidade += 15;
      break;
    case 'alta':
      probabilidade += 12;
      break;
    case 'media':
      probabilidade += 8;
      break;
    case 'baixa':
      probabilidade += 3;
      break;
    default:
      probabilidade += 5;
  }

  // Tempo no pipeline (0-10 pontos)
  const diasNoPipeline = calcularTempoNoPipeline(lead.created_at);
  if (diasNoPipeline <= 7) {
    probabilidade += 10; // Leads novos têm mais chance
  } else if (diasNoPipeline <= 30) {
    probabilidade += 5;
  } else if (diasNoPipeline <= 90) {
    probabilidade += 2;
  } else {
    probabilidade -= 5; // Leads muito antigos perdem chance
  }

  // Interação recente (0-5 pontos)
  if (lead.last_interaction_at) {
    const diasUltimaInteracao = calcularTempoNoPipeline(lead.last_interaction_at);
    if (diasUltimaInteracao <= 1) {
      probabilidade += 5;
    } else if (diasUltimaInteracao <= 3) {
      probabilidade += 3;
    } else if (diasUltimaInteracao <= 7) {
      probabilidade += 1;
    } else {
      probabilidade -= 2; // Sem interação recente reduz chance
    }
  }

  // Valor do interesse (0-5 pontos)
  if (lead.valor_interesse || lead.orcamento) {
    const valor = lead.valor_interesse || lead.orcamento || 0;
    if (valor >= 2000000) {
      probabilidade += 5; // Leads de alto valor
    } else if (valor >= 1000000) {
      probabilidade += 3;
    } else if (valor >= 500000) {
      probabilidade += 2;
    } else {
      probabilidade += 1;
    }
  }

  // Origem (0-5 pontos)
  switch (lead.origem?.toLowerCase()) {
    case 'indicacao':
      probabilidade += 5; // Indicações têm maior chance
      break;
    case 'whatsapp':
      probabilidade += 4;
      break;
    case 'site':
      probabilidade += 3;
      break;
    case 'manual':
      probabilidade += 2;
      break;
    default:
      probabilidade += 1;
  }

  // Garantir que a probabilidade esteja entre 0 e 100
  return Math.max(0, Math.min(100, Math.round(probabilidade)));
};

// 🎯 CALCULAR URGÊNCIA
export const calcularUrgencia = (lead: LeadCompleto): 'alta' | 'media' | 'baixa' => {
  let pontosUrgencia = 0;

  // Prioridade alta = urgência alta
  if (lead.prioridade === 'urgente') {
    return 'alta';
  }

  // Score muito alto = urgência alta
  if (lead.score && lead.score >= 90) {
    pontosUrgencia += 3;
  }

  // Sem interação recente = urgência alta
  if (lead.last_interaction_at) {
    const diasUltimaInteracao = calcularTempoNoPipeline(lead.last_interaction_at);
    if (diasUltimaInteracao > 7) {
      pontosUrgencia += 2;
    }
  } else {
    pontosUrgencia += 2; // Nunca teve interação
  }

  // Lead muito antigo = urgência alta
  const diasNoPipeline = calcularTempoNoPipeline(lead.created_at);
  if (diasNoPipeline > 30) {
    pontosUrgencia += 2;
  }

  // Status que requer ação = urgência alta
  if (['contato_inicial', 'qualificado', 'interessado'].includes(lead.status?.toLowerCase() || '')) {
    pontosUrgencia += 1;
  }

  // Determinar urgência baseada nos pontos
  if (pontosUrgencia >= 4) {
    return 'alta';
  } else if (pontosUrgencia >= 2) {
    return 'media';
  } else {
    return 'baixa';
  }
};

// 🎯 SUGERIR PRÓXIMA AÇÃO
export const sugerirProximaAcao = (lead: LeadCompleto): 'ligar' | 'whatsapp' | 'email' | 'visita' | 'proposta' | 'aguardar' => {
  const status = lead.status?.toLowerCase() || '';
  const diasUltimaInteracao = lead.last_interaction_at ? calcularTempoNoPipeline(lead.last_interaction_at) : 999;
  const diasNoPipeline = calcularTempoNoPipeline(lead.created_at);

  // Se nunca teve interação, sempre sugerir contato inicial
  if (!lead.last_interaction_at) {
    if (lead.origem === 'whatsapp') {
      return 'whatsapp';
    } else if (lead.telefone) {
      return 'ligar';
    } else if (lead.email) {
      return 'email';
    } else {
      return 'ligar';
    }
  }

  // Se não teve interação há mais de 7 dias, urgir contato
  if (diasUltimaInteracao > 7) {
    if (lead.origem === 'whatsapp') {
      return 'whatsapp';
    } else {
      return 'ligar';
    }
  }

  // Sugestões baseadas no status
  switch (status) {
    case 'contato_inicial':
      if (lead.origem === 'whatsapp') {
        return 'whatsapp';
      } else {
        return 'ligar';
      }
    
    case 'qualificado':
      return 'ligar';
    
    case 'interessado':
      if (diasNoPipeline > 14) {
        return 'visita';
      } else {
        return 'ligar';
      }
    
    case 'visita_agendada':
      return 'aguardar';
    
    case 'proposta_enviada':
      return 'aguardar';
    
    case 'negociacao':
      return 'proposta';
    
    default:
      return 'ligar';
  }
};

// 🎯 CALCULAR TEMPO NO PIPELINE
export const calcularTempoNoPipeline = (dataString: string): number => {
  try {
    const data = parseISO(dataString);
    return differenceInDays(new Date(), data);
  } catch (error) {
    return 0;
  }
};

// 🎯 DETERMINAR CANAL PREFERIDO
export const determinarCanalPreferido = (lead: LeadCompleto): 'whatsapp' | 'telefone' | 'email' | 'site' | 'presencial' => {
  // Se origem é WhatsApp, preferir WhatsApp
  if (lead.origem === 'whatsapp') {
    return 'whatsapp';
  }

  // Se tem telefone, preferir telefone
  if (lead.telefone) {
    return 'telefone';
  }

  // Se tem email, preferir email
  if (lead.email) {
    return 'email';
  }

  // Se origem é site, preferir site
  if (lead.origem === 'site') {
    return 'site';
  }

  // Default para presencial
  return 'presencial';
};

// 🎯 ANALISAR SENTIMENTO
export const analisarSentimento = (lead: LeadCompleto): 'positivo' | 'neutro' | 'negativo' => {
  // Análise simples baseada em palavras-chave nas observações
  const observacoes = (lead.observacoes || '').toLowerCase();
  const mensagemInicial = (lead.mensagem_inicial || '').toLowerCase();
  const textoCompleto = `${observacoes} ${mensagemInicial}`;

  // Palavras positivas
  const palavrasPositivas = [
    'interessado', 'gostei', 'ótimo', 'excelente', 'perfeito', 'quero', 'sim',
    'legal', 'bom', 'top', 'incrível', 'fantástico', 'maravilhoso', 'adorei'
  ];

  // Palavras negativas
  const palavrasNegativas = [
    'não', 'não quero', 'não gostei', 'ruim', 'péssimo', 'horrível', 'caro',
    'muito caro', 'não tenho', 'não posso', 'impossível', 'difícil', 'complicado'
  ];

  let pontosPositivos = 0;
  let pontosNegativos = 0;

  // Contar palavras positivas
  palavrasPositivas.forEach(palavra => {
    if (textoCompleto.includes(palavra)) {
      pontosPositivos++;
    }
  });

  // Contar palavras negativas
  palavrasNegativas.forEach(palavra => {
    if (textoCompleto.includes(palavra)) {
      pontosNegativos++;
    }
  });

  // Determinar sentimento
  if (pontosPositivos > pontosNegativos) {
    return 'positivo';
  } else if (pontosNegativos > pontosPositivos) {
    return 'negativo';
  } else {
    return 'neutro';
  }
};

// 🎯 DETERMINAR FAIXA DE PREÇO
export const determinarFaixaPreco = (lead: LeadCompleto): 'baixo' | 'medio' | 'alto' | 'premium' => {
  const valor = lead.valor_interesse || lead.orcamento || lead.valor || 0;

  if (valor >= 2000000) {
    return 'premium';
  } else if (valor >= 1000000) {
    return 'alto';
  } else if (valor >= 500000) {
    return 'medio';
  } else if (valor > 0) {
    return 'baixo';
  } else {
    return 'baixo'; // Default para baixo quando não informado
  }
};

// 🎯 FORMATAR DATA RELATIVA
export const formatarDataRelativa = (dataString?: string | null): string => {
  if (!dataString) return 'Nunca';
  
  try {
    const data = parseISO(dataString);
    return formatDistanceToNow(data, { addSuffix: true, locale: ptBR });
  } catch (error) {
    return 'Data inválida';
  }
};

// 🎯 CALCULAR TAXA DE RESPOSTA
export const calcularTaxaResposta = (lead: LeadCompleto): number => {
  // Simulação baseada em dados disponíveis
  // Em um sistema real, isso viria de dados históricos de interações
  
  let taxaBase = 50; // Taxa base de 50%

  // Ajustar baseado na origem
  switch (lead.origem?.toLowerCase()) {
    case 'whatsapp':
      taxaBase += 20; // WhatsApp tem alta taxa de resposta
      break;
    case 'indicacao':
      taxaBase += 15; // Indicações respondem bem
      break;
    case 'site':
      taxaBase += 5;
      break;
    case 'manual':
      taxaBase -= 5;
      break;
  }

  // Ajustar baseado no score
  if (lead.score) {
    taxaBase += (lead.score - 50) * 0.3; // Score influencia taxa de resposta
  }

  // Ajustar baseado no tempo no pipeline
  const diasNoPipeline = calcularTempoNoPipeline(lead.created_at);
  if (diasNoPipeline <= 3) {
    taxaBase += 10; // Leads novos respondem mais
  } else if (diasNoPipeline > 30) {
    taxaBase -= 15; // Leads antigos respondem menos
  }

  return Math.max(0, Math.min(100, Math.round(taxaBase)));
};
