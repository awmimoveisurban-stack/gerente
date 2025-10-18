import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Clock,
  Star,
  Zap,
  Shield,
  MessageSquare,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 🎯 INTERFACE PARA TOOLTIP DE ANÁLISE IA
interface AITooltipProps {
  children: React.ReactNode;
  lead: {
    id: string;
    nome: string;
    score_ia?: number;
    prioridade?: string;
    origem?: string;
    interesse?: string;
    cidade?: string;
    orcamento?: number;
    observacoes?: string;
    mensagem_inicial?: string;
    created_at: string;
    last_interaction_at?: string;
  };
  className?: string;
}

export const AITooltip: React.FC<AITooltipProps> = ({
  children,
  lead,
  className = ''
}) => {
  const getScoreAnalysis = (score: number) => {
    if (score >= 90) return {
      level: 'Excelente',
      description: 'Lead altamente qualificado com grande potencial de conversão',
      recommendation: 'Priorizar contato imediato e agendar visita'
    };
    if (score >= 80) return {
      level: 'Muito Bom',
      description: 'Lead bem qualificado com boa chance de conversão',
      recommendation: 'Contatar em até 2 horas e enviar propostas'
    };
    if (score >= 60) return {
      level: 'Bom',
      description: 'Lead com potencial moderado de conversão',
      recommendation: 'Contatar em até 24 horas e qualificar melhor'
    };
    if (score >= 40) return {
      level: 'Regular',
      description: 'Lead com potencial baixo, precisa de mais qualificação',
      recommendation: 'Contatar em até 48 horas e focar em educação'
    };
    return {
      level: 'Baixo',
      description: 'Lead com baixo potencial, pode ser lead frio',
      recommendation: 'Contatar quando houver tempo disponível'
    };
  };

  const getPriorityAnalysis = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
        return {
          description: 'Lead com urgência alta, pode estar perdendo interesse',
          action: 'Contatar imediatamente para evitar perda'
        };
      case 'alta':
        return {
          description: 'Lead com interesse alto e potencial de fechamento rápido',
          action: 'Priorizar contato e envio de propostas'
        };
      case 'media':
        return {
          description: 'Lead com interesse moderado, precisa de acompanhamento',
          action: 'Manter contato regular e qualificar melhor'
        };
      case 'baixa':
        return {
          description: 'Lead com interesse baixo, pode ser lead de longo prazo',
          action: 'Manter no pipeline para contato futuro'
        };
      default:
        return {
          description: 'Prioridade não definida pela IA',
          action: 'Avaliar manualmente a urgência'
        };
    }
  };

  const getOriginAnalysis = (origin: string) => {
    switch (origin?.toLowerCase()) {
      case 'whatsapp':
        return {
          description: 'Lead capturado via WhatsApp, indica interesse ativo',
          advantage: 'Comunicação direta e rápida disponível'
        };
      case 'site':
        return {
          description: 'Lead capturado via site, demonstra interesse inicial',
          advantage: 'Já conhece a empresa e produtos'
        };
      case 'indicacao':
        return {
          description: 'Lead indicado por cliente, alta chance de conversão',
          advantage: 'Confiança prévia através da indicação'
        };
      case 'manual':
        return {
          description: 'Lead inserido manualmente no sistema',
          advantage: 'Pode ter informações adicionais conhecidas'
        };
      default:
        return {
          description: 'Origem não especificada',
          advantage: 'Necessário qualificar melhor a origem'
        };
    }
  };

  const scoreAnalysis = lead.score_ia ? getScoreAnalysis(lead.score_ia) : null;
  const priorityAnalysis = lead.prioridade ? getPriorityAnalysis(lead.prioridade) : null;
  const originAnalysis = lead.origem ? getOriginAnalysis(lead.origem) : null;

  const timeSinceCreation = new Date().getTime() - new Date(lead.created_at).getTime();
  const hoursSinceCreation = Math.floor(timeSinceCreation / (1000 * 60 * 60));
  const daysSinceCreation = Math.floor(hoursSinceCreation / 24);

  const getTimeAnalysis = () => {
    if (hoursSinceCreation < 1) return 'Lead muito recente - contato imediato recomendado';
    if (hoursSinceCreation < 24) return 'Lead recente - contato em até 2 horas';
    if (daysSinceCreation < 3) return 'Lead de alguns dias - contato urgente';
    if (daysSinceCreation < 7) return 'Lead de uma semana - risco de esfriamento';
    return 'Lead antigo - pode ter perdido interesse';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('cursor-help', className)}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl"
        >
          <div className="space-y-3">
            {/* HEADER */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Análise IA - {lead.nome}
              </span>
            </div>

            {/* SCORE ANALYSIS */}
            {scoreAnalysis && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Score: {lead.score_ia} ({scoreAnalysis.level})
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {scoreAnalysis.description}
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs">
                  <strong>Recomendação:</strong> {scoreAnalysis.recommendation}
                </div>
              </div>
            )}

            {/* PRIORITY ANALYSIS */}
            {priorityAnalysis && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-orange-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Prioridade: {lead.prioridade?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {priorityAnalysis.description}
                </p>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-xs">
                  <strong>Ação:</strong> {priorityAnalysis.action}
                </div>
              </div>
            )}

            {/* ORIGIN ANALYSIS */}
            {originAnalysis && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Origem: {lead.origem?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {originAnalysis.description}
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs">
                  <strong>Vantagem:</strong> {originAnalysis.advantage}
                </div>
              </div>
            )}

            {/* TIME ANALYSIS */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-purple-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Tempo no Sistema
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {daysSinceCreation > 0 
                  ? `Criado há ${daysSinceCreation} dia${daysSinceCreation > 1 ? 's' : ''}`
                  : `Criado há ${hoursSinceCreation} hora${hoursSinceCreation > 1 ? 's' : ''}`
                }
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-xs">
                <strong>Análise Temporal:</strong> {getTimeAnalysis()}
              </div>
            </div>

            {/* ADDITIONAL INFO */}
            {(lead.interesse || lead.cidade || lead.orcamento) && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Info className="h-3 w-3 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Informações Adicionais
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  {lead.interesse && (
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>Interesse: {lead.interesse}</span>
                    </div>
                  )}
                  {lead.cidade && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Cidade: {lead.cidade}</span>
                    </div>
                  )}
                  {(lead.orcamento || lead.valor_interesse) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>Valor: R$ {(lead.orcamento || lead.valor_interesse || 0).toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
