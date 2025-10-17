import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadCard } from './lead-card';
import { LeadCardCompact } from './lead-card-compact';
import { LeadCardMini } from './lead-card-mini';
import { Lead } from '@/hooks/use-leads';
import { LucideIcon } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  leads: Lead[];
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onViewDetails: (lead: Lead) => void;
  onCall: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
  onScheduleVisit: (lead: Lead) => void;
  cardSize?: 'default' | 'compact' | 'mini';
  renderCard?: (lead: Lead) => React.ReactNode; // ✅ Render customizado
}

export function KanbanColumn({
  id,
  title,
  leads,
  icon: Icon,
  color,
  bgColor,
  onViewDetails,
  onCall,
  onEmail,
  onScheduleVisit,
  cardSize = 'compact',
  renderCard, // ✅ Render customizado
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card
      className={`flex flex-col h-full transition-all duration-200 ${bgColor} ${isOver ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}
    >
      <CardHeader className='pb-4 border-b border-white/20 dark:border-gray-700/20'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className={`p-2.5 rounded-xl ${color} shadow-sm`}>
              <Icon className='h-4 w-4 text-white' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900 dark:text-white'>
                {title}
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {leads.length === 0
                  ? 'Vazio'
                  : `${leads.length} lead${leads.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <Badge
            variant='secondary'
            className='bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 font-medium'
          >
            {leads.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='flex-1 overflow-hidden p-4'>
        <div
          ref={setNodeRef}
          className='h-full overflow-y-auto space-y-4 pr-2 -mr-2'
        >
          <SortableContext
            items={leads.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {leads.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
                  <Icon className='h-6 w-6 text-gray-400' />
                </div>
                <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>
                  Nenhum lead nesta etapa
                </p>
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                  Arraste leads aqui ou adicione novos
                </p>
              </div>
            ) : (
              leads.map(lead => {
                // ✅ Se tem renderCard customizado, usar ele
                if (renderCard) {
                  return renderCard(lead);
                }

                // Caso contrário, usar os cards padrão
                const cardProps = {
                  lead,
                  onViewDetails,
                  onCall,
                  onEmail,
                  onScheduleVisit,
                };

                switch (cardSize) {
                  case 'mini':
                    return <LeadCardMini key={lead.id} {...cardProps} />;
                  case 'compact':
                    return <LeadCardCompact key={lead.id} {...cardProps} />;
                  default:
                    return <LeadCard key={lead.id} {...cardProps} />;
                }
              })
            )}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}
