import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Smartphone,
} from 'lucide-react';

interface WhatsAppStatusIndicatorProps {
  status: 'disconnected' | 'pending' | 'connecting' | 'authorized';
  instanceName?: string;
  timeRemaining?: number;
  lastUpdate?: Date;
}

export const WhatsAppStatusIndicator: React.FC<
  WhatsAppStatusIndicatorProps
> = ({ status, instanceName, timeRemaining, lastUpdate }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'authorized':
        return {
          label: 'Conectado',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          icon: CheckCircle,
          description: 'WhatsApp está conectado e funcionando',
        };
      case 'connecting':
        return {
          label: 'Conectando...',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          icon: Clock,
          description: 'Estabelecendo conexão com WhatsApp',
        };
      case 'pending':
        return {
          label: 'Aguardando QR',
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          icon: Smartphone,
          description: timeRemaining
            ? `QR Code expira em ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`
            : 'Aguardando escaneamento do QR Code',
        };
      case 'disconnected':
      default:
        return {
          label: 'Desconectado',
          color: 'bg-red-500',
          textColor: 'text-red-700',
          icon: XCircle,
          description: 'WhatsApp não está conectado',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const IconComponent = statusConfig.icon;

  return (
    <Card className='w-full'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className={`p-2 rounded-full ${statusConfig.color}`}>
              <IconComponent className='h-5 w-5 text-white' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>Status WhatsApp</h3>
              <p className={`text-sm ${statusConfig.textColor} font-medium`}>
                {statusConfig.label}
              </p>
            </div>
          </div>

          <Badge
            variant={status === 'authorized' ? 'default' : 'secondary'}
            className={`${statusConfig.color} text-white`}
          >
            {statusConfig.label}
          </Badge>
        </div>

        <div className='mt-3 space-y-2'>
          <p className='text-sm text-gray-600'>{statusConfig.description}</p>

          {instanceName && (
            <p className='text-xs text-gray-500'>Instância: {instanceName}</p>
          )}

          {lastUpdate && (
            <p className='text-xs text-gray-500'>
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          )}

          {status === 'pending' && timeRemaining && timeRemaining < 60 && (
            <div className='flex items-center space-x-2 text-orange-600'>
              <AlertCircle className='h-4 w-4' />
              <span className='text-sm font-medium'>
                ⚠️ QR Code expirando em breve!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};



