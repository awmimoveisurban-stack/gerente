import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react';
import { Lead } from '@/hooks/use-leads';

interface KanbanBottlenecksProps {
  leads: Lead[];
}

interface BottleneckData {
  from: string;
  to: string;
  fromTitle: string;
  toTitle: string;
  stuck: number;
  avgDays: number;
  conversionRate: number;
  target: number;
  isCritical: boolean;
}

export const KanbanBottlenecks = memo(function KanbanBottlenecks({
  leads,
}: KanbanBottlenecksProps) {
  // ✅ FASE 2.1: Análise de gargalos do funil
  const analyzeBottlenecks = (): BottleneckData[] => {
    const transitions = [
      {
        from: 'novo',
        to: 'contatado',
        fromTitle: 'Novo',
        toTitle: 'Contatado',
        target: 80,
      },
      {
        from: 'contatado',
        to: 'interessado',
        fromTitle: 'Contatado',
        toTitle: 'Interessado',
        target: 50,
      },
      {
        from: 'interessado',
        to: 'visita_agendada',
        fromTitle: 'Interessado',
        toTitle: 'Visita Agendada',
        target: 60,
      },
      {
        from: 'visita_agendada',
        to: 'proposta',
        fromTitle: 'Visita Agendada',
        toTitle: 'Proposta',
        target: 70,
      },
      {
        from: 'proposta',
        to: 'fechado',
        fromTitle: 'Proposta',
        toTitle: 'Fechado',
        target: 40,
      },
    ];

    return transitions
      .map(t => {
        const fromLeads = leads.filter(l => l.status === t.from);
        const toLeads = leads.filter(l => l.status === t.to);

        // Calcular taxa de conversão (simplificado)
        const totalFrom = fromLeads.length + toLeads.length;
        const conversionRate =
          totalFrom > 0 ? (toLeads.length / totalFrom) * 100 : 0;

        // Leads parados em "from" há mais de 3 dias
        const now = new Date();
        const threshold = 3 * 24 * 60 * 60 * 1000; // 3 dias
        const stuck = fromLeads.filter(lead => {
          const updated = new Date(lead.updated_at || lead.created_at);
          return now.getTime() - updated.getTime() >= threshold;
        }).length;

        // Tempo médio parado
        const totalMs = fromLeads.reduce((sum, lead) => {
          const updated = new Date(lead.updated_at || lead.created_at);
          return sum + (now.getTime() - updated.getTime());
        }, 0);
        const avgDays =
          fromLeads.length > 0
            ? Math.floor(totalMs / fromLeads.length / (1000 * 60 * 60 * 24))
            : 0;

        return {
          ...t,
          stuck,
          avgDays,
          conversionRate: Math.round(conversionRate),
          isCritical: conversionRate < t.target && stuck > 3,
        };
      })
      .filter(b => b.stuck > 0 || b.conversionRate < b.target); // Mostrar apenas gargalos
  };

  const bottlenecks = analyzeBottlenecks();

  if (bottlenecks.length === 0) {
    return (
      <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-green-800 dark:text-green-200'>
            ✅ Funil Saudável
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-green-700 dark:text-green-300'>
            Nenhum gargalo crítico identificado! 🎉 O funil está fluindo bem.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/50'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-amber-900 dark:text-amber-100'>
          <AlertTriangle className='h-5 w-5 text-amber-600' />
          ⚠️ Gargalos Identificados ({bottlenecks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {bottlenecks.map((bottleneck, index) => (
          <div
            key={`${bottleneck.from}-${bottleneck.to}`}
            className={`p-4 rounded-lg border-2 ${
              bottleneck.isCritical
                ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-800'
            }`}
          >
            {/* Header */}
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <TrendingDown
                  className={`h-4 w-4 ${bottleneck.isCritical ? 'text-red-600' : 'text-yellow-600'}`}
                />
                <span className='font-semibold text-gray-900 dark:text-white text-sm'>
                  {bottleneck.fromTitle}
                </span>
                <ArrowRight className='h-3 w-3 text-gray-400' />
                <span className='font-semibold text-gray-900 dark:text-white text-sm'>
                  {bottleneck.toTitle}
                </span>
              </div>
              {bottleneck.isCritical && (
                <Badge variant='destructive' className='text-xs'>
                  🔴 CRÍTICO
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-3 mb-3'>
              <div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Parados
                </p>
                <p className='text-lg font-bold text-gray-900 dark:text-white'>
                  {bottleneck.stuck}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Tempo Médio
                </p>
                <p className='text-lg font-bold text-gray-900 dark:text-white'>
                  {bottleneck.avgDays}d
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Conversão
                </p>
                <p className='text-lg font-bold text-gray-900 dark:text-white'>
                  {bottleneck.conversionRate}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='space-y-1'>
              <div className='flex justify-between text-xs'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Taxa de avanço: {bottleneck.conversionRate}%
                </span>
                <span
                  className={`font-medium ${
                    bottleneck.conversionRate >= bottleneck.target
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Meta: {bottleneck.target}%
                </span>
              </div>
              <Progress
                value={bottleneck.conversionRate}
                className={`h-2 ${
                  bottleneck.conversionRate >= bottleneck.target
                    ? '[&>div]:bg-green-500'
                    : '[&>div]:bg-red-500'
                }`}
              />
            </div>

            {/* Recommendation */}
            <p className='text-xs text-gray-700 dark:text-gray-300 mt-3 bg-white/50 dark:bg-gray-800/50 p-2 rounded'>
              💡 <strong>Sugestão:</strong>{' '}
              {bottleneck.isCritical
                ? 'Revisar IMEDIATAMENTE os leads parados e reatribuir se necessário.'
                : 'Monitorar de perto e tomar ação preventiva.'}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});




