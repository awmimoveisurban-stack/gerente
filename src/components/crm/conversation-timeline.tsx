import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeadConversations, LeadConversation } from '@/hooks/use-lead-conversations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Bot,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  Brain,
  Zap,
} from 'lucide-react';

interface ConversationTimelineProps {
  leadId: string;
  className?: string;
}

const CANAL_ICONS = {
  whatsapp: MessageSquare,
  telefone: Phone,
  email: Mail,
  site: Globe,
  sistema: Bot,
  indicacao: User,
};

const TIPO_COLORS = {
  entrada: 'bg-blue-100 text-blue-800 border-blue-200',
  saida: 'bg-green-100 text-green-800 border-green-200',
  sistema: 'bg-purple-100 text-purple-800 border-purple-200',
  atualizacao: 'bg-orange-100 text-orange-800 border-orange-200',
};

const EVOLUCAO_ICONS = {
  crescendo: { icon: TrendingUp, color: 'text-green-600' },
  estavel: { icon: Minus, color: 'text-blue-600' },
  diminuindo: { icon: TrendingDown, color: 'text-red-600' },
  novo: { icon: Activity, color: 'text-purple-600' },
};

const ENGAJAMENTO_COLORS = {
  alto: 'bg-green-100 text-green-800',
  medio: 'bg-yellow-100 text-yellow-800',
  baixo: 'bg-red-100 text-red-800',
};

export const ConversationTimeline: React.FC<ConversationTimelineProps> = ({
  leadId,
  className = ''
}) => {
  const {
    conversations,
    stats,
    loading,
    fetchConversations,
  } = useLeadConversations(leadId);

  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    fetchConversations(leadId);
  }, [leadId, fetchConversations]);

  const getCanalIcon = (canal: string) => {
    const IconComponent = CANAL_ICONS[canal as keyof typeof CANAL_ICONS] || MessageSquare;
    return <IconComponent className="h-4 w-4" />;
  };

  const getTipoColor = (tipo: string) => {
    return TIPO_COLORS[tipo as keyof typeof TIPO_COLORS] || TIPO_COLORS.entrada;
  };

  const formatMessage = (message: string) => {
    if (!message) return 'Sem mensagem';
    
    // Truncar mensagens muito longas
    if (message.length > 200) {
      return message.substring(0, 200) + '...';
    }
    
    return message;
  };

  const getInsightsFromConversations = () => {
    if (!conversations.length) return null;

    const insights = {
      totalMensagens: conversations.length,
      canaisUsados: [...new Set(conversations.map(c => c.canal))],
      tiposUsados: [...new Set(conversations.map(c => c.tipo))],
      tempoTotal: 0,
      frequencia: 0,
      ultimaConversa: conversations[0]?.created_at,
      primeiraConversa: conversations[conversations.length - 1]?.created_at,
    };

    // Calcular tempo total e frequência
    if (conversations.length > 1) {
      const primeira = new Date(insights.primeiraConversa).getTime();
      const ultima = new Date(insights.ultimaConversa).getTime();
      insights.tempoTotal = ultima - primeira;
      insights.frequencia = insights.totalMensagens / Math.max(1, insights.tempoTotal / (24 * 60 * 60 * 1000));
    }

    return insights;
  };

  const insights = getInsightsFromConversations();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Histórico de Conversas
            <Badge variant="secondary">{conversations.length}</Badge>
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
            >
              <Brain className="h-4 w-4 mr-1" />
              Insights
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchConversations(leadId)}
            >
              <Clock className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
          </div>
        </div>

        {showInsights && insights && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Análise do Histórico
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total:</span>
                <div className="font-medium">{insights.totalMensagens} mensagens</div>
              </div>
              <div>
                <span className="text-muted-foreground">Canais:</span>
                <div className="font-medium">{insights.canaisUsados.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Frequência:</span>
                <div className="font-medium">{insights.frequencia.toFixed(1)}/dia</div>
              </div>
              <div>
                <span className="text-muted-foreground">Período:</span>
                <div className="font-medium">
                  {insights.tempoTotal > 0 
                    ? `${Math.round(insights.tempoTotal / (24 * 60 * 60 * 1000))} dias`
                    : 'Mesmo dia'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma conversa registrada ainda</p>
            <p className="text-sm">As conversas aparecerão aqui conforme forem sendo registradas</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4 p-6">
              {conversations.map((conversation, index) => {
                const isExpanded = expandedConversation === conversation.id;
                const IconComponent = CANAL_ICONS[conversation.canal as keyof typeof CANAL_ICONS] || MessageSquare;
                
                return (
                  <div
                    key={conversation.id}
                    className={`relative border rounded-lg p-4 transition-all ${
                      isExpanded ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Timeline connector */}
                    {index < conversations.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-border"></div>
                    )}

                    <div className="flex items-start gap-3">
                      {/* Canal icon */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <IconComponent className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTipoColor(conversation.tipo)}>
                            {conversation.tipo}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {conversation.canal}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>

                        {/* Message preview */}
                        <div className="text-sm">
                          {isExpanded ? (
                            <div className="whitespace-pre-wrap">
                              {conversation.mensagem || 'Sem mensagem'}
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              {formatMessage(conversation.mensagem || 'Sem mensagem')}
                            </div>
                          )}
                        </div>

                        {/* Author */}
                        {conversation.autor_nome && (
                          <div className="text-xs text-muted-foreground mt-1">
                            por {conversation.autor_nome}
                          </div>
                        )}

                        {/* Expand button */}
                        {conversation.mensagem && conversation.mensagem.length > 200 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-6 px-2 text-xs"
                            onClick={() => setExpandedConversation(
                              isExpanded ? null : conversation.id
                            )}
                          >
                            {isExpanded ? (
                              <>
                                <ArrowUp className="h-3 w-3 mr-1" />
                                Menos
                              </>
                            ) : (
                              <>
                                <ArrowDown className="h-3 w-3 mr-1" />
                                Mais
                              </>
                            )}
                          </Button>
                        )}

                        {/* Metadata insights */}
                        {conversation.metadata && Object.keys(conversation.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {conversation.metadata.ai_analysis && (
                              <div className="flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                Score: {conversation.metadata.ai_analysis.score}/100
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
