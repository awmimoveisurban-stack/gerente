import { memo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge, type LeadStatus } from '@/components/crm/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Phone,
  Mail,
  Calendar,
  Edit,
  MoreHorizontal,
  Users,
  MessageSquare,
  ArrowRight,
  Star,
  Zap,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Brain,
  Target,
} from 'lucide-react';
import { type Lead } from '@/hooks/use-leads';
import { AILeadIndicators } from '@/components/ui/ai-indicators';
import { AITooltip } from '@/components/ui/ai-tooltip';

interface RecentLeadsTableProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onCallLead: (lead: Lead) => void;
  onEmailLead: (lead: Lead) => void;
  onScheduleVisit: (lead: Lead) => void;
}

interface LeadRowProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onCallLead: (lead: Lead) => void;
  onEmailLead: (lead: Lead) => void;
  onScheduleVisit: (lead: Lead) => void;
}

const LeadRow = memo(function LeadRow({
  lead,
  onViewDetails,
  onEditLead,
  onCallLead,
  onEmailLead,
  onScheduleVisit,
}: LeadRowProps) {
  const getStatusBadgeStatus = useCallback((status: string): LeadStatus => {
    switch (status.toLowerCase()) {
      case 'novo':
        return 'Novo';
      case 'contatado':
        return 'Em Atendimento';
      case 'interessado':
        return 'Em Atendimento';
      case 'visita_agendada':
        return 'Visita';
      case 'proposta':
        return 'Proposta';
      case 'fechado':
        return 'Fechado';
      case 'perdido':
        return 'Perdido';
      default:
        return 'Novo';
    }
  }, []);

  // ✅ FUNÇÕES AUXILIARES PARA IA
  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'alta':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'media':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'baixa':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getPriorityIcon = useCallback((priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
        return <AlertTriangle className="h-3 w-3" />;
      case 'alta':
        return <TrendingUp className="h-3 w-3" />;
      case 'media':
        return <Target className="h-3 w-3" />;
      case 'baixa':
        return <Clock className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  }, []);

  const getOriginIcon = useCallback((origin: string) => {
    switch (origin?.toLowerCase()) {
      case 'whatsapp':
        return <MessageSquare className="h-3 w-3 text-green-500" />;
      case 'site':
        return <Users className="h-3 w-3 text-blue-500" />;
      case 'indicacao':
        return <Users className="h-3 w-3 text-purple-500" />;
      case 'manual':
        return <Edit className="h-3 w-3 text-gray-500" />;
      default:
        return <Users className="h-3 w-3 text-gray-500" />;
    }
  }, []);

  const handleViewDetails = useCallback(
    () => onViewDetails(lead),
    [lead, onViewDetails]
  );
  const handleEdit = useCallback(() => onEditLead(lead), [lead, onEditLead]);
  const handleCall = useCallback(() => onCallLead(lead), [lead, onCallLead]);
  const handleEmail = useCallback(() => onEmailLead(lead), [lead, onEmailLead]);
  const handleSchedule = useCallback(
    () => onScheduleVisit(lead),
    [lead, onScheduleVisit]
  );

  return (
    <TableRow className='border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors'>
      <TableCell className='font-medium'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold'>
            {lead.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className='font-semibold text-gray-900 dark:text-white'>
              {lead.nome}
            </div>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              {lead.email || 'Sem email'}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Phone className='h-4 w-4 text-blue-500' />
            <span className='text-gray-700 dark:text-gray-300 text-sm'>
              {lead.telefone || 'Sem telefone'}
            </span>
          </div>
          {lead.email && (
            <div className='flex items-center gap-2'>
              <MessageSquare className='h-3 w-3 text-green-500' />
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                WhatsApp disponível
              </span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className='space-y-2'>
          <div className='max-w-[180px] truncate bg-blue-50 dark:bg-blue-950/20 px-3 py-2 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300'>
            {lead.imovel_interesse || lead.interesse || 'Não especificado'}
          </div>
          {/* ✅ CIDADE DE INTERESSE */}
          {lead.cidade && (
            <div className='flex items-center gap-1'>
              <MapPin className='h-3 w-3 text-gray-500' />
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                {lead.cidade}
              </span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className='space-y-2'>
          <div className='font-semibold text-gray-900 dark:text-white text-sm'>
            {lead.valor_interesse || lead.orcamento
              ? `R$ ${(lead.valor_interesse || lead.orcamento || 0).toLocaleString('pt-BR')}`
              : 'Não informado'}
          </div>
          {/* ✅ INDICADORES IA MELHORADOS COM TOOLTIP */}
          <AITooltip lead={lead}>
            <AILeadIndicators 
              score={lead.score_ia} 
              priority={lead.prioridade} 
              origin={lead.origem}
              size="sm"
            />
          </AITooltip>
        </div>
      </TableCell>
      <TableCell>
        <div className='space-y-2'>
          <StatusBadge status={getStatusBadgeStatus(lead.status)} />
        </div>
      </TableCell>
      <TableCell>
        <div className='space-y-1'>
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            {lead.ultima_interacao
              ? new Date(lead.ultima_interacao).toLocaleDateString('pt-BR')
              : new Date(lead.data_entrada).toLocaleDateString('pt-BR')}
          </div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>
            {lead.ultima_interacao
              ? new Date(lead.ultima_interacao).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Primeiro contato'}
          </div>
        </div>
      </TableCell>
      <TableCell className='text-right'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-blue-50 dark:hover:bg-blue-950/20'
            title='Ver detalhes'
            onClick={handleViewDetails}
            aria-label={`Ver detalhes do lead ${lead.nome}`}
          >
            <Eye className='h-4 w-4 text-blue-500' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-green-50 dark:hover:bg-green-950/20'
            title='Ligar'
            onClick={handleCall}
            aria-label={`Ligar para ${lead.nome}`}
          >
            <Phone className='h-4 w-4 text-green-500' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='hover:bg-gray-100 dark:hover:bg-gray-700'
                aria-label={`Mais opções para ${lead.nome}`}
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm'
            >
              <DropdownMenuItem
                onClick={handleEdit}
                className='hover:bg-blue-50 dark:hover:bg-blue-950/20'
              >
                <Edit className='mr-2 h-4 w-4 text-blue-500' />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleEmail}
                className='hover:bg-green-50 dark:hover:bg-green-950/20'
              >
                <Mail className='mr-2 h-4 w-4 text-green-500' />
                Enviar Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSchedule}
                className='hover:bg-purple-50 dark:hover:bg-purple-950/20'
              >
                <Calendar className='mr-2 h-4 w-4 text-purple-500' />
                Agendar Visita
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
});

export const RecentLeadsTable = memo(function RecentLeadsTable({
  leads,
  onViewDetails,
  onEditLead,
  onCallLead,
  onEmailLead,
  onScheduleVisit,
}: RecentLeadsTableProps) {
  return (
    <Card className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'>
      <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200/50 dark:border-blue-800/50'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2'>
              <div className='p-1.5 bg-blue-500 rounded-lg'>
                <Brain className='h-4 w-4 text-white' />
              </div>
              Leads Recentes com IA ({leads.length})
            </CardTitle>
            <CardDescription className='text-blue-600 dark:text-blue-400 mt-1'>
              🤖 Leads qualificados automaticamente com score, prioridade e análise contextual
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20'
            aria-label='Ver todos os leads'
            title='Ver todos os leads'
          >
            <ArrowRight className='mr-2 h-4 w-4' />
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='border-gray-200 dark:border-gray-700'>
                <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                  👤 Cliente
                </TableHead>
                <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                  📞 Contato & Origem
                </TableHead>
                <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                  🏠 Interesse & Localização
                </TableHead>
                <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                  💰 Valor & Score IA
                </TableHead>
                <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                  📊 Status & Prioridade
                </TableHead>
                <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                  📅 Última Interação
                </TableHead>
                <TableHead className='text-right font-semibold text-gray-700 dark:text-gray-300'>
                  ⚡ Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map(lead => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onViewDetails={onViewDetails}
                  onEditLead={onEditLead}
                  onCallLead={onCallLead}
                  onEmailLead={onEmailLead}
                  onScheduleVisit={onScheduleVisit}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
