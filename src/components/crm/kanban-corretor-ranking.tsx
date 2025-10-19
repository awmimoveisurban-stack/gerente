import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { Lead } from '@/hooks/use-leads';

interface KanbanCorretorRankingProps {
  leads: Lead[];
  profiles: Array<{ id: string; email: string; full_name: string }>;
}

interface CorretorPerformance {
  id: string;
  name: string;
  email: string;
  totalLeads: number;
  leadsMovidos: number;
  propostas: number;
  fechados: number;
  score: number;
  rank: number;
}

export const KanbanCorretorRanking = memo(function KanbanCorretorRanking({
  leads,
  profiles,
}: KanbanCorretorRankingProps) {
  // ✅ FASE 3.1: Calcular performance de cada corretor
  const calculatePerformance = (): CorretorPerformance[] => {
    // Filtrar apenas últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const performances = profiles.map(profile => {
      const corretorLeads = leads.filter(l => l.atribuido_a === profile.id);
      const recentLeads = corretorLeads.filter(
        l => new Date(l.updated_at || l.created_at) >= sevenDaysAgo
      );

      // Calcular leads movidos (mudaram de status recentemente)
      const leadsMovidos = recentLeads.filter(l => {
        const updated = new Date(l.updated_at || l.created_at);
        return updated >= sevenDaysAgo && l.status !== 'novo';
      }).length;

      const propostas = corretorLeads.filter(
        l => l.status === 'proposta'
      ).length;
      const fechados = corretorLeads.filter(l => l.status === 'fechado').length;

      // Score: (movidos * 2) + (propostas * 5) + (fechados * 10)
      const score = leadsMovidos * 2 + propostas * 5 + fechados * 10;

      return {
        id: profile.id,
        name: profile.full_name || profile.email.split('@')[0],
        email: profile.email,
        totalLeads: corretorLeads.length,
        leadsMovidos,
        propostas,
        fechados,
        score,
        rank: 0, // Será calculado depois
      };
    });

    // Ordenar por score e atribuir rank
    const sorted = performances.sort((a, b) => b.score - a.score);
    sorted.forEach((p, index) => {
      p.rank = index + 1;
    });

    return sorted.filter(p => p.totalLeads > 0); // Apenas corretores com leads
  };

  const performance = calculatePerformance();

  if (performance.length === 0) {
    return null;
  }

  const maxScore = Math.max(...performance.map(p => p.score));

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}º`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 to-amber-600';
    if (rank === 2) return 'from-gray-400 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-700';
    return 'from-blue-500 to-indigo-600';
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Card className='bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200/50 dark:border-purple-800/50'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-purple-900 dark:text-purple-100'>
          <Trophy className='h-5 w-5 text-purple-600' />
          🏆 Ranking da Equipe (Últimos 7 Dias)
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {performance.map(corretor => (
          <div
            key={corretor.id}
            className='p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all'
          >
            {/* Header */}
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-3'>
                <div
                  className={`text-2xl font-bold bg-gradient-to-br ${getRankColor(corretor.rank)} text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg`}
                >
                  {getRankEmoji(corretor.rank)}
                </div>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='bg-purple-600 text-white text-xs'>
                      {getInitials(corretor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-semibold text-gray-900 dark:text-white text-sm'>
                      {corretor.name}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {corretor.email}
                    </p>
                  </div>
                </div>
              </div>
              <Badge
                variant='outline'
                className='bg-purple-100 text-purple-800 border-purple-300 font-bold'
              >
                {corretor.score} pts
              </Badge>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-4 gap-2 mb-3'>
              <div className='text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded'>
                <p className='text-lg font-bold text-blue-700 dark:text-blue-300'>
                  {corretor.leadsMovidos}
                </p>
                <p className='text-xs text-blue-600 dark:text-blue-400'>
                  Movidos
                </p>
              </div>
              <div className='text-center p-2 bg-amber-50 dark:bg-amber-950/20 rounded'>
                <p className='text-lg font-bold text-amber-700 dark:text-amber-300'>
                  {corretor.propostas}
                </p>
                <p className='text-xs text-amber-600 dark:text-amber-400'>
                  Propostas
                </p>
              </div>
              <div className='text-center p-2 bg-green-50 dark:bg-green-950/20 rounded'>
                <p className='text-lg font-bold text-green-700 dark:text-green-300'>
                  {corretor.fechados}
                </p>
                <p className='text-xs text-green-600 dark:text-green-400'>
                  Fechados
                </p>
              </div>
              <div className='text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded'>
                <p className='text-lg font-bold text-purple-700 dark:text-purple-300'>
                  {corretor.totalLeads}
                </p>
                <p className='text-xs text-purple-600 dark:text-purple-400'>
                  Total
                </p>
              </div>
            </div>

            {/* Performance Bar */}
            <div className='space-y-1'>
              <div className='flex justify-between text-xs'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Performance Relativa
                </span>
                <span className='font-medium text-purple-600 dark:text-purple-400'>
                  {maxScore > 0
                    ? Math.round((corretor.score / maxScore) * 100)
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={maxScore > 0 ? (corretor.score / maxScore) * 100 : 0}
                className='h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-indigo-600'
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});




