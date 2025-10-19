import { useState, useCallback } from 'react';

// 🔔 INTERFACE DE NOTIFICAÇÃO
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

// 🔔 HOOK BÁSICO DE NOTIFICAÇÕES
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Adicionar notificação
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Marcar como lida
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Remover notificação
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Limpar todas as notificações
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount
  };
}

export default useNotifications;

