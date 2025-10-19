import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Mail,
  Calendar,
  Eye,
  MoreVertical,
  User,
  Clock,
  Flame,
  RefreshCw,
} from 'lucide-react';
import { Lead } from '@/hooks/use-leads';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LeadCardEnhancedProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onCall: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
  onScheduleVisit: (lead: Lead) => void;
  onReassign?: (lead: Lead) => void;
  corretorName?: string;
  cardSize?: 'default' | 'compact' | 'mini';
}

const LeadCardEnhanced = React.memo(function LeadCardEnhanced({
  lead,
  onViewDetails,
  onCall,
  onEmail,
  onScheduleVisit,
  onReassign,
  corretorName,
  cardSize = 'compact',
}: LeadCardEnhancedProps) {
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

  // ✅ FASE 1.2: Calcular tempo no estágio
  const getTimeInStage = () => {
    const now = new Date();
    const updated = new Date(lead.updated_at || lead.created_at);
    const diffMs = now.getTime() - updated.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return {
        text: `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`,
        isStale: diffDays >= 3, // Alerta se >= 3 dias
        isCritical: diffDays >= 7, // Crítico se >= 7 dias
      };
    } else if (diffHours > 0) {
      return {
        text: `${diffHours}h`,
        isStale: false,
        isCritical: false,
      };
    } else {
      return {
        text: 'Agora',
        isStale: false,
        isCritical: false,
      };
    }
  };

  // ✅ MEMOIZAÇÃO: Calcular valores apenas quando necessário
  const timeInStage = useMemo(() => getTimeInStage(), [lead.status, lead.updated_at]);
  
  const aiScore = useMemo(() => {
    if (!lead.observacoes) return null;
    const scoreMatch = lead.observacoes.match(/Score:\s*(\d+)\/100/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : null;
  }, [lead.observacoes]);

  // ✅ MEMOIZAÇÃO: Handlers para evitar re-renderizações
  const handleViewDetails = useCallback(() => {
    onViewDetails(lead);
  }, [onViewDetails, lead]);

  const handleCall = useCallback(() => {
    onCall(lead);
  }, [onCall, lead]);

  const handleEmail = useCallback(() => {
    onEmail(lead);
  }, [onEmail, lead]);

  const handleScheduleVisit = useCallback(() => {
    onScheduleVisit(lead);
  }, [onScheduleVisit, lead]);

  const handleReassign = useCallback(() => {
    onReassign?.(lead);
  }, [onReassign, lead]);

  // ✅ Score visual color
  const getScoreColor = (score: number) => {
    if (score >= 80)
      return 'text-green-600 bg-green-50 dark:bg-green-950/20 border-green-500';
    if (score >= 60)
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500';
    return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-500';
  };

  // ✅ Get initials
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // ✅ Origem badge
  const getOrigemBadge = () => {
    if (!lead.origem) return null;

    const origemMap: Record<
      string,
      { label: string; icon: string; color: string }
    > = {
      whatsapp: {
        label: 'WhatsApp',
        icon: '💬',
        color: 'bg-green-50 text-green-700 border-green-200',
      },
      whatsapp_green_api: {
        label: 'WhatsApp',
        icon: '💬',
        color: 'bg-green-50 text-green-700 border-green-200',
      }, // Legacy
      formulario: {
        label: 'Formulário',
        icon: '📝',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      telefone: {
        label: 'Telefone',
        icon: '📞',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      indicacao: {
        label: 'Indicação',
        icon: '👥',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
      },
    };

    const origem = origemMap[lead.origem] || {
      label: lead.origem,
      icon: '📌',
      color: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
      <Badge
        variant='outline'
        className={`text-xs px-1.5 py-0 ${origem.color}`}
      >
        {origem.icon} {origem.label}
      </Badge>
    );
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border ${
        timeInStage.isCritical
          ? 'border-red-400 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-900/50'
          : timeInStage.isStale
            ? 'border-yellow-400 dark:border-yellow-600'
            : 'border-gray-200/50 dark:border-gray-700/50'
      } ${isDragging ? 'shadow-xl ring-2 ring-primary scale-105 rotate-1' : 'hover:scale-[1.02]'}`}
    >
      <CardContent className='p-3 space-y-2'>
        {/* ✅ FASE 2.2: Score IA + Nome */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              {aiScore && (
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${getScoreColor(aiScore)}`}
                >
                  {aiScore}
                </div>
              )}
              <h3 className='font-semibold text-gray-900 dark:text-white truncate text-sm flex-1'>
                {lead.nome}
              </h3>
            </div>
            {lead.email && (
              <p className='text-xs text-gray-500 dark:text-gray-400 truncate mt-1'>
                {lead.email}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                <MoreVertical className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
              >
                <Eye className='mr-2 h-4 w-4' />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  handleCall();
                }}
              >
                <Phone className='mr-2 h-4 w-4' />
                Ligar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  handleEmail();
                }}
              >
                <Mail className='mr-2 h-4 w-4' />
                Enviar Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  handleScheduleVisit();
                }}
              >
                <Calendar className='mr-2 h-4 w-4' />
                Agendar Visita
              </DropdownMenuItem>
              {onReassign && (
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    handleReassign();
                  }}
                >
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Reatribuir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ✅ FASE 1.1: Corretor Responsável */}
        {corretorName && (
          <div className='flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 rounded-md p-1.5 border border-blue-200/50 dark:border-blue-800/50'>
            <Avatar className='h-5 w-5'>
              <AvatarFallback className='bg-blue-600 text-white text-xs'>
                {getInitials(corretorName)}
              </AvatarFallback>
            </Avatar>
            <span className='text-xs font-medium text-blue-700 dark:text-blue-300 truncate'>
              {corretorName}
            </span>
          </div>
        )}

        {/* ✅ FASE 1.2: Tempo no Estágio */}
        <div
          className={`flex items-center gap-1.5 text-xs rounded-md p-1.5 border ${
            timeInStage.isCritical
              ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
              : timeInStage.isStale
                ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800'
                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
          }`}
        >
          <Clock className='h-3 w-3 flex-shrink-0' />
          <span className='font-medium truncate'>
            {timeInStage.text}{' '}
            {timeInStage.isCritical ? '🔴' : timeInStage.isStale ? '🟡' : ''}
          </span>
        </div>

        {/* Contact Info */}
        {lead.telefone && (
          <div className='flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-md p-1.5'>
            <Phone className='h-3 w-3 text-blue-500 flex-shrink-0' />
            <span className='truncate font-medium'>{lead.telefone}</span>
          </div>
        )}

        {/* Property Interest */}
        {lead.imovel_interesse && (
          <div className='text-xs bg-purple-50 dark:bg-purple-950/20 rounded-md p-2 border border-purple-200/50 dark:border-purple-800/50'>
            <span className='font-medium text-purple-700 dark:text-purple-300'>
              🏠{' '}
            </span>
            <span className='text-purple-600 dark:text-purple-400 truncate'>
              {lead.imovel_interesse}
            </span>
          </div>
        )}

        {/* Value */}
        {lead.valor_interesse && (
          <div className='flex justify-center'>
            <Badge
              variant='outline'
              className='font-mono bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 px-2 py-0.5 text-xs'
            >
              💰 R$ {lead.valor_interesse.toLocaleString('pt-BR')}
            </Badge>
          </div>
        )}

        {/* ✅ Origem Badge */}
        <div className='flex justify-between items-center pt-1.5 border-t border-gray-200/50 dark:border-gray-700/50'>
          {getOrigemBadge()}
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            {lead.ultima_interacao
              ? new Date(lead.ultima_interacao).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })
              : new Date(lead.data_entrada).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // ✅ COMPARAÇÃO CUSTOMIZADA PARA OTIMIZAÇÃO
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.status === nextProps.lead.status &&
    prevProps.lead.updated_at === nextProps.lead.updated_at &&
    prevProps.cardSize === nextProps.cardSize &&
    prevProps.corretorName === nextProps.corretorName
  );
});

export { LeadCardEnhanced };
