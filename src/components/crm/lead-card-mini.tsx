import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Calendar, Eye, MoreVertical } from 'lucide-react';
import { Lead } from '@/hooks/use-leads';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LeadCardMiniProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onCall: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
  onScheduleVisit: (lead: Lead) => void;
}

export function LeadCardMini({
  lead,
  onViewDetails,
  onCall,
  onEmail,
  onScheduleVisit,
}: LeadCardMiniProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-sm transition-all duration-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 ${
        isDragging
          ? 'shadow-md ring-2 ring-primary scale-105'
          : 'hover:scale-[1.01]'
      }`}
    >
      <CardContent className='p-2'>
        {/* Header - Nome e Menu em linha */}
        <div className='flex items-center justify-between mb-1'>
          <h3 className='font-semibold text-gray-900 dark:text-white truncate text-sm flex-1'>
            {lead.nome}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant='ghost' size='sm' className='h-4 w-4 p-0'>
                <MoreVertical className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onViewDetails(lead);
                }}
              >
                <Eye className='mr-2 h-4 w-4' />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onCall(lead);
                }}
              >
                <Phone className='mr-2 h-4 w-4' />
                Ligar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onEmail(lead);
                }}
              >
                <Mail className='mr-2 h-4 w-4' />
                Enviar Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onScheduleVisit(lead);
                }}
              >
                <Calendar className='mr-2 h-4 w-4' />
                Agendar Visita
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Info compacta em duas linhas */}
        <div className='space-y-1'>
          {/* Linha 1: Telefone e Valor */}
          <div className='flex items-center justify-between text-xs'>
            {lead.telefone && (
              <div className='flex items-center gap-1 text-gray-600 dark:text-gray-400'>
                <Phone className='h-3 w-3 text-blue-500' />
                <span className='truncate'>{lead.telefone}</span>
              </div>
            )}
            {lead.valor_interesse && (
              <Badge
                variant='outline'
                className='font-mono bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 px-1 py-0.5 text-xs'
              >
                R$ {lead.valor_interesse.toLocaleString('pt-BR')}
              </Badge>
            )}
          </div>

          {/* Linha 2: Interesse e Data */}
          <div className='flex items-center justify-between text-xs'>
            {lead.imovel_interesse && (
              <div className='flex items-center gap-1 text-blue-600 dark:text-blue-400 truncate flex-1'>
                <span>🏠</span>
                <span className='truncate'>{lead.imovel_interesse}</span>
              </div>
            )}
            <span className='text-gray-500 dark:text-gray-400 ml-2'>
              {lead.ultima_interacao
                ? new Date(lead.ultima_interacao).toLocaleDateString('pt-BR')
                : new Date(lead.data_entrada).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
