import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useToast } from '@/hooks/use-toast';

export interface DashboardMetrics {
  totalLeads: number;
  leadsFechados: number;
  leadsAtivos: number;
  taxaConversao: number;
  valorTotal: number;
  valorMedioLead: number;
  totalCorretores: number;
  corretoresAtivos: number;
}

export interface CorretorPerformance {
  id: string;
  nome: string;
  email: string;
  totalLeads: number;
  leadsFechados: number;
  leadsAtivos: number;
  meta: number;
  conversao: number;
  valorVendido: number;
}

export interface LeadRecente {
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
}

export const useDashboard = () => {
  // ✅ MODO NORMAL: Buscar dados reais do banco
  const EMERGENCY_MODE = false;

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    leadsFechados: 0,
    leadsAtivos: 0,
    taxaConversao: 0,
    valorTotal: 0,
    valorMedioLead: 0,
    totalCorretores: 0,
    corretoresAtivos: 0,
  });
  const [corretoresPerformance, setCorretoresPerformance] = useState<
    CorretorPerformance[]
  >([]);
  const [leadsRecentes, setLeadsRecentes] = useState<LeadRecente[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]); // Para métricas de IA
  const [loading, setLoading] = useState(true);
  const { user } = useUnifiedAuth();
  const { toast } = useToast();

  // Buscar métricas gerais e dados do dashboard
  const fetchDashboardData = useCallback(async () => {
    // 🚨 MODO EMERGÊNCIA: Retornar mock data e não fazer queries
    if (EMERGENCY_MODE) {
      setMetrics({
        totalLeads: 0,
        leadsFechados: 0,
        leadsAtivos: 0,
        taxaConversao: 0,
        valorTotal: 0,
        valorMedioLead: 0,
        totalCorretores: 0,
        corretoresAtivos: 0,
      });
      setCorretoresPerformance([]);
      setLeadsRecentes([]);
      setAllLeads([]);
      setLoading(false);
      return;
    }

    try {
      // ✅ OTIMIZAÇÃO: Cache de dashboard por 60 segundos
      const cacheKey = `dashboard_cache_${user?.id || 'anonymous'}`;
      const cacheTimeKey = `dashboard_time_${user?.id || 'anonymous'}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(cacheTimeKey);

      // Verificar se cache é válido (60 segundos)
      if (cachedData && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        if (cacheAge < 60 * 1000) {
          // 60 segundos
          const data = JSON.parse(cachedData);
          setMetrics(data.metrics);
          setCorretoresPerformance(data.corretoresPerformance);
          setLeadsRecentes(data.leadsRecentes);
          setAllLeads(data.allLeads);
          setLoading(false);
          return;
        }
      }

      // ✅ OTIMIZAÇÃO: Timeout aumentado e tratamento melhorado
      const timeout = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error('Timeout - Queries demoraram mais que 15 segundos')
            ),
          15000
        )
      );

      try {
        // Buscar todos os leads
        const leadsPromise = supabase.from('leads').select('*');

        // Buscar profiles (corretores)
        const profilesPromise = supabase.from('profiles').select('*');

        // Executar queries em paralelo com timeout
        const [leadsResult, profilesResult] = (await Promise.race([
          Promise.all([leadsPromise, profilesPromise]),
          timeout,
        ])) as any;

        const { data: leads, error: leadsError } = leadsResult;
        const { data: profiles, error: profilesError } = profilesResult;

        if (leadsError) throw leadsError;
        if (profilesError) throw profilesError;

        // Calcular métricas
        const totalLeads = leads?.length || 0;
        const leadsFechados =
          leads?.filter(l => l.status.toLowerCase() === 'fechado').length || 0;
        const leadsAtivos =
          leads?.filter(
            l => !['fechado', 'perdido'].includes(l.status.toLowerCase())
          ).length || 0;
        const taxaConversao =
          totalLeads > 0 ? (leadsFechados / totalLeads) * 100 : 0;
        const valorTotal =
          leads
            ?.filter(l => l.status.toLowerCase() === 'fechado')
            .reduce((sum, l) => sum + (l.valor_interesse || 0), 0) || 0;
        const valorMedioLead =
          leadsFechados > 0 ? valorTotal / leadsFechados : 0;
        const totalCorretores =
          profiles?.filter(p => p.cargo === 'corretor').length || 0;
        const corretoresAtivos =
          profiles?.filter(p => p.cargo === 'corretor' && p.ativo).length || 0;

        setMetrics({
          totalLeads,
          leadsFechados,
          leadsAtivos,
          taxaConversao: Number(taxaConversao.toFixed(1)),
          valorTotal,
          valorMedioLead,
          totalCorretores,
          corretoresAtivos,
        });

        // Guardar todos os leads para métricas de IA
        setAllLeads(leads || []);

        // Calcular performance por corretor
        const corretores = profiles?.filter(p => p.cargo === 'corretor') || [];
        const performance = await Promise.all(
          corretores.map(async corretor => {
            const corretorLeads =
              leads?.filter(l => l.corretor === corretor.email) || [];
            const totalLeads = corretorLeads.length;
            const fechados = corretorLeads.filter(
              l => l.status.toLowerCase() === 'fechado'
            ).length;
            const ativos = corretorLeads.filter(
              l => !['fechado', 'perdido'].includes(l.status.toLowerCase())
            ).length;
            const conversao =
              totalLeads > 0 ? (fechados / totalLeads) * 100 : 0;
            const valorVendido = corretorLeads
              .filter(l => l.status.toLowerCase() === 'fechado')
              .reduce((sum, l) => sum + (l.valor_interesse || 0), 0);

            return {
              id: corretor.id,
              nome: corretor.nome,
              email: corretor.email,
              totalLeads,
              leadsFechados: fechados,
              leadsAtivos: ativos,
              meta: 15, // Meta padrão, pode ser configurável
              conversao: Number(conversao.toFixed(1)),
              valorVendido,
            };
          })
        );

        setCorretoresPerformance(performance);

        // Leads recentes (últimos 10)
        const recentes = (leads || [])
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 10)
          .map(lead => ({
            id: lead.id,
            nome: lead.nome,
            corretor: lead.corretor || 'Sem corretor',
            status: lead.status,
            valor: lead.valor_interesse || lead.orcamento || null,
            created_at: lead.created_at,
            score: lead.score_ia || lead.score || null,
            origem: lead.origem || null,
            observacoes: lead.observacoes || null,
            mensagem_inicial: lead.mensagem_inicial || null,
            prioridade: lead.prioridade || null,
            cidade: lead.cidade || null,
            interesse: lead.interesse || lead.imovel_interesse || null,
          }));

        setLeadsRecentes(recentes);

        // ✅ OTIMIZAÇÃO: Salvar no cache
        const cacheData = {
          metrics,
          corretoresPerformance: performance,
          leadsRecentes: recentes,
          allLeads: leads || [],
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        sessionStorage.setItem(cacheTimeKey, Date.now().toString());
      } catch (timeoutError) {
        // Erro específico de timeout - usar dados padrão
        if (timeoutError.message.includes('Timeout')) {
          console.warn('⏰ Timeout no dashboard - usando dados padrão');

          // Dados padrão para não deixar dashboard vazio
          const defaultMetrics = {
            totalLeads: 0,
            leadsFechados: 0,
            leadsAtivos: 0,
            taxaConversao: 0,
            valorTotal: 0,
            valorMedioLead: 0,
            totalCorretores: 0,
            corretoresAtivos: 0,
          };

          setMetrics(defaultMetrics);
          setCorretoresPerformance([]);
          setLeadsRecentes([]);
          setAllLeads([]);

          toast({
            title: 'Carregamento lento',
            description:
              'Os dados estão demorando para carregar. Dashboard carregado com dados padrão.',
            variant: 'default',
          });
        } else {
          throw timeoutError; // Re-throw outros erros
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast({
        title: 'Erro ao carregar dashboard',
        description: 'Não foi possível carregar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user]); // ✅ FIX: toast removido (closure)

  // Exportar relatório
  const exportReport = async () => {
    try {
      // Preparar dados para exportação
      const reportData = {
        dataGeracao: new Date().toLocaleString('pt-BR'),
        metricas: metrics,
        equipe: corretoresPerformance,
        leadsRecentes: leadsRecentes,
      };

      // Converter para CSV
      const csvContent = convertToCSV(reportData);

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `relatorio-gerencial-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório Exportado',
        description: 'Relatório gerencial exportado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: 'Erro na Exportação',
        description: 'Não foi possível exportar o relatório.',
        variant: 'destructive',
      });
    }
  };

  // Converter dados para CSV
  const convertToCSV = (data: any) => {
    let csv = '📊 RELATÓRIO GERENCIAL\\n\\n';
    csv += `Data de Geração: ${data.dataGeracao}\\n\\n`;

    // Métricas Gerais
    csv += '=== MÉTRICAS GERAIS ===\\n';
    csv += `Total de Leads,${data.metricas.totalLeads}\\n`;
    csv += `Leads Fechados,${data.metricas.leadsFechados}\\n`;
    csv += `Taxa de Conversão,${data.metricas.taxaConversao}%\\n`;
    csv += `Valor Total,R$ ${data.metricas.valorTotal.toLocaleString('pt-BR')}\\n`;
    csv += `Total de Corretores,${data.metricas.totalCorretores}\\n\\n`;

    // Performance da Equipe
    csv += '=== PERFORMANCE DA EQUIPE ===\\n';
    csv += 'Nome,Email,Leads Total,Fechados,Taxa Conversão,Valor Vendido\\n';
    data.equipe.forEach((c: CorretorPerformance) => {
      csv += `${c.nome},${c.email},${c.totalLeads},${c.leadsFechados},${c.conversao}%,R$ ${c.valorVendido.toLocaleString('pt-BR')}\\n`;
    });
    csv += '\\n';

    // Leads Recentes
    csv += '=== LEADS RECENTES ===\\n';
    csv += 'Nome,Corretor,Status,Valor,Data\\n';
    data.leadsRecentes.forEach((l: LeadRecente) => {
      csv += `${l.nome},${l.corretor},${l.status},R$ ${l.valor.toLocaleString('pt-BR')},${new Date(l.created_at).toLocaleDateString('pt-BR')}\\n`;
    });

    return csv;
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, fetchDashboardData]);

  return {
    metrics,
    corretoresPerformance,
    leadsRecentes,
    allLeads, // Para métricas de IA
    loading,
    refetch: fetchDashboardData,
    exportReport,
  };
};
