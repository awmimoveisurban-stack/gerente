import { memo } from 'react';
import { AlertCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/hooks/use-leads';

interface KanbanAlertsProps {
  leads: Lead[];
}

export const KanbanAlerts = memo(function KanbanAlerts({
  leads,
}: KanbanAlertsProps) {
  // ✅ FASE 1.4: Leads parados >72h
  const getStaleLeads = () => {
    const now = new Date();
    const threshold72h = 72 * 60 * 60 * 1000; // 72 horas em ms
    const threshold7d = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms

    const critical = leads.filter(lead => {
      const updated = new Date(lead.updated_at || lead.created_at);
      const diff = now.getTime() - updated.getTime();
      return (
        diff >= threshold7d &&
        !['fechado', 'perdido'].includes(lead.status.toLowerCase())
      );
    });

    const warning = leads.filter(lead => {
      const updated = new Date(lead.updated_at || lead.created_at);
      const diff = now.getTime() - updated.getTime();
      return (
        diff >= threshold72h &&
        diff < threshold7d &&
        !['fechado', 'perdido'].includes(lead.status.toLowerCase())
      );
    });

    return { critical, warning };
  };

  // Leads novos hoje
  const getNewLeadsToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return leads.filter(lead => new Date(lead.created_at) >= today).length;
  };

  // Taxa de conversão do funil
  const getConversionRate = () => {
    const activeLeads = leads.filter(
      l => !['fechado', 'perdido'].includes(l.status.toLowerCase())
    ).length;
    const closedLeads = leads.filter(
      l => l.status.toLowerCase() === 'fechado'
    ).length;
    const total = activeLeads + closedLeads;
    if (total === 0) return 0;
    return ((closedLeads / total) * 100).toFixed(1);
  };

  const { critical, warning } = getStaleLeads();
  const newToday = getNewLeadsToday();
  const conversionRate = getConversionRate();

  // Se não houver alertas, não renderizar nada
  if (critical.length === 0 && warning.length === 0 && newToday === 0) {
    return null;
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {/* 🔴 CRÍTICO: Leads parados >7 dias */}
      {critical.length > 0 && (
        <Alert className='border-red-500 bg-red-50 dark:bg-red-950/20'>
          <AlertCircle className='h-4 w-4 text-red-600' />
          <AlertDescription className='text-red-800 dark:text-red-200'>
            <div className='flex items-center justify-between'>
              <span className='font-semibold'>🔴 CRÍTICO</span>
              <Badge variant='destructive' className='ml-2'>
                {critical.length} {critical.length === 1 ? 'lead' : 'leads'}
              </Badge>
            </div>
            <p className='text-sm mt-1'>
              Leads parados há <strong>mais de 7 dias</strong> sem ação
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* 🟡 ATENÇÃO: Leads parados 3-7 dias */}
      {warning.length > 0 && (
        <Alert className='border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'>
          <Clock className='h-4 w-4 text-yellow-600' />
          <AlertDescription className='text-yellow-800 dark:text-yellow-200'>
            <div className='flex items-center justify-between'>
              <span className='font-semibold'>🟡 ATENÇÃO</span>
              <Badge className='ml-2 bg-yellow-600 hover:bg-yellow-700'>
                {warning.length} {warning.length === 1 ? 'lead' : 'leads'}
              </Badge>
            </div>
            <p className='text-sm mt-1'>
              Leads parados há <strong>3-7 dias</strong>. Revisar em breve.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* 🟢 BOM: Novos leads hoje */}
      {newToday > 0 && (
        <Alert className='border-green-500 bg-green-50 dark:bg-green-950/20'>
          <Zap className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800 dark:text-green-200'>
            <div className='flex items-center justify-between'>
              <span className='font-semibold'>🟢 EXCELENTE</span>
              <Badge className='ml-2 bg-green-600 hover:bg-green-700'>
                +{newToday} hoje
              </Badge>
            </div>
            <p className='text-sm mt-1'>
              <strong>
                {newToday} {newToday === 1 ? 'novo lead' : 'novos leads'}
              </strong>{' '}
              captados hoje!
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Taxa de conversão */}
      {parseFloat(conversionRate) > 0 && (
        <Alert className='border-blue-500 bg-blue-50 dark:bg-blue-950/20'>
          <TrendingUp className='h-4 w-4 text-blue-600' />
          <AlertDescription className='text-blue-800 dark:text-blue-200'>
            <div className='flex items-center justify-between'>
              <span className='font-semibold'>📈 CONVERSÃO</span>
              <Badge className='ml-2 bg-blue-600 hover:bg-blue-700'>
                {conversionRate}%
              </Badge>
            </div>
            <p className='text-sm mt-1'>Taxa de conversão atual do funil</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});




