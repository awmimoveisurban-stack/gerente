import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';

interface ContextualInsightsProps {
  leadId: string;
  className?: string;
}

const EVOLUCAO_ICONS = {
  crescendo: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  estavel: { icon: Minus, color: 'text-blue-600', bg: 'bg-blue-50' },
  diminuindo: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
  novo: { icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
};

const ENGAJAMENTO_COLORS = {
  alto: { color: 'text-green-600', bg: 'bg-green-50', badge: 'bg-green-100 text-green-800' },
  medio: { color: 'text-yellow-600', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800' },
  baixo: { color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-800' },
};

export const ContextualInsights: React.FC<ContextualInsightsProps> = ({
  leadId,
  className = ''
}) => {
  // Mock data - em produção, isso viria de uma API ou hook
  const mockInsights = {
    evolucao_interesse: 'crescendo' as const,
    engajamento_temporal: 'alto' as const,
    mudanca_prioridade: true,
    contexto_completo: 'Cliente demonstra interesse crescente em apartamentos na Zona Sul, com orçamento aumentando de R$ 400k para R$ 600k',
    mensagens_analisadas: 7,
    padroes_comportamento: [
      'Interesse consistente em apartamentos',
      'Orçamento aumentou significativamente',
      'Alto engajamento - múltiplas interações diárias'
    ],
    proximos_passos: [
      'Sugerir agendamento de visita',
      'Preparar proposta personalizada',
      'Manter comunicação ativa'
    ],
    alertas_contexto: [
      'Mudança de prioridade detectada - revisar estratégia'
    ],
    score_atual: 85,
    score_anterior: 72,
    tendencia_score: 'crescendo'
  };

  const evolucaoConfig = EVOLUCAO_ICONS[mockInsights.evolucao_interesse];
  const engajamentoConfig = ENGAJAMENTO_COLORS[mockInsights.engajamento_temporal];

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Análise Contextual da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Evolução do Interesse */}
          <div className={`p-4 rounded-lg ${evolucaoConfig.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <evolucaoConfig.icon className={`h-5 w-5 ${evolucaoConfig.color}`} />
              <h4 className="font-semibold">Evolução do Interesse</h4>
              <Badge variant="outline" className={evolucaoConfig.color}>
                {mockInsights.evolucao_interesse.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {mockInsights.contexto_completo}
            </p>
          </div>

          {/* Engajamento Temporal */}
          <div className={`p-4 rounded-lg ${engajamentoConfig.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-5 w-5 ${engajamentoConfig.color}`} />
              <h4 className="font-semibold">Engajamento Temporal</h4>
              <Badge className={engajamentoConfig.badge}>
                {mockInsights.engajamento_temporal.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                <MessageSquare className="h-4 w-4 inline mr-1" />
                {mockInsights.mensagens_analisadas} mensagens analisadas
              </span>
            </div>
          </div>

          {/* Score e Tendência */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Score Atual</h4>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-blue-600">
                  {mockInsights.score_atual}/100
                </div>
                {mockInsights.tendencia_score === 'crescendo' && (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Score Anterior</h4>
              <div className="text-2xl font-bold text-gray-600">
                {mockInsights.score_anterior}/100
              </div>
            </div>
          </div>

          {/* Padrões de Comportamento */}
          {mockInsights.padroes_comportamento.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Padrões Detectados
              </h4>
              <div className="space-y-2">
                {mockInsights.padroes_comportamento.map((padrao, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{padrao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximos Passos */}
          {mockInsights.proximos_passos.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Próximos Passos Sugeridos
              </h4>
              <div className="space-y-2">
                {mockInsights.proximos_passos.map((passo, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>{passo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertas */}
          {mockInsights.alertas_contexto.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">Alertas Importantes:</div>
                <ul className="list-disc list-inside space-y-1">
                  {mockInsights.alertas_contexto.map((alerta, index) => (
                    <li key={index} className="text-sm">{alerta}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Mudança de Prioridade */}
          {mockInsights.mudanca_prioridade && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="font-semibold">Mudança de Prioridade Detectada!</div>
                <div className="text-sm mt-1">
                  O interesse do cliente evoluiu significativamente. Considere revisar a estratégia de abordagem.
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
