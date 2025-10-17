import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Flame, Eye, Phone, ArrowRight, Clock } from 'lucide-react';
import type { Lead } from '@/hooks/use-leads';

interface HotLeadsAlertProps {
  hotLeads: Lead[];
  onViewLead: (lead: Lead) => void;
  onViewAll: () => void;
}

// Função auxiliar para extrair score
function extractAIScore(observacoes?: string | null): number | null {
  if (!observacoes) return null;
  const scoreMatch = observacoes.match(/Score:\s*(\d+)\/100/);
  return scoreMatch ? parseInt(scoreMatch[1]) : null;
}

export function HotLeadsAlert({
  hotLeads,
  onViewLead,
  onViewAll,
}: HotLeadsAlertProps) {
  // Filtrar apenas leads quentes não atendidos (status novo ou interessado)
  const unattendedHotLeads = hotLeads.filter(lead =>
    ['novo', 'interessado'].includes(lead.status.toLowerCase())
  );

  if (unattendedHotLeads.length === 0) {
    return null; // Não mostrar se não há leads quentes não atendidos
  }

  // Ordenar por score (maior primeiro)
  const sortedLeads = [...unattendedHotLeads]
    .sort((a, b) => {
      const scoreA = extractAIScore(a.observacoes) || 0;
      const scoreB = extractAIScore(b.observacoes) || 0;
      return scoreB - scoreA;
    })
    .slice(0, 3); // Top 3

  return (
    <Card className='bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-800'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg font-bold text-red-900 dark:text-red-100 flex items-center gap-2'>
              <div className='p-1.5 bg-red-500 rounded-lg animate-pulse'>
                <Flame className='h-4 w-4 text-white' />
              </div>
              🔥 Leads Quentes Aguardando
            </CardTitle>
            <CardDescription className='text-red-700 dark:text-red-300 mt-1'>
              {unattendedHotLeads.length} lead
              {unattendedHotLeads.length > 1 ? 's' : ''} com alta prioridade
            </CardDescription>
          </div>
          <Badge
            variant='destructive'
            className='bg-red-600 text-white text-lg px-3 py-1 animate-bounce'
          >
            {unattendedHotLeads.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {sortedLeads.map(lead => {
          const score = extractAIScore(lead.observacoes) || 0;
          const timeAgo = Math.floor(
            (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60)
          ); // minutos

          return (
            <div
              key={lead.id}
              className='flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 hover:shadow-md transition-all group'
            >
              {/* Avatar */}
              <Avatar className='h-10 w-10 border-2 border-red-300'>
                <AvatarFallback className='bg-gradient-to-br from-red-400 to-red-600 text-white font-bold'>
                  {lead.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <h4 className='font-semibold text-gray-900 dark:text-white truncate text-sm'>
                    {lead.nome}
                  </h4>
                  <Badge
                    variant='outline'
                    className='bg-red-100 text-red-700 border-red-300 font-bold text-xs'
                  >
                    {score}
                  </Badge>
                </div>
                <div className='flex items-center gap-3 mt-1'>
                  <p className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                    {lead.imovel_interesse || 'Interesse não especificado'}
                  </p>
                  <div className='flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
                    <Clock className='h-3 w-3' />
                    <span>
                      {timeAgo < 60
                        ? `${timeAgo}min atrás`
                        : timeAgo < 1440
                          ? `${Math.floor(timeAgo / 60)}h atrás`
                          : `${Math.floor(timeAgo / 1440)}d atrás`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className='flex items-center gap-1'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => onViewLead(lead)}
                  className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <Eye className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-700'
                >
                  <Phone className='h-4 w-4' />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Botão Ver Todos */}
        {unattendedHotLeads.length > 3 && (
          <Button
            variant='outline'
            onClick={onViewAll}
            className='w-full mt-2 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-700 dark:text-red-300'
          >
            Ver todos os {unattendedHotLeads.length} leads quentes
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}



