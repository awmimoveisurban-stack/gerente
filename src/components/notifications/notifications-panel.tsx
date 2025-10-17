import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  BellOff,
  Flame,
  Mail,
  Phone,
  Trash2,
  Check,
  CheckCheck,
  Eye,
} from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsPanelProps {
  onViewLead?: (leadId: string) => void;
}

export function NotificationsPanel({ onViewLead }: NotificationsPanelProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotifications();

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'lead_quente':
        return <Flame className='h-4 w-4 text-red-500' />;
      case 'lead_novo':
        return <Bell className='h-4 w-4 text-blue-500' />;
      case 'mensagem':
        return <Mail className='h-4 w-4 text-green-500' />;
      case 'ligacao':
        return <Phone className='h-4 w-4 text-purple-500' />;
      default:
        return <Bell className='h-4 w-4 text-gray-500' />;
    }
  };

  const getNotificationStyle = (tipo: string, lido: boolean) => {
    const baseStyle =
      'p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer';

    if (lido) {
      return `${baseStyle} bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60`;
    }

    switch (tipo) {
      case 'lead_quente':
        return `${baseStyle} bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-300 dark:border-red-800`;
      case 'lead_novo':
        return `${baseStyle} bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800`;
      default:
        return `${baseStyle} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-3'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='h-20 bg-gray-200 dark:bg-gray-700 rounded-lg'
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl'>
              <Bell className='h-5 w-5 text-white' />
            </div>
            <div>
              <CardTitle className='text-xl font-bold text-gray-900 dark:text-white'>
                Notificações
              </CardTitle>
              <CardDescription className='text-gray-600 dark:text-gray-400'>
                {unreadCount > 0
                  ? `${unreadCount} ${unreadCount === 1 ? 'nova notificação' : 'novas notificações'}`
                  : 'Nenhuma notificação nova'}
              </CardDescription>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className='flex gap-2'>
              {unreadCount > 0 && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={markAllAsRead}
                  className='gap-2'
                >
                  <CheckCheck className='h-4 w-4' />
                  Marcar todas
                </Button>
              )}
              <Button
                variant='outline'
                size='sm'
                onClick={deleteAllRead}
                className='gap-2 text-red-600 hover:text-red-700'
              >
                <Trash2 className='h-4 w-4' />
                Limpar lidas
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        {notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 px-4'>
            <div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4'>
              <BellOff className='h-8 w-8 text-gray-400' />
            </div>
            <p className='text-gray-500 dark:text-gray-400 text-center'>
              Nenhuma notificação ainda
            </p>
            <p className='text-xs text-gray-400 dark:text-gray-500 text-center mt-1'>
              Você receberá notificações quando leads quentes chegarem!
            </p>
          </div>
        ) : (
          <ScrollArea className='h-[500px]'>
            <div className='p-4 space-y-3'>
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={getNotificationStyle(
                      notification.tipo,
                      notification.lido
                    )}
                    onClick={() =>
                      !notification.lido && markAsRead(notification.id)
                    }
                  >
                    <div className='flex items-start gap-3'>
                      {/* Ícone */}
                      <div className='mt-1'>
                        {getNotificationIcon(notification.tipo)}
                      </div>

                      {/* Conteúdo */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2 mb-1'>
                          <h4 className='font-semibold text-sm text-gray-900 dark:text-white'>
                            {notification.titulo}
                          </h4>
                          {!notification.lido && (
                            <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
                          )}
                        </div>

                        <p className='text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line'>
                          {notification.mensagem}
                        </p>

                        <div className='flex items-center justify-between mt-2'>
                          <span className='text-xs text-gray-500 dark:text-gray-500'>
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                                locale: ptBR,
                              }
                            )}
                          </span>

                          <div className='flex gap-1'>
                            {notification.lead_id && onViewLead && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={e => {
                                  e.stopPropagation();
                                  onViewLead(notification.lead_id!);
                                }}
                                className='h-7 px-2 text-xs hover:bg-purple-100 dark:hover:bg-purple-950/30'
                              >
                                <Eye className='h-3 w-3 mr-1' />
                                Ver Lead
                              </Button>
                            )}

                            {!notification.lido && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={e => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className='h-7 px-2 text-xs hover:bg-green-100 dark:hover:bg-green-950/30'
                              >
                                <Check className='h-3 w-3 mr-1' />
                                Marcar lida
                              </Button>
                            )}

                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={e => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className='h-7 px-2 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-950/30'
                            >
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < notifications.length - 1 && (
                    <Separator className='my-2' />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}



