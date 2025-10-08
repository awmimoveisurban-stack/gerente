import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Phone, 
  Heart, 
  Calendar, 
  FileText, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Zap
} from "lucide-react";

interface FunnelData {
  stage: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  icon: any;
  conversion: number;
  avgTime: string;
  priority: 'alta' | 'media' | 'baixa';
}

interface FunnelVisualizationProps {
  leads: any[];
}

export function FunnelVisualization({ leads }: FunnelVisualizationProps) {
  // Calcular dados do funil
  const funnelStages = [
    { id: 'novo', label: 'Novos Leads', color: 'bg-blue-500', icon: Users, conversion: 100 },
    { id: 'contatado', label: 'Contatados', color: 'bg-purple-500', icon: Phone, conversion: 75 },
    { id: 'interessado', label: 'Interessados', color: 'bg-indigo-500', icon: Heart, conversion: 45 },
    { id: 'visita_agendada', label: 'Visita Agendada', color: 'bg-orange-500', icon: Calendar, conversion: 25 },
    { id: 'proposta', label: 'Propostas', color: 'bg-amber-500', icon: FileText, conversion: 15 },
    { id: 'fechado', label: 'Fechados', color: 'bg-green-500', icon: CheckCircle, conversion: 8 }
  ];

  const funnelData: FunnelData[] = funnelStages.map(stage => {
    const count = leads.filter(lead => lead.status === stage.id).length;
    const total = leads.length;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return {
      stage: stage.id,
      label: stage.label,
      count,
      percentage,
      color: stage.color,
      icon: stage.icon,
      conversion: stage.conversion,
      avgTime: getAvgTime(stage.id),
      priority: getPriority(stage.id, count, percentage)
    };
  });

  function getAvgTime(stage: string): string {
    const times = {
      'novo': '0-2h',
      'contatado': '1-3 dias',
      'interessado': '3-7 dias',
      'visita_agendada': '1-2 semanas',
      'proposta': '2-4 semanas',
      'fechado': '4-8 semanas'
    };
    return times[stage as keyof typeof times] || 'N/A';
  }

  function getPriority(stage: string, count: number, percentage: number): 'alta' | 'media' | 'baixa' {
    if (stage === 'novo' && count > 10) return 'alta';
    if (stage === 'interessado' && percentage > 20) return 'alta';
    if (stage === 'visita_agendada' && percentage < 5) return 'alta';
    if (percentage > 15) return 'media';
    return 'baixa';
  }

  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? (funnelData[5].count / totalLeads) * 100 : 0;
  const avgConversionRate = 8; // Taxa média do mercado

  return (
    <div className="space-y-6">
      {/* Resumo do Funil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Resumo do Funil de Vendas
          </CardTitle>
          <CardDescription>
            Análise completa do funil de conversão de leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">Total de Leads</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-green-800 dark:text-green-200">Taxa de Conversão</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {conversionRate > avgConversionRate ? '+' : '-'}
                {Math.abs(conversionRate - avgConversionRate).toFixed(1)}%
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-200">vs. Mercado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualização do Funil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Funil de Conversão
          </CardTitle>
          <CardDescription>
            Progressão dos leads através das etapas de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                {/* Linha de conexão */}
                {index > 0 && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-300"></div>
                )}
                
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  {/* Ícone e Label */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-full ${stage.color} text-white`}>
                      <stage.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{stage.label}</div>
                      <div className="text-sm text-muted-foreground">
                        Tempo médio: {stage.avgTime}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contador e Porcentagem */}
                  <div className="text-right min-w-0 flex-1">
                    <div className="text-2xl font-bold">{stage.count}</div>
                    <div className="text-sm text-muted-foreground">
                      {stage.percentage.toFixed(1)}% do total
                    </div>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="min-w-0 flex-1">
                    <Progress value={stage.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {stage.percentage.toFixed(1)}% do funil
                    </div>
                  </div>
                  
                  {/* Taxa de Conversão */}
                  <div className="text-right min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      {stage.conversion >= 20 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : stage.conversion >= 10 ? (
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{stage.conversion}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Conversão esperada
                    </div>
                  </div>
                  
                  {/* Prioridade */}
                  <div className="min-w-0 flex-1">
                    <Badge 
                      className={
                        stage.priority === 'alta' ? 'bg-red-100 text-red-800' :
                        stage.priority === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }
                    >
                      {stage.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Insights e Recomendações
          </CardTitle>
          <CardDescription>
            Análise automática do funil com sugestões de melhoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Insight 1 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-500 rounded-full">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    Gargalo Identificado
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    A etapa "Contatados" tem apenas {funnelData[1].count} leads ({funnelData[1].percentage.toFixed(1)}%). 
                    Considere aumentar o número de contatos iniciais.
                  </p>
                </div>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500 rounded-full">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Ponto Forte
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    A conversão de "Interessados" para "Visita Agendada" está em {funnelData[3].percentage.toFixed(1)}%, 
                    acima da média do mercado (25%).
                  </p>
                </div>
              </div>
            </div>

            {/* Insight 3 */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-yellow-500 rounded-full">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Oportunidade de Melhoria
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    A taxa de conversão final está em {conversionRate.toFixed(1)}%. 
                    Foque em melhorar a qualidade dos leads e o processo de follow-up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





