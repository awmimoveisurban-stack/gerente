import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  lida: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Mock data para demonstração
    const mockNotifications: Notification[] = [
      {
        id: '1',
        titulo: 'Novo lead recebido',
        mensagem: 'João Silva interessado em apartamento de 2 quartos',
        tipo: 'success',
        lida: false,
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min atrás
      },
      {
        id: '2',
        titulo: 'Lead sem resposta',
        mensagem: 'Maria Santos não respondeu há mais de 24h',
        tipo: 'warning',
        lida: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
      },
      {
        id: '3',
        titulo: 'Meta atingida',
        mensagem: 'Parabéns! Você atingiu 80% da meta mensal',
        tipo: 'success',
        lida: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h atrás
      },
      {
        id: '4',
        titulo: 'Sistema de manutenção',
        mensagem: 'Manutenção programada para domingo às 2h',
        tipo: 'info',
        lida: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, lida: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, lida: true }))
    );
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
  };
}
