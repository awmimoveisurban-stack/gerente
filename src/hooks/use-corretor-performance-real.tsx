import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface CorretorPerformanceReal {
  user_id: string;
  email: string;
  corretor_nome: string;
  total_leads: number;
  leads_ativos: number;
  leads_convertidos: number;
  leads_perdidos: number;
  taxa_conversao: number;
  tempo_medio_primeira_resposta: number;
  score_qualidade: number;
  leads_sem_resposta: number;
  valor_total_vendido: number;
  ticket_medio: number;
  stats_atualizadas_em: string;
}

export interface PerformanceMetricsReal {
  totalCorretores: number;
  totalLeads: number;
  totalConvertidos: number;
  taxaMediaConversao: number;
  valorTotalVendido: number;
  tempoMedioResposta: number;
  leadsAtivos: number;
  leadsPerdidos: number;
}

export interface CorretorAlert {
  id: string;
  tipo: 'lead_sem_resposta' | 'lead_quente_parado' | 'baixa_conversao' | 'tempo_resposta_alto';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  corretor_id: string;
  corretor_nome: string;
  lead_id?: string;
  lead_nome?: string;
  mensagem: string;
  valor?: number;
  created_at: string;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export const useCorretorPerformanceReal = () => {
  const [performances, setPerformances] = useState<CorretorPerformanceReal[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetricsReal | null>(null);
  const [alerts, setAlerts] = useState<CorretorAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // =====================================================
  // FETCH: PERFORMANCE DE TODOS OS CORRETORES
  // =====================================================
  const fetchPerformances = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Buscar todos os corretores ativos
      const { data: corretoresData, error: corretoresError } = await supabase
        .from('profiles')
        .select('id, email, nome, cargo, ativo')
        .eq('cargo', 'corretor')
        .eq('ativo', true);

      if (corretoresError) {
        console.error('Erro ao buscar corretores:', corretoresError);
        throw corretoresError;
      }

      if (!corretoresData || corretoresData.length === 0) {
        setPerformances([]);
        setMetrics({
          totalCorretores: 0,
          totalLeads: 0,
          totalConvertidos: 0,
          taxaMediaConversao: 0,
          valorTotalVendido: 0,
          tempoMedioResposta: 0,
          leadsAtivos: 0,
          leadsPerdidos: 0,
        });
        return;
      }

      const performancesData: CorretorPerformanceReal[] = [];

      // 2. Para cada corretor, calcular métricas reais
      for (const corretor of corretoresData) {
        try {
          // Buscar leads do corretor usando múltiplos critérios
          const { data: leadsData, error: leadsError } = await supabase
            .from('leads')
            .select('*')
            .or(`corretor.eq.${corretor.email},user_id.eq.${corretor.id},atribuido_a.eq.${corretor.id}`);

          if (leadsError) {
            console.error(`Erro ao buscar leads do corretor ${corretor.nome}:`, leadsError);
            continue;
          }

          const leads = leadsData || [];
          
          // Calcular métricas básicas
          const totalLeads = leads.length;
          const leadsAtivos = leads.filter(l => 
            !['convertido', 'perdido', 'cancelado'].includes(l.status?.toLowerCase() || '')
          ).length;
          const leadsConvertidos = leads.filter(l => 
            l.status?.toLowerCase() === 'convertido'
          ).length;
          const leadsPerdidos = leads.filter(l => 
            l.status?.toLowerCase() === 'perdido'
          ).length;
          
          // Calcular taxa de conversão
          const taxaConversao = totalLeads > 0 
            ? Math.round((leadsConvertidos / totalLeads) * 100) 
            : 0;
          
          // Calcular valor total vendido
          const valorTotalVendido = leads
            .filter(l => l.status?.toLowerCase() === 'convertido')
            .reduce((sum, l) => {
              const valor = l.valor_interesse || l.orcamento || 0;
              return sum + (typeof valor === 'number' ? valor : 0);
            }, 0);
          
          // Calcular ticket médio
          const ticketMedio = leadsConvertidos > 0 
            ? Math.round(valorTotalVendido / leadsConvertidos) 
            : 0;

          // Calcular score de qualidade baseado em métricas reais
          const scoreQualidade = Math.min(100, Math.max(0, 
            (taxaConversao * 0.4) + 
            (Math.max(0, 100 - (leadsPerdidos * 2)) * 0.3) +
            (Math.max(0, 100 - (leadsAtivos * 0.5)) * 0.3)
          ));

          // Calcular tempo médio de primeira resposta (mock por enquanto)
          // TODO: Implementar cálculo real baseado em interações
          const tempoMedioPrimeiraResposta = Math.floor(Math.random() * 30) + 5;

          // Calcular leads sem resposta (mock por enquanto)
          // TODO: Implementar cálculo real baseado em última interação
          const leadsSemResposta = Math.floor(Math.random() * Math.min(3, leadsAtivos));

          performancesData.push({
            user_id: corretor.id,
            email: corretor.email,
            corretor_nome: corretor.nome,
            total_leads: totalLeads,
            leads_ativos: leadsAtivos,
            leads_convertidos: leadsConvertidos,
            leads_perdidos: leadsPerdidos,
            taxa_conversao: taxaConversao,
            tempo_medio_primeira_resposta: tempoMedioPrimeiraResposta,
            score_qualidade: Math.round(scoreQualidade),
            leads_sem_resposta: leadsSemResposta,
            valor_total_vendido: valorTotalVendido,
            ticket_medio: ticketMedio,
            stats_atualizadas_em: new Date().toISOString(),
          });

        } catch (error) {
          console.error(`Erro ao processar dados do corretor ${corretor.nome}:`, error);
          continue;
        }
      }

      // 3. Ordenar por taxa de conversão (melhores primeiro)
      performancesData.sort((a, b) => b.taxa_conversao - a.taxa_conversao);
      setPerformances(performancesData);

      // 4. Calcular métricas gerais
      const totalCorretores = performancesData.length;
      const totalLeads = performancesData.reduce((sum, p) => sum + p.total_leads, 0);
      const totalConvertidos = performancesData.reduce((sum, p) => sum + p.leads_convertidos, 0);
      const leadsAtivos = performancesData.reduce((sum, p) => sum + p.leads_ativos, 0);
      const leadsPerdidos = performancesData.reduce((sum, p) => sum + p.leads_perdidos, 0);
      
      const taxaMediaConversao = totalLeads > 0 
        ? Math.round((totalConvertidos / totalLeads) * 100) 
        : 0;
      
      const valorTotalVendido = performancesData.reduce((sum, p) => sum + p.valor_total_vendido, 0);
      
      const tempoMedioResposta = performancesData.length > 0 
        ? Math.round(performancesData.reduce((sum, p) => sum + p.tempo_medio_primeira_resposta, 0) / performancesData.length)
        : 0;

      setMetrics({
        totalCorretores,
        totalLeads,
        totalConvertidos,
        taxaMediaConversao,
        valorTotalVendido,
        tempoMedioResposta,
        leadsAtivos,
        leadsPerdidos,
      });

      // 5. Gerar alertas baseados nos dados
      generateAlerts(performancesData);

    } catch (error) {
      console.error('Erro ao buscar dados de performance:', error);
      toast({
        title: '❌ Erro ao Carregar Dados',
        description: 'Não foi possível carregar os dados de performance.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // =====================================================
  // GERAR ALERTAS AUTOMATICAMENTE
  // =====================================================
  const generateAlerts = (performancesData: CorretorPerformanceReal[]) => {
    const alertsData: CorretorAlert[] = [];

    performancesData.forEach((performance) => {
      // Alerta para baixa conversão
      if (performance.taxa_conversao < 30) {
        alertsData.push({
          id: `baixa_conversao_${performance.user_id}`,
          tipo: 'baixa_conversao',
          severidade: performance.taxa_conversao < 15 ? 'critica' : 'alta',
          corretor_id: performance.user_id,
          corretor_nome: performance.corretor_nome,
          mensagem: `Taxa de conversão muito baixa (${performance.taxa_conversao}%). Considere treinamento adicional.`,
          created_at: new Date().toISOString(),
        });
      }

      // Alerta para leads sem resposta
      if (performance.leads_sem_resposta > 0) {
        alertsData.push({
          id: `sem_resposta_${performance.user_id}`,
          tipo: 'lead_sem_resposta',
          severidade: performance.leads_sem_resposta > 2 ? 'alta' : 'media',
          corretor_id: performance.user_id,
          corretor_nome: performance.corretor_nome,
          mensagem: `${performance.leads_sem_resposta} leads sem resposta. Ação necessária.`,
          created_at: new Date().toISOString(),
        });
      }

      // Alerta para tempo de resposta alto
      if (performance.tempo_medio_primeira_resposta > 60) {
        alertsData.push({
          id: `tempo_alto_${performance.user_id}`,
          tipo: 'tempo_resposta_alto',
          severidade: performance.tempo_medio_primeira_resposta > 120 ? 'alta' : 'media',
          corretor_id: performance.user_id,
          corretor_nome: performance.corretor_nome,
          mensagem: `Tempo médio de resposta alto (${performance.tempo_medio_primeira_resposta}min). Melhore a agilidade.`,
          created_at: new Date().toISOString(),
        });
      }
    });

    setAlerts(alertsData);
  };

  // =====================================================
  // FUNÇÕES DE UTILIDADE
  // =====================================================
  const refetch = useCallback(() => {
    return fetchPerformances();
  }, [fetchPerformances]);

  const forceUpdateStats = useCallback(async () => {
    await fetchPerformances();
  }, [fetchPerformances]);

  // =====================================================
  // EFFECTS
  // =====================================================
  useEffect(() => {
    fetchPerformances();
  }, [fetchPerformances]);

  // =====================================================
  // RETORNO
  // =====================================================
  return {
    performances,
    metrics,
    alerts,
    loading,
    refetch,
    forceUpdateStats,
  };
};
