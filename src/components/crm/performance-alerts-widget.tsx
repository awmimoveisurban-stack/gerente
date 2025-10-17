import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useCorretorPerformance,
  type CorretorAlert,
} from '@/hooks/use-corretor-performance';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MessageSquare,
  Clock,
  TrendingDown,
  Flame,
  X,
  ExternalLink,
  RefreshCw,
  Bell,
  BellOff,
} from 'lucide-react';

interface PerformanceAlertsWidgetProps {
  maxAlerts?: number;
  showHeader?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // em segundos
}

export function PerformanceAlertsWidget({
  maxAlerts = 5,
  showHeader = true,
  autoRefresh = false,
  refreshInterval = 60,
}: PerformanceAlertsWidgetProps) {
  const { alerts, loading, refetch } = useCorretorPerformance();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!isMuted) {
        refetch();
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isMuted, refetch]);

  // Filtrar alertas não dispensados
  const visibleAlerts = alerts
    .filter(alert => !dismissed.has(alert.id))
    .slice(0, maxAlerts);

  const handleDismiss = (alertId: string) => {
    setDismissed(prev => new Set(prev).add(alertId));
  };

  const handleViewLead = (leadId?: string) => {
    if (leadId) {
      navigate(`/gerente-todos-leads?highlight=${leadId}`);
    }
  };

  const handleViewCorretor = (corretorId: string) => {
    navigate(`/gerente-performance?highlight=${corretorId}`);
  };

  // Função para obter ícone do alerta
  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'lead_sem_resposta':
        return <MessageSquare className='h-5 w-5' />;
      case 'lead_quente_parado':
        return <Flame className='h-5 w-5' />;
      case 'baixa_conversao':
        return <TrendingDown className='h-5 w-5' />;
      case 'tempo_resposta_alto':
        return <Clock className='h-5 w-5' />;
      default:
        return <AlertTriangle className='h-5 w-5' />;
    }
  };

  // Função para obter estilo do alerta
  const getAlertStyle = (severidade: string) => {
    switch (severidade) {
      case 'critica':
        return {
          container: 'bg-red-50 border-red-300 hover:bg-red-100',
          icon: 'text-red-600',
          badge: 'bg-red-600 text-white',
          text: 'text-red-900',
        };
      case 'alta':
        return {
          container: 'bg-orange-50 border-orange-300 hover:bg-orange-100',
          icon: 'text-orange-600',
          badge: 'bg-orange-600 text-white',
          text: 'text-orange-900',
        };
      case 'media':
        return {
          container: 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-600 text-white',
          text: 'text-yellow-900',
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-300 hover:bg-blue-100',
          icon: 'text-blue-600',
          badge: 'bg-blue-600 text-white',
          text: 'text-blue-900',
        };
    }
  };

  // Função para formatar mensagem do alerta
  const formatarMensagemAlerta = (alert: CorretorAlert) => {
    const styles = getAlertStyle(alert.severidade);

    return (
      <div
        className={`p-4 rounded-lg border-2 transition-all ${styles.container}`}
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-start gap-3 flex-1'>
            <div className={styles.icon}>{getAlertIcon(alert.tipo)}</div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <p className={`font-semibold ${styles.text}`}>
                  {alert.corretor_nome}
                </p>
                <Badge className={styles.badge}>
                  {alert.severidade.toUpperCase()}
                </Badge>
              </div>
              <p className='text-sm text-gray-700 mb-2'>{alert.mensagem}</p>
              {alert.lead_nome && (
                <p className='text-xs text-gray-600 italic'>
                  Lead: {alert.lead_nome}
                </p>
              )}
              <div className='flex gap-2 mt-3'>
                {alert.lead_id && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleViewLead(alert.lead_id)}
                    className='text-xs'
                  >
                    <ExternalLink className='h-3 w-3 mr-1' />
                    Ver Lead
                  </Button>
                )}
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleViewCorretor(alert.corretor_id)}
                  className='text-xs'
                >
                  <ExternalLink className='h-3 w-3 mr-1' />
                  Ver Corretor
                </Button>
              </div>
            </div>
          </div>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => handleDismiss(alert.id)}
            className='flex-shrink-0'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <RefreshCw className='h-6 w-6 animate-spin text-gray-400 mr-2' />
            <span className='text-gray-600'>Carregando alertas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <Card className='border-green-200 bg-green-50'>
        {showHeader && (
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-green-800'>
              <AlertTriangle className='h-5 w-5' />
              Alertas
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className='text-center py-4'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <AlertTriangle className='h-8 w-8 text-green-600' />
            </div>
            <p className='text-green-800 font-semibold mb-1'>
              Tudo está sob controle! 🎉
            </p>
            <p className='text-sm text-green-600'>Nenhum alerta no momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='border-red-300 bg-red-50/30'>
      {showHeader && (
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2 text-red-800'>
                <AlertTriangle className='h-5 w-5' />
                Alertas Críticos
                {visibleAlerts.length > 0 && (
                  <Badge variant='destructive' className='ml-2'>
                    {visibleAlerts.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Situações que requerem atenção imediata
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => setIsMuted(!isMuted)}
                title={
                  isMuted ? 'Ativar notificações' : 'Silenciar notificações'
                }
              >
                {isMuted ? (
                  <BellOff className='h-4 w-4 text-gray-500' />
                ) : (
                  <Bell className='h-4 w-4' />
                )}
              </Button>
              <Button size='sm' variant='outline' onClick={() => refetch()}>
                <RefreshCw className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className='space-y-3'>
          {visibleAlerts.map(alert => (
            <div key={alert.id}>{formatarMensagemAlerta(alert)}</div>
          ))}
          {alerts.length > maxAlerts && (
            <Button
              variant='link'
              className='w-full'
              onClick={() => navigate('/gerente-performance')}
            >
              Ver todos os {alerts.length} alertas
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



