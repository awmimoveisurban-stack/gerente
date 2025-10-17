import { useMemo } from 'react';
import type { Lead } from './use-leads';

interface AIMetrics {
  totalComIA: number;
  leadsQuentes: number;
  leadsMornos: number;
  leadsFrios: number;
  scoreMedio: number;
  conversaoQuentes: number;
  conversaoMornos: number;
  conversaoFrios: number;
  valorMedioQuentes: number;
  valorMedioMornos: number;
  valorMedioFrios: number;
}

// Função auxiliar para extrair score
function extractAIScore(observacoes?: string | null): number | null {
  if (!observacoes) return null;
  const scoreMatch = observacoes.match(/Score:\s*(\d+)\/100/);
  return scoreMatch ? parseInt(scoreMatch[1]) : null;
}

export function useAIMetrics(leads: Lead[]): AIMetrics {
  return useMemo(() => {
    // Filtrar apenas leads com análise de IA
    const leadsComIA = leads.filter(
      lead => extractAIScore(lead.observacoes) !== null
    );

    // Classificar por score
    const leadsQuentes = leadsComIA.filter(lead => {
      const score = extractAIScore(lead.observacoes);
      return score && score >= 71;
    });

    const leadsMornos = leadsComIA.filter(lead => {
      const score = extractAIScore(lead.observacoes);
      return score && score >= 41 && score <= 70;
    });

    const leadsFrios = leadsComIA.filter(lead => {
      const score = extractAIScore(lead.observacoes);
      return score && score <= 40;
    });

    // Calcular score médio
    const scores = leadsComIA
      .map(lead => extractAIScore(lead.observacoes))
      .filter(s => s !== null) as number[];
    const scoreMedio =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          )
        : 0;

    // Calcular taxas de conversão
    const calcularConversao = (leadsCategoria: Lead[]) => {
      if (leadsCategoria.length === 0) return 0;
      const fechados = leadsCategoria.filter(
        l => l.status.toLowerCase() === 'fechado'
      ).length;
      return (fechados / leadsCategoria.length) * 100;
    };

    const conversaoQuentes = calcularConversao(leadsQuentes);
    const conversaoMornos = calcularConversao(leadsMornos);
    const conversaoFrios = calcularConversao(leadsFrios);

    // Calcular valor médio por categoria
    const calcularValorMedio = (leadsCategoria: Lead[]) => {
      const fechados = leadsCategoria.filter(
        l => l.status.toLowerCase() === 'fechado'
      );
      if (fechados.length === 0) return 0;
      const valorTotal = fechados.reduce(
        (sum, l) => sum + (l.valor_interesse || 0),
        0
      );
      return valorTotal / fechados.length;
    };

    const valorMedioQuentes = calcularValorMedio(leadsQuentes);
    const valorMedioMornos = calcularValorMedio(leadsMornos);
    const valorMedioFrios = calcularValorMedio(leadsFrios);

    return {
      totalComIA: leadsComIA.length,
      leadsQuentes: leadsQuentes.length,
      leadsMornos: leadsMornos.length,
      leadsFrios: leadsFrios.length,
      scoreMedio,
      conversaoQuentes,
      conversaoMornos,
      conversaoFrios,
      valorMedioQuentes,
      valorMedioMornos,
      valorMedioFrios,
    };
  }, [leads]);
}



