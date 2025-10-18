/**
 * 🔔 Sistema de Notificações Avançado
 * 
 * Hook para gerenciar notificações do sistema de forma segura
 * Integra com sistema existente sem quebrar funcionalidades
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createLogger } from '@/utils/structured-logger';

const logger = createLogger('Notifications');

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface NotificationData {
  id: string;
  type: 'lead' | 'whatsapp' | 'system' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  browserNotifications: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  leadNotifications: boolean;
  whatsappNotifications: boolean;
  systemNotifications: boolean;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    browserNotifications: false,
    soundEnabled: true,
    desktopEnabled: false,
    leadNotifications: true,
    whatsappNotifications: true,
    systemNotifications: true,
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationIdRef = useRef(0);

  // ============================================================================
  // INICIALIZAÇÃO SEGURA
  // ============================================================================

  useEffect(() => {
    // Carregar configurações salvas
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        logger.warn('Erro ao carregar configurações de notificação', { error });
      }
    }

    // Carregar notificações salvas
    const savedNotifications = localStorage.getItem('notifications-history');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.slice(-50)); // Manter apenas últimas 50
      } catch (error) {
        logger.warn('Erro ao carregar histórico de notificações', { error });
      }
    }

    // Verificar permissão de notificações do browser
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Criar elemento de áudio para sons
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
  }, []);

  // Salvar configurações quando mudarem
  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Salvar notificações quando mudarem
  useEffect(() => {
    localStorage.setItem('notifications-history', JSON.stringify(notifications));
  }, [notifications]);

  // ============================================================================
  // FUNÇÕES DE NOTIFICAÇÃO
  // ============================================================================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      logger.warn('Browser não suporta notificações');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setSettings(prev => ({ ...prev, browserNotifications: true }));
        logger.info('Permissão de notificação concedida');
        return true;
      } else {
        logger.warn('Permissão de notificação negada');
        return false;
      }
    } catch (error) {
      logger.error('Erro ao solicitar permissão de notificação', { error });
      return false;
    }
  }, []);

  const playSound = useCallback((type: 'success' | 'error' | 'alert' = 'success') => {
    if (!settings.soundEnabled || !audioRef.current) return;

    try {
      // Sons simples usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Frequências diferentes para cada tipo
      const frequencies = {
        success: [800, 1000, 1200],
        error: [400, 300, 200],
        alert: [1000, 800, 1000]
      };

      const freq = frequencies[type];
      oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime);
      oscillator.frequency.setValueAtTime(freq[1], audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(freq[2], audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      logger.warn('Erro ao reproduzir som', { error });
    }
  }, [settings.soundEnabled]);

  const showBrowserNotification = useCallback((notification: NotificationData) => {
    if (!settings.browserNotifications || permission !== 'granted') return;

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: !settings.soundEnabled,
      });

      // Auto-fechar após 5 segundos (exceto urgentes)
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }

      // Clique na notificação
      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      logger.info('Notificação do browser exibida', { 
        id: notification.id, 
        title: notification.title 
      });
    } catch (error) {
      logger.error('Erro ao exibir notificação do browser', { error });
    }
  }, [settings.browserNotifications, permission, settings.soundEnabled]);

  const addNotification = useCallback((
    type: NotificationData['type'],
    title: string,
    message: string,
    priority: NotificationData['priority'] = 'medium',
    metadata?: Record<string, any>,
    actionUrl?: string
  ) => {
    console.log('🔔 [addNotification] Criando notificação:', {
      type,
      title,
      message,
      priority,
      metadata,
      actionUrl
    });

    const id = `notification_${Date.now()}_${++notificationIdRef.current}`;
    const notification: NotificationData = {
      id,
      type,
      title,
      message,
      priority,
      timestamp: Date.now(),
      read: false,
      metadata,
      actionUrl,
    };

    console.log('🔔 [addNotification] Notificação criada:', notification);

    // Adicionar à lista
    setNotifications(prev => {
      const newNotifications = [notification, ...prev.slice(0, 49)];
      console.log('🔔 [addNotification] Notificações atualizadas:', newNotifications.length);
      return newNotifications;
    });

    // Mostrar notificação do browser se habilitada
    if (settings.browserNotifications) {
      console.log('🔔 [addNotification] Mostrando notificação do browser');
      showBrowserNotification(notification);
    }

    // Reproduzir som se habilitado
    if (settings.soundEnabled) {
      const soundType = priority === 'urgent' ? 'alert' : 
                       priority === 'high' ? 'alert' : 'success';
      playSound(soundType);
    }

    // Mostrar toast como fallback
    toast({
      title: notification.title,
      description: notification.message,
      variant: priority === 'urgent' || priority === 'high' ? 'destructive' : 'default',
    });

    logger.info('Notificação adicionada', { 
      id, 
      type, 
      priority, 
      title 
    });

    return id;
  }, [settings, showBrowserNotification, playSound, toast]);

  // ============================================================================
  // FUNÇÕES ESPECÍFICAS PARA LEADS
  // ============================================================================

  const notifyNewLead = useCallback((leadData: any) => {
    console.log('🔔 [notifyNewLead] Iniciando notificação de lead:', {
      leadData,
      settingsLeadNotifications: settings.leadNotifications,
      settings
    });

    if (!settings.leadNotifications) {
      console.log('🔔 [notifyNewLead] Notificações de lead desabilitadas, ignorando');
      return;
    }

    const priority = leadData.score_ia > 80 ? 'high' : 
                   leadData.score_ia > 60 ? 'medium' : 'low';

    console.log('🔔 [notifyNewLead] Criando notificação com prioridade:', priority);

    addNotification(
      'lead',
      '🎯 Novo Lead Recebido',
      `${leadData.nome} - Score: ${leadData.score_ia}/100`,
      priority,
      { leadId: leadData.id, score: leadData.score_ia },
      '/todos-leads'
    );
  }, [settings.leadNotifications, addNotification]);

  const notifyWhatsAppStatus = useCallback((status: string, message: string) => {
    if (!settings.whatsappNotifications) return;

    const priority = status === 'authorized' ? 'high' : 
                   status === 'error' ? 'urgent' : 'medium';

    addNotification(
      'whatsapp',
      '📱 WhatsApp Status',
      message,
      priority,
      { status }
    );
  }, [settings.whatsappNotifications, addNotification]);

  const notifySystemAlert = useCallback((title: string, message: string, priority: NotificationData['priority'] = 'medium') => {
    if (!settings.systemNotifications) return;

    addNotification(
      'system',
      title,
      message,
      priority
    );
  }, [settings.systemNotifications, addNotification]);

  // ============================================================================
  // FUNÇÕES DE GERENCIAMENTO
  // ============================================================================

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('🔔 [stats] Calculando estatísticas:', { total, unread, byType });
    return { total, unread, byType };
  }, [notifications]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    notifications,
    settings,
    permission,
    stats,

    // Funções principais
    addNotification,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateSettings,

    // Funções específicas
    notifyNewLead,
    notifyWhatsAppStatus,
    notifySystemAlert,

    // Utilitários
    playSound,
  };
};