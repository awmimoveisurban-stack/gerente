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
  Avatar,
} from 'lucide-react';
import { type Lead } from '@/hooks/use-leads';
import { AILeadIndicators } from '@/components/ui/ai-indicators';
import { AITooltip } from '@/components/ui/ai-tooltip';
import {
  ProbabilityIndicator,
  UrgencyIndicator,
  NextActionIndicator,
  TimeInPipelineIndicator,
  PreferredChannelIndicator,
  SentimentIndicator,
  BudgetRangeIndicator,
} from '@/components/ui/advanced-ai-indicators';
import {
  calcularProbabilidadeFechamento,
  calcularUrgencia,
  sugerirProximaAcao,
  calcularTempoNoPipeline,
  determinarCanalPreferido,
  analisarSentimento,
  determinarFaixaPreco,
  formatarDataRelativa,
  type LeadCompleto,
} from '@/utils/lead-intelligence';

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

  // ✅ CONVERTER LEAD PARA LeadCompleto
  const leadCompleto: LeadCompleto = {
    id: lead.id,
    nome: lead.nome,
    corretor: lead.corretor || 'Não atribuído',
    status: lead.status,
    valor: lead.valor_interesse || lead.orcamento || null,
    created_at: lead.data_entrada,
    score: lead.score_ia || lead.score || null,
    origem: lead.origem || null,
    observacoes: lead.observacoes || null,
    mensagem_inicial: lead.mensagem_inicial || null,
    prioridade: lead.prioridade || null,
    cidade: lead.cidade || null,
    interesse: lead.imovel_interesse || lead.interesse || null,
    last_interaction_at: lead.ultima_interacao || null,
    telefone: lead.telefone || null,
    email: lead.email || null,
    orcamento: lead.orcamento || null,
    valor_interesse: lead.valor_interesse || null,
  };

  // ✅ CALCULAR MÉTRICAS INTELIGENTES
  const probabilidade = calcularProbabilidadeFechamento(leadCompleto);
  const urgencia = calcularUrgencia(leadCompleto);
  const proximaAcao = sugerirProximaAcao(leadCompleto);
  const tempoNoPipeline = calcularTempoNoPipeline(leadCompleto.created_at);
  const canalPreferido = determinarCanalPreferido(leadCompleto);
  const sentimento = analisarSentimento(leadCompleto);
  const faixaPreco = determinarFaixaPreco(leadCompleto);

  return (
    <TableRow className='border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors'>
      <TableCell colSpan={6} className='p-4'>
        {/* 🎯 LINHA 1: IDENTIFICAÇÃO + QUALIFICAÇÃO + URGÊNCIA */}
        <div className='flex items-center justify-between mb-3'>
          {/* Identificação */}
          <div className='flex items-center gap-3'>
            <Avatar className='w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-bold'>
              {lead.nome.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <h4 className='font-semibold text-gray-900 dark:text-white text-base'>
                {lead.nome}
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {lead.origem || 'Origem não informada'}
              </p>
            </div>
          </div>
          
          {/* Qualificação IA */}
          <div className='flex items-center gap-2'>
            <ProbabilityIndicator 
              probability={probabilidade} 
              size="sm" 
              showLabel={true}
            />
            <UrgencyIndicator 
              urgency={urgencia} 
              size="sm" 
              showLabel={true}
            />
          </div>
        </div>

        {/* 🎯 LINHA 2: STATUS + HISTÓRICO + AÇÃO */}
        <div className='flex items-center justify-between mb-3'>
          {/* Status e Histórico */}
          <div className='flex items-center gap-4'>
            <StatusBadge status={getStatusBadgeStatus(lead.status)} />
            <div className='flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400'>
              <Clock className='h-3 w-3' />
              <span>Última: {formatarDataRelativa(leadCompleto.last_interaction_at)}</span>
            </div>
          </div>
          
          {/* Ação e Tempo */}
          <div className='flex items-center gap-2'>
            <NextActionIndicator 
              action={proximaAcao} 
              size="sm" 
              showLabel={true}
            />
            <TimeInPipelineIndicator 
              days={tempoNoPipeline} 
              size="sm" 
              showLabel={true}
            />
          </div>
        </div>

        {/* 🎯 LINHA 3: FINANCEIRO + COMUNICAÇÃO + SENTIMENTO */}
        <div className='flex items-center justify-between'>
          {/* Financeiro */}
          <div className='flex items-center gap-4'>
            <div className='text-sm font-semibold text-gray-900 dark:text-white'>
              {leadCompleto.valor && leadCompleto.valor > 0
                ? `R$ ${leadCompleto.valor.toLocaleString('pt-BR')}`
                : 'Valor não informado'}
            </div>
            <BudgetRangeIndicator 
              range={faixaPreco} 
              size="sm" 
              showLabel={true}
            />
          </div>
          
          {/* Comunicação e Sentimento */}
          <div className='flex items-center gap-4'>
            <PreferredChannelIndicator 
              channel={canalPreferido} 
              size="sm" 
              showLabel={true}
            />
            <SentimentIndicator 
              sentiment={sentimento} 
              size="sm" 
              showLabel={true}
            />
          </div>
        </div>

        {/* 🎯 AÇÕES RÁPIDAS */}
        <div className='flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800'>
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
              Leads Recentes com IA Avançada ({leads.length})
            </CardTitle>
            <CardDescription className='text-blue-600 dark:text-blue-400 mt-1'>
              🎯 Layout inteligente com probabilidade, urgência, próxima ação e análise contextual completa
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
                  🎯 Leads com IA Avançada
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
