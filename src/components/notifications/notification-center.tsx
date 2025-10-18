/**
 * 🔔 Componente de Notificações
 * 
 * Componente visual para exibir e gerenciar notificações
 * Integração opcional que não afeta o sistema atual
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import React, { useState } from 'react';
import { Bell, BellOff, Settings, X, Check, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  className = '' 
}) => {
  const {
    notifications,
    settings,
    permission,
    stats,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateSettings,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Debug: Log das notificações recebidas
  console.log('🔔 [NotificationCenter] Estado atual:', {
    notificationsCount: notifications.length,
    stats,
    settings,
    permission
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead': return '🎯';
      case 'whatsapp': return '📱';
      case 'system': return '⚙️';
      case 'alert': return '⚠️';
      default: return '🔔';
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão de Notificações */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {stats.unread > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {stats.unread > 99 ? '99+' : stats.unread}
          </Badge>
        )}
      </Button>

      {/* Painel de Notificações */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
                {stats.unread > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {stats.unread} não lidas
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Configurações */}
            {showSettings && (
              <div className="p-4 border-b">
                <h4 className="font-semibold mb-3">Configurações</h4>
                
                {permission !== 'granted' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">
                      Notificações do browser não estão habilitadas
                    </p>
                    <Button
                      size="sm"
                      onClick={handleRequestPermission}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Habilitar Notificações
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm">Sons</span>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => 
                        updateSettings({ soundEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Leads</span>
                    </div>
                    <Switch
                      checked={settings.leadNotifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ leadNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">WhatsApp</span>
                    </div>
                    <Switch
                      checked={settings.whatsappNotifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ whatsappNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Sistema</span>
                    </div>
                    <Switch
                      checked={settings.systemNotifications}
                      onCheckedChange={(checked) => 
                        updateSettings({ systemNotifications: checked })
                      }
                    />
                  </div>
                </div>

                <Separator className="my-3" />
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markAllAsRead}
                    disabled={stats.unread === 0}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Marcar todas como lidas
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearNotifications}
                    disabled={notifications.length === 0}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar todas
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de Notificações */}
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma notificação ainda</p>
                  <p className="text-sm">As notificações aparecerão aqui</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                        notification.read 
                          ? 'bg-gray-50 hover:bg-gray-100' 
                          : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {getTypeIcon(notification.type)}
                            </span>
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          
                          <p className={`text-sm ${
                            notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-gray-400 mt-1">
                            {(() => {
                              try {
                                const date = new Date(notification.timestamp);
                                if (isNaN(date.getTime())) {
                                  return 'Agora mesmo';
                                }
                                return formatDistanceToNow(date, {
                                  addSuffix: true,
                                  locale: ptBR
                                });
                              } catch (error) {
                                console.warn('Erro ao formatar data:', error);
                                return 'Agora mesmo';
                              }
                            })()}
                          </p>
                        </div>
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
};
