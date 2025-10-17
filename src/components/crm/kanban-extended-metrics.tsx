import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Users,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Lead } from '@/hooks/use-leads';

interface KanbanExtendedMetricsProps {
  leads: Lead[];
  profiles: Array<{ id: string; email: string; full_name: string }>;
}

export const KanbanExtendedMetrics = memo(function KanbanExtendedMetrics({
  leads,
  profiles,
}: KanbanExtendedMetricsProps) {
  // ✅ FASE 2.4: Tempo médio no funil
  const getAverageTimeInFunnel = () => {
    const closedLeads = leads.filter(l => l.status === 'fechado');
    if (closedLeads.length === 0) return 0;

    const totalDays = closedLeads.reduce((sum, lead) => {
      const created = new Date(lead.created_at);
      const updated = new Date(lead.updated_at || lead.created_at);
      const diffMs = updated.getTime() - created.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Math.round(totalDays / closedLeads.length);
  };

  // ✅ FASE 2.4: Distribuição de leads por corretor
  const getLeadDistribution = () => {
    if (profiles.length === 0) return [];

    return profiles
      .map(profile => {
        const count = leads.filter(l => l.atribuido_a === profile.id).length;
        const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
        return {
          name: profile.full_name || profile.email,
          count,
          percentage: Math.round(percentage),
        };
      })
      .sort((a, b) => b.count - a.count);
  };

  // ✅ FASE 2.4: Taxa de resposta por corretor
  const getResponseRates = () => {
    if (profiles.length === 0) return [];

    return profiles
      .map(profile => {
        const corretorLeads = leads.filter(l => l.atribuido_a === profile.id);
        const responded = corretorLeads.filter(l => l.status !== 'novo').length;
        const rate =
          corretorLeads.length > 0
            ? (responded / corretorLeads.length) * 100
            : 0;

        return {
          name: profile.full_name || profile.email,
          rate: Math.round(rate),
          total: corretorLeads.length,
        };
      })
      .sort((a, b) => b.rate - a.rate);
  };

  // ✅ FASE 2.4: Leads em risco
  const getLeadsAtRisk = () => {
    const now = new Date();
    const threshold = 72 * 60 * 60 * 1000; // 72 horas

    return leads.filter(lead => {
      const updated = new Date(lead.updated_at || lead.created_at);
      const diff = now.getTime() - updated.getTime();
      return (
        diff >= threshold &&
        !['fechado', 'perdido'].includes(lead.status.toLowerCase())
      );
    }).length;
  };

  // ✅ FASE 3.2: Comparativo mês atual vs anterior
  const getMonthComparison = () => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );

    const thisMonth = leads.filter(
      l => new Date(l.created_at) >= thisMonthStart
    ).length;
    const lastMonth = leads.filter(l => {
      const created = new Date(l.created_at);
      return created >= lastMonthStart && created <= lastMonthEnd;
    }).length;

    const diff = thisMonth - lastMonth;
    const percentageChange =
      lastMonth > 0 ? ((diff / lastMonth) * 100).toFixed(1) : '0';

    return {
      thisMonth,
      lastMonth,
      diff,
      percentageChange: parseFloat(percentageChange),
      isPositive: diff > 0,
      isNeutral: diff === 0,
    };
  };

  const avgTime = getAverageTimeInFunnel();
  const distribution = getLeadDistribution();
  const responseRates = getResponseRates();
  const leadsAtRisk = getLeadsAtRisk();
  const comparison = getMonthComparison();

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6'>
      {/* ⏱️ Tempo Médio de Conversão */}
      <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-blue-900 dark:text-blue-100 text-sm'>
            <Clock className='h-4 w-4' />
            Tempo Médio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center'>
            <p className='text-4xl font-bold text-blue-700 dark:text-blue-300'>
              {avgTime}
            </p>
            <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
              dias para fechar
            </p>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
              {avgTime <= 30 ? '✅ Dentro da meta' : '⚠️ Acima da meta (30d)'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 👥 Distribuição de Leads */}
      <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-purple-900 dark:text-purple-100 text-sm'>
            <Users className='h-4 w-4' />
            Distribuição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {distribution.slice(0, 3).map((item, index) => (
              <div key={index}>
                <div className='flex justify-between text-xs mb-1'>
                  <span className='truncate text-gray-700 dark:text-gray-300'>
                    {item.name}
                  </span>
                  <span className='font-bold text-purple-700 dark:text-purple-300'>
                    {item.percentage}%
                  </span>
                </div>
                <Progress value={item.percentage} className='h-1.5' />
              </div>
            ))}
            {distribution.length === 0 && (
              <p className='text-xs text-center text-gray-500'>Sem dados</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 💬 Taxa de Resposta */}
      <Card className='bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200/50 dark:border-emerald-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-emerald-900 dark:text-emerald-100 text-sm'>
            <MessageSquare className='h-4 w-4' />
            Taxa de Resposta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {responseRates.slice(0, 3).map((item, index) => (
              <div key={index} className='flex justify-between items-center'>
                <span className='text-xs truncate text-gray-700 dark:text-gray-300'>
                  {item.name}
                </span>
                <div className='flex items-center gap-1'>
                  <Badge
                    variant={
                      item.rate >= 80
                        ? 'default'
                        : item.rate >= 60
                          ? 'secondary'
                          : 'destructive'
                    }
                    className='text-xs'
                  >
                    {item.rate}%
                  </Badge>
                  <span className='text-xs text-gray-500'>({item.total})</span>
                </div>
              </div>
            ))}
            {responseRates.length === 0 && (
              <p className='text-xs text-center text-gray-500'>Sem dados</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ⚠️ Leads em Risco + Comparativo Mensal */}
      <Card className='bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200/50 dark:border-amber-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-amber-900 dark:text-amber-100 text-sm'>
            <AlertCircle className='h-4 w-4' />
            Status & Comparativo
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Leads em Risco */}
          <div className='text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg'>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              Leads em Risco
            </p>
            <p className='text-3xl font-bold text-amber-700 dark:text-amber-300'>
              {leadsAtRisk}
            </p>
            <p className='text-xs text-amber-600 dark:text-amber-400 mt-1'>
              sem ação há &gt;72h
            </p>
          </div>

          {/* ✅ FASE 3.2: Comparativo Mensal */}
          <div className='p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border-t border-amber-200 dark:border-amber-800'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Este Mês
                </p>
                <p className='text-lg font-bold text-gray-900 dark:text-white'>
                  {comparison.thisMonth}
                </p>
              </div>
              <div className='flex items-center gap-1'>
                {comparison.isPositive ? (
                  <TrendingUp className='h-4 w-4 text-green-600' />
                ) : comparison.isNeutral ? (
                  <Minus className='h-4 w-4 text-gray-600' />
                ) : (
                  <TrendingDown className='h-4 w-4 text-red-600' />
                )}
                <span
                  className={`text-sm font-bold ${
                    comparison.isPositive
                      ? 'text-green-600'
                      : comparison.isNeutral
                        ? 'text-gray-600'
                        : 'text-red-600'
                  }`}
                >
                  {comparison.isPositive && '+'}
                  {comparison.percentageChange}%
                </span>
              </div>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              vs {comparison.lastMonth} no mês passado
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});



