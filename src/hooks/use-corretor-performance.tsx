import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FEATURES } from '@/config/features';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface CorretorPerformance {
  user_id: string;
  email: string;
  corretor_nome: string;

  // Contadores
  total_leads: number;
  leads_ativos: number;
  leads_convertidos: number;
  leads_perdidos: number;

  // Performance
  taxa_conversao: number;
  tempo_medio_primeira_resposta: number | null; // em minutos

  // Qualidade
  score_qualidade: number | null;
  leads_sem_resposta: number | null;

  // Financeiro
  valor_total_vendido: number;
  ticket_medio: number;

  // Controle
  stats_atualizadas_em: string | null;
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  user_id: string | null;
  tipo: string;
  conteudo: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CorretorAlert {
  id: string;
  tipo:
    | 'lead_sem_resposta'
    | 'lead_quente_parado'
    | 'baixa_conversao'
    | 'tempo_resposta_alto';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  corretor_id: string;
  corretor_nome: string;
  lead_id?: string;
  lead_nome?: string;
  mensagem: string;
  valor?: number;
  created_at: string;
}

export interface CorretorRanking {
  posicao: number;
  corretor: CorretorPerformance;
  badges: string[]; // ['🏆 Líder', '⚡ Rápido', '💰 Top Vendas']
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export const useCorretorPerformance = () => {
  const [performances, setPerformances] = useState<CorretorPerformance[]>([]);
  const [ranking, setRanking] = useState<CorretorRanking[]>([]);
  const [alerts, setAlerts] = useState<CorretorAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // =====================================================
  // FETCH: PERFORMANCE DE TODOS OS CORRETORES
  // =====================================================
  const fetchPerformances = useCallback(async () => {
    // ✅ OTIMIZAÇÃO: Pular se feature desabilitada
    if (!FEATURES.CORRETOR_PERFORMANCE) {
      setPerformances([]);
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('v_corretor_performance')
        .select('*')
        .order('taxa_conversao', { ascending: false });

      if (error) {
        // ✅ FIX: Se view não existe (404/PGRST205), retornar array vazio sem erro
        if (
          error.code === 'PGRST116' ||
          error.code === 'PGRST205' ||
          error.message?.includes('relation') ||
          error.message?.includes('does not exist') ||
          error.message?.includes('not find the table')
        ) {
          console.warn(
            '⚠️ View v_corretor_performance não existe ainda. Execute a migration se necessário.'
          );
          setPerformances([]);
          return [];
        }
        throw error;
      }

      setPerformances(data || []);
      return data || [];
    } catch (error: any) {
      console.error('❌ Erro ao buscar performances:', error);
      // ✅ FIX: Não mostrar toast para erro 404/PGRST205 (view não existe)
      if (error.code !== 'PGRST116' && error.code !== 'PGRST205') {
        toast({
          title: 'Erro ao carregar performances',
          description: error.message,
          variant: 'destructive',
        });
      }
      return [];
    }
  }, [toast]);

  // =====================================================
  // CALCULAR RANKING COM BADGES
  // =====================================================
  const calcularRanking = useCallback(
    (perfs: CorretorPerformance[]): CorretorRanking[] => {
      if (!perfs || perfs.length === 0) return [];

      // Ordenar por score de qualidade (principal), depois taxa de conversão
      const sorted = [...perfs].sort((a, b) => {
        const scoreA = a.score_qualidade || 0;
        const scoreB = b.score_qualidade || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.taxa_conversao - a.taxa_conversao;
      });

      // Identificar os melhores em cada categoria
      const melhorConversao = perfs.reduce(
        (max, p) => (p.taxa_conversao > max.taxa_conversao ? p : max),
        perfs[0]
      );
      const melhorVendedor = perfs.reduce(
        (max, p) => (p.valor_total_vendido > max.valor_total_vendido ? p : max),
        perfs[0]
      );
      const maisRapido = perfs
        .filter(
          p =>
            p.tempo_medio_primeira_resposta !== null &&
            p.tempo_medio_primeira_resposta > 0
        )
        .reduce((min, p) => {
          if (!p.tempo_medio_primeira_resposta) return min;
          if (!min.tempo_medio_primeira_resposta) return p;
          return p.tempo_medio_primeira_resposta <
            min.tempo_medio_primeira_resposta
            ? p
            : min;
        }, perfs[0]);

      // Criar ranking com badges
      return sorted.map((corretor, index) => {
        const badges: string[] = [];

        // Badge de posição
        if (index === 0) badges.push('🏆 Líder');
        else if (index === 1) badges.push('🥈 Vice-líder');
        else if (index === 2) badges.push('🥉 Top 3');

        // Badges de destaque
        if (
          corretor.user_id === melhorConversao.user_id &&
          corretor.taxa_conversao >= 70
        ) {
          badges.push('🎯 Melhor Conversão');
        }
        if (
          corretor.user_id === melhorVendedor.user_id &&
          corretor.valor_total_vendido > 0
        ) {
          badges.push('💰 Top Vendas');
        }
        if (
          corretor.user_id === maisRapido.user_id &&
          corretor.tempo_medio_primeira_resposta &&
          corretor.tempo_medio_primeira_resposta <= 30
        ) {
          badges.push('⚡ Mais Rápido');
        }

        // Badge de qualidade
        const score = corretor.score_qualidade || 0;
        if (score >= 90) badges.push('⭐ Excelente');
        else if (score >= 80) badges.push('✨ Ótimo');
        else if (score >= 70) badges.push('👍 Bom');
        else if (score < 50) badges.push('⚠️ Precisa Melhorar');

        return {
          posicao: index + 1,
          corretor,
          badges,
        };
      });
    },
    []
  );

  // =====================================================
  // GERAR ALERTAS AUTOMÁTICOS
  // =====================================================
  const gerarAlertas = useCallback(
    async (perfs: CorretorPerformance[]): Promise<CorretorAlert[]> => {
      const alertsGerados: CorretorAlert[] = [];

      for (const perf of perfs) {
        // Alerta 1: Leads sem resposta
        if (perf.leads_sem_resposta && perf.leads_sem_resposta > 0) {
          alertsGerados.push({
            id: `${perf.user_id}-sem-resposta`,
            tipo: 'lead_sem_resposta',
            severidade:
              perf.leads_sem_resposta >= 5
                ? 'critica'
                : perf.leads_sem_resposta >= 3
                  ? 'alta'
                  : 'media',
            corretor_id: perf.user_id,
            corretor_nome: perf.corretor_nome,
            mensagem: `${perf.leads_sem_resposta} lead(s) sem resposta há mais de 24h`,
            valor: perf.leads_sem_resposta,
            created_at: new Date().toISOString(),
          });
        }

        // Alerta 2: Tempo de resposta alto
        if (
          perf.tempo_medio_primeira_resposta &&
          perf.tempo_medio_primeira_resposta > 120
        ) {
          alertsGerados.push({
            id: `${perf.user_id}-tempo-alto`,
            tipo: 'tempo_resposta_alto',
            severidade:
              perf.tempo_medio_primeira_resposta > 240 ? 'alta' : 'media',
            corretor_id: perf.user_id,
            corretor_nome: perf.corretor_nome,
            mensagem: `Tempo médio de resposta: ${Math.round(perf.tempo_medio_primeira_resposta / 60)}h`,
            valor: perf.tempo_medio_primeira_resposta,
            created_at: new Date().toISOString(),
          });
        }

        // Alerta 3: Baixa conversão (se tiver mais de 10 leads)
        if (perf.total_leads >= 10 && perf.taxa_conversao < 40) {
          alertsGerados.push({
            id: `${perf.user_id}-baixa-conversao`,
            tipo: 'baixa_conversao',
            severidade: perf.taxa_conversao < 25 ? 'alta' : 'media',
            corretor_id: perf.user_id,
            corretor_nome: perf.corretor_nome,
            mensagem: `Taxa de conversão baixa: ${perf.taxa_conversao}%`,
            valor: perf.taxa_conversao,
            created_at: new Date().toISOString(),
          });
        }

        // Alerta 4: Leads quentes parados (score alto sem movimento recente)
        try {
          const { data: leadsQuentes } = await supabase
            .from('leads')
            .select('id, nome, score, created_at')
            .eq('atribuido_a', perf.user_id)
            .gte('score', 80)
            .not('status', 'in', '(convertido,perdido)')
            .lt(
              'created_at',
              new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
            ); // 48h atrás

          if (leadsQuentes && leadsQuentes.length > 0) {
            for (const lead of leadsQuentes) {
              // Verificar se teve interação nas últimas 48h
              const { data: interacoes } = await supabase
                .from('lead_interactions')
                .select('id')
                .eq('lead_id', lead.id)
                .eq('user_id', perf.user_id)
                .gte(
                  'created_at',
                  new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
                )
                .limit(1);

              if (!interacoes || interacoes.length === 0) {
                alertsGerados.push({
                  id: `${lead.id}-quente-parado`,
                  tipo: 'lead_quente_parado',
                  severidade: 'critica',
                  corretor_id: perf.user_id,
                  corretor_nome: perf.corretor_nome,
                  lead_id: lead.id,
                  lead_nome: lead.nome,
                  mensagem: `Lead QUENTE (score ${lead.score}) sem movimento há 48h`,
                  valor: lead.score,
                  created_at: new Date().toISOString(),
                });
              }
            }
          }
        } catch (error) {
          console.error('Erro ao verificar leads quentes:', error);
        }
      }

      // Ordenar por severidade
      const severidadeOrder = { critica: 0, alta: 1, media: 2, baixa: 3 };
      alertsGerados.sort(
        (a, b) => severidadeOrder[a.severidade] - severidadeOrder[b.severidade]
      );

      return alertsGerados;
    },
    []
  );

  // =====================================================
  // FETCH: HISTÓRICO DE INTERAÇÕES DE UM LEAD
  // =====================================================
  const fetchLeadInteractions = useCallback(
    async (leadId: string): Promise<LeadInteraction[]> => {
      try {
        const { data, error } = await supabase
          .from('lead_interactions')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error('❌ Erro ao buscar interações:', error);
        toast({
          title: 'Erro ao carregar histórico',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    [toast]
  );

  // =====================================================
  // ACTION: ADICIONAR INTERAÇÃO MANUAL
  // =====================================================
  const addInteraction = useCallback(
    async (
      leadId: string,
      tipo: string,
      conteudo: string,
      metadata?: Record<string, any>
    ) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { error } = await supabase.from('lead_interactions').insert({
          lead_id: leadId,
          user_id: user.id,
          tipo,
          conteudo,
          metadata: metadata || {},
        });

        if (error) throw error;

        toast({
          title: 'Interação registrada',
          description: 'O histórico foi atualizado.',
        });

        // Atualizar stats do corretor
        await supabase.rpc('atualizar_corretor_stats', { p_user_id: user.id });

        return true;
      } catch (error: any) {
        console.error('❌ Erro ao adicionar interação:', error);
        toast({
          title: 'Erro ao registrar interação',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  // =====================================================
  // ACTION: FORÇAR ATUALIZAÇÃO DE STATS
  // =====================================================
  const forceUpdateStats = useCallback(
    async (userId?: string) => {
      try {
        if (userId) {
          // Atualizar um corretor específico
          const { error } = await supabase.rpc('atualizar_corretor_stats', {
            p_user_id: userId,
          });
          if (error) throw error;
        } else {
          // Atualizar todos os corretores
          const { data: corretores } = await supabase
            .from('profiles')
            .select('id')
            .eq('cargo', 'corretor');

          if (corretores) {
            for (const corretor of corretores) {
              await supabase.rpc('atualizar_corretor_stats', {
                p_user_id: corretor.id,
              });
            }
          }
        }

        toast({
          title: 'Estatísticas atualizadas',
          description: 'Os dados foram recalculados.',
        });

        await refetch();
        return true;
      } catch (error: any) {
        console.error('❌ Erro ao atualizar stats:', error);
        toast({
          title: 'Erro ao atualizar estatísticas',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  // =====================================================
  // REFETCH: RECARREGAR TODOS OS DADOS
  // =====================================================
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const perfs = await fetchPerformances();
      const newRanking = calcularRanking(perfs);
      const newAlerts = await gerarAlertas(perfs);

      setRanking(newRanking);
      setAlerts(newAlerts);
    } catch (error) {
      console.error('❌ Erro ao recarregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchPerformances, calcularRanking, gerarAlertas]);

  // =====================================================
  // EFFECT: CARREGAR DADOS INICIAIS
  // =====================================================
  useEffect(() => {
    refetch();
  }, [refetch]);

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================
  return {
    // Dados
    performances,
    ranking,
    alerts,
    loading,

    // Ações
    fetchLeadInteractions,
    addInteraction,
    forceUpdateStats,
    refetch,
  };
};
