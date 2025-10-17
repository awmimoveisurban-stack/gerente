import { useState } from 'react';
import {
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/use-notifications';

export function NotificationsFixed() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.lida).length;

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-600' />;
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      default:
        return <Info className='h-4 w-4 text-blue-600' />;
    }
  };

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className='relative'>
      {/* Botão de Notificações */}
      <Button
        variant='ghost'
        size='sm'
        className='relative h-9 w-9 p-0 hover:bg-gray-100'
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className='h-5 w-5' />
        {unreadCount > 0 && (
          <Badge
            variant='destructive'
            className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs'
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Painel de Notificações */}
      {isOpen && (
        <Card className='absolute right-0 top-12 w-80 sm:w-96 z-50 shadow-xl border-2'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Notificações
                {unreadCount > 0 && (
                  <Badge variant='secondary' className='ml-2'>
                    {unreadCount} novas
                  </Badge>
                )}
              </CardTitle>
              <div className='flex gap-1'>
                {unreadCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={markAllAsRead}
                    className='h-8 px-2 text-xs'
                  >
                    <Check className='h-3 w-3 mr-1' />
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsOpen(false)}
                  className='h-8 w-8 p-0'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <ScrollArea className='h-80'>
              {notifications.length === 0 ? (
                <div className='p-6 text-center text-gray-500'>
                  <Bell className='h-12 w-12 mx-auto mb-3 text-gray-300' />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className='space-y-2 p-2'>
                  {notifications.slice(0, 10).map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                        notification.lida
                          ? 'bg-gray-50 border-gray-200'
                          : getNotificationColor(notification.tipo)
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        {getNotificationIcon(notification.tipo)}
                        <div className='flex-1 min-w-0'>
                          <p
                            className={`text-sm font-medium ${
                              notification.lida
                                ? 'text-gray-600'
                                : 'text-gray-900'
                            }`}
                          >
                            {notification.titulo}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              notification.lida
                                ? 'text-gray-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {notification.mensagem}
                          </p>
                          <p className='text-xs text-gray-400 mt-2'>
                            {new Date(notification.created_at).toLocaleString(
                              'pt-BR'
                            )}
                          </p>
                        </div>
                        {!notification.lida && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => markAsRead(notification.id)}
                            className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100'
                          >
                            <Check className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



