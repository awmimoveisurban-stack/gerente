import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  Clock,
  Send,
  Video,
  FileText,
  Image,
  Link,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Lead {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  status: string;
  proxima_acao: string;
  score: number;
}

interface CommunicationToolsProps {
  lead: Lead;
  onAction: (action: string, lead: Lead) => void;
}

export function CommunicationTools({ lead, onAction }: CommunicationToolsProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const quickActions = [
    {
      id: 'call',
      label: 'Ligar',
      icon: Phone,
      color: 'bg-green-500',
      description: 'Ligar imediatamente para o lead',
      action: () => onAction('call', lead)
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-green-600',
      description: 'Enviar mensagem via WhatsApp',
      action: () => onAction('whatsapp', lead)
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: 'bg-blue-500',
      description: 'Enviar email personalizado',
      action: () => onAction('email', lead)
    },
    {
      id: 'visit',
      label: 'Visita',
      icon: Calendar,
      color: 'bg-purple-500',
      description: 'Agendar visita ao imóvel',
      action: () => onAction('visit', lead)
    },
    {
      id: 'proposal',
      label: 'Proposta',
      icon: FileText,
      color: 'bg-orange-500',
      description: 'Enviar proposta comercial',
      action: () => onAction('proposal', lead)
    },
    {
      id: 'followup',
      label: 'Follow-up',
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Agendar follow-up',
      action: () => onAction('followup', lead)
    }
  ];

  const funnelActions = [
    {
      stage: 'novo',
      actions: ['call', 'whatsapp', 'email'],
      priority: 'Alta',
      description: 'Primeiro contato é crucial'
    },
    {
      stage: 'interessado',
      actions: ['visit', 'proposal', 'whatsapp'],
      priority: 'Alta',
      description: 'Momentum de vendas'
    },
    {
      stage: 'visita_agendada',
      actions: ['call', 'whatsapp', 'followup'],
      priority: 'Crítica',
      description: 'Pré-visita importante'
    },
    {
      stage: 'proposta',
      actions: ['call', 'email', 'followup'],
      priority: 'Crítica',
      description: 'Fechamento iminente'
    }
  ];

  const getStageActions = () => {
    const stage = funnelActions.find(s => s.stage === lead.status);
    return stage || funnelActions[0];
  };

  const stageActions = getStageActions();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Ferramentas de Comunicação
        </CardTitle>
        <CardDescription>
          Ações otimizadas para o estágio atual do lead
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status do Lead */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div>
            <div className="font-medium">{lead.nome}</div>
            <div className="text-sm text-muted-foreground">
              Próxima ação: {lead.proxima_acao}
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-blue-500 text-white">
              Score: {lead.score}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">
              Prioridade: {stageActions.priority}
            </div>
          </div>
        </div>

        {/* Ações Recomendadas */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            Ações Recomendadas para {lead.status}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {stageActions.description}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickActions
              .filter(action => stageActions.actions.includes(action.id))
              .map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="flex items-center gap-2 h-auto p-3"
                >
                  <action.icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
          </div>
        </div>

        {/* Todas as Ações */}
        <div>
          <h3 className="font-semibold mb-3">Todas as Ações Disponíveis</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={action.action}
                className="flex items-center gap-2 h-auto p-2"
              >
                <div className={`w-3 h-3 rounded-full ${action.color}`}></div>
                <action.icon className="h-4 w-4" />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Métricas de Comunicação */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Taxa de Resposta
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-xs text-green-600">Últimos 30 dias</div>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Tempo Médio
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600">2.3h</div>
            <div className="text-xs text-blue-600">Primeira resposta</div>
          </div>
        </div>

        {/* Alertas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Lead com alta prioridade - responder em até 2 horas
            </span>
          </div>
          
          {lead.score >= 80 && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Lead qualificado - foco em conversão
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}





