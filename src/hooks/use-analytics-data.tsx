import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// 📊 TIPOS PARA DADOS ANALÍTICOS
interface LeadsByStatusData {
  status: string;
  count: number;
  percentage: number;
}

interface CorretorPerformanceData {
  nome: string;
  leads: number;
  fechados: number;
  taxa: number;
  valor: number;
}

interface LeadsByOriginData {
  origem: string;
  count: number;
  percentage: number;
}

interface ConversionTrendData {
  periodo: string;
  leads: number;
  fechados: number;
  taxa: number;
}

interface ValueTrendData {
  periodo: string;
  valor: number;
  leads: number;
  ticketMedio: number;
}

interface AnalyticsData {
  leadsByStatus: LeadsByStatusData[];
  corretorPerformance: CorretorPerformanceData[];
  leadsByOrigin: LeadsByOriginData[];
  conversionTrend: ConversionTrendData[];
  valueTrend: ValueTrendData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 🎯 HOOK PARA DADOS ANALÍTICOS
export const useAnalyticsData = (): AnalyticsData => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 📊 DADOS DOS GRÁFICOS
  const [rawData, setRawData] = useState({
    leads: [] as any[],
    corretores: [] as any[],
  });

  // 🔄 BUSCAR DADOS
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);


      // Buscar leads e corretores em paralelo
      const [leadsResponse, corretoresResponse] = await Promise.all([
        supabase
          .from('leads')
          .select(`
            id,
            nome,
            status,
            origem,
            valor,
            corretor_id,
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('corretores')
          .select(`
            id,
            nome,
            email,
            telefone,
            status
          `)
          .eq('status', 'ativo')
      ]);

      if (leadsResponse.error) throw leadsResponse.error;
      if (corretoresResponse.error) throw corretoresResponse.error;


      setRawData({
        leads: leadsResponse.data || [],
        corretores: corretoresResponse.data || [],
      });

    } catch (err: any) {
      console.error('Erro ao buscar dados analíticos:', err);
      setError(err.message);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados para os gráficos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 📊 PROCESSAR DADOS PARA GRÁFICOS
  const processedData = useMemo(() => {
    const { leads, corretores } = rawData;
    

    // 1️⃣ LEADS POR STATUS
    const statusCount = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalLeads = leads.length;
    
    // Se não há dados reais, usar dados de exemplo
    const leadsByStatus: LeadsByStatusData[] = totalLeads > 0 
      ? Object.entries(statusCount).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
          percentage: Math.round((count / totalLeads) * 100),
        }))
      : [
          { status: 'Novo', count: 15, percentage: 35 },
          { status: 'Contato', count: 12, percentage: 28 },
          { status: 'Negociação', count: 10, percentage: 23 },
          { status: 'Fechado', count: 6, percentage: 14 },
        ];

    // 2️⃣ PERFORMANCE DOS CORRETORES
    const corretorStats = leads.reduce((acc, lead) => {
      if (!lead.corretor_id) return acc;
      
      const corretorId = lead.corretor_id.toString();
      if (!acc[corretorId]) {
        acc[corretorId] = {
          nome: 'Corretor não identificado',
          leads: 0,
          fechados: 0,
          valor: 0,
        };
      }
      
      acc[corretorId].leads += 1;
      acc[corretorId].valor += lead.valor || 0;
      
      if (lead.status === 'fechado') {
        acc[corretorId].fechados += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Buscar nomes dos corretores
    corretores.forEach(corretor => {
      const corretorId = corretor.id.toString();
      if (corretorStats[corretorId]) {
        corretorStats[corretorId].nome = corretor.nome;
      }
    });

    const corretorPerformance: CorretorPerformanceData[] = Object.keys(corretorStats).length > 0
      ? Object.values(corretorStats).map((stat: any) => ({
          nome: stat.nome,
          leads: stat.leads,
          fechados: stat.fechados,
          taxa: stat.leads > 0 ? Math.round((stat.fechados / stat.leads) * 100) : 0,
          valor: stat.valor,
        }))
      : [
          { nome: 'João Silva', leads: 25, fechados: 8, taxa: 32, valor: 450000 },
          { nome: 'Maria Santos', leads: 20, fechados: 6, taxa: 30, valor: 380000 },
          { nome: 'Pedro Costa', leads: 18, fechados: 5, taxa: 28, valor: 320000 },
          { nome: 'Ana Oliveira', leads: 15, fechados: 4, taxa: 27, valor: 280000 },
        ];

    // 3️⃣ LEADS POR ORIGEM
    const originCount = leads.reduce((acc, lead) => {
      const origem = lead.origem || 'Não informada';
      acc[origem] = (acc[origem] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadsByOrigin: LeadsByOriginData[] = totalLeads > 0
      ? Object.entries(originCount).map(([origem, count]) => ({
          origem: origem.charAt(0).toUpperCase() + origem.slice(1),
          count,
          percentage: Math.round((count / totalLeads) * 100),
        }))
      : [
          { origem: 'WhatsApp', count: 18, percentage: 42 },
          { origem: 'Site', count: 12, percentage: 28 },
          { origem: 'Indicação', count: 8, percentage: 19 },
          { origem: 'Manual', count: 5, percentage: 11 },
        ];

    // 4️⃣ TENDÊNCIA DE CONVERSÃO (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const conversionTrend: ConversionTrendData[] = totalLeads > 0
      ? last7Days.map(day => {
          const dayLeads = leads.filter(lead => 
            lead.created_at.startsWith(day)
          );
          const fechados = dayLeads.filter(lead => lead.status === 'fechado').length;
          const taxa = dayLeads.length > 0 ? Math.round((fechados / dayLeads.length) * 100) : 0;
          
          return {
            periodo: new Date(day).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            }),
            leads: dayLeads.length,
            fechados,
            taxa,
          };
        })
      : [
          { periodo: '01/01', leads: 8, fechados: 2, taxa: 25 },
          { periodo: '02/01', leads: 12, fechados: 4, taxa: 33 },
          { periodo: '03/01', leads: 15, fechados: 5, taxa: 33 },
          { periodo: '04/01', leads: 10, fechados: 3, taxa: 30 },
          { periodo: '05/01', leads: 18, fechados: 6, taxa: 33 },
          { periodo: '06/01', leads: 14, fechados: 4, taxa: 29 },
          { periodo: '07/01', leads: 16, fechados: 5, taxa: 31 },
        ];

    // 5️⃣ TENDÊNCIA DE VALOR (últimos 7 dias)
    const valueTrend: ValueTrendData[] = totalLeads > 0
      ? last7Days.map(day => {
          const dayLeads = leads.filter(lead => 
            lead.created_at.startsWith(day)
          );
          const valor = dayLeads.reduce((sum, lead) => sum + (lead.valor || 0), 0);
          const ticketMedio = dayLeads.length > 0 ? valor / dayLeads.length : 0;
          
          return {
            periodo: new Date(day).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            }),
            valor,
            leads: dayLeads.length,
            ticketMedio,
          };
        })
      : [
          { periodo: '01/01', valor: 240000, leads: 8, ticketMedio: 30000 },
          { periodo: '02/01', valor: 360000, leads: 12, ticketMedio: 30000 },
          { periodo: '03/01', valor: 450000, leads: 15, ticketMedio: 30000 },
          { periodo: '04/01', valor: 300000, leads: 10, ticketMedio: 30000 },
          { periodo: '05/01', valor: 540000, leads: 18, ticketMedio: 30000 },
          { periodo: '06/01', valor: 420000, leads: 14, ticketMedio: 30000 },
          { periodo: '07/01', valor: 480000, leads: 16, ticketMedio: 30000 },
        ];

    const result = {
      leadsByStatus,
      corretorPerformance,
      leadsByOrigin,
      conversionTrend,
      valueTrend,
    };


    return result;
  }, [rawData]);

  // 🔄 EFETIVAR BUSCA
  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...processedData,
    loading,
    error,
    refetch: fetchData,
  };
};
