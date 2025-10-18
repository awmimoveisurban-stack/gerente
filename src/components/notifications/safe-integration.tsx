/**
 * 🔔 Wrapper Seguro de Notificações
 * 
 * Componente que pode ser adicionado ao sistema existente
 * Funciona de forma independente e não afeta funcionalidades atuais
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import React from 'react';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { useNotifications } from '@/hooks/use-notifications';
import { useLeadNotifications } from '@/hooks/use-lead-notifications';

// ============================================================================
// PROVIDER DE NOTIFICAÇÕES
// ============================================================================

interface NotificationProviderProps {
  children: React.ReactNode;
  enableLeadNotifications?: boolean;
  enableWhatsAppNotifications?: boolean;
  enableSystemNotifications?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  enableLeadNotifications = true,
  enableWhatsAppNotifications = true,
  enableSystemNotifications = true,
}) => {
  // Inicializar hooks de notificação
  useNotifications();
  
  // Inicializar notificações de leads se habilitado
  if (enableLeadNotifications) {
    useLeadNotifications();
  }

  return (
    <>
      {children}
    </>
  );
};

// ============================================================================
// COMPONENTE DE INTEGRAÇÃO SEGURA
// ============================================================================

interface SafeNotificationIntegrationProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const SafeNotificationIntegration: React.FC<SafeNotificationIntegrationProps> = ({
  className = '',
  position = 'top-right',
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'fixed top-4 left-4 z-50';
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-50';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      default:
        return 'fixed top-4 right-4 z-50';
    }
  };

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <NotificationCenter />
    </div>
  );
};

// ============================================================================
// HOOK DE INTEGRAÇÃO SEGURA COM LEADS
// ============================================================================

export const useSafeLeadIntegration = () => {
  const { notifyLeadCreated, notifyLeadUpdated, notifyUrgentLead } = useLeadNotifications();

  // Wrapper seguro que não quebra se houver erro
  const safeNotifyLeadCreated = (leadData: any) => {
    try {
      if (leadData && typeof leadData === 'object') {
        notifyLeadCreated(leadData);
      }
    } catch (error) {
      console.warn('Erro ao notificar lead criado (ignorando):', error);
    }
  };

  const safeNotifyLeadUpdated = (leadData: any, changes: any) => {
    try {
      if (leadData && changes && typeof leadData === 'object' && typeof changes === 'object') {
        notifyLeadUpdated(leadData, changes);
      }
    } catch (error) {
      console.warn('Erro ao notificar lead atualizado (ignorando):', error);
    }
  };

  const safeNotifyUrgentLead = (leadData: any, reason: string) => {
    try {
      if (leadData && reason && typeof leadData === 'object' && typeof reason === 'string') {
        notifyUrgentLead(leadData, reason);
      }
    } catch (error) {
      console.warn('Erro ao notificar lead urgente (ignorando):', error);
    }
  };

  return {
    notifyLeadCreated: safeNotifyLeadCreated,
    notifyLeadUpdated: safeNotifyLeadUpdated,
    notifyUrgentLead: safeNotifyUrgentLead,
  };
};

// ============================================================================
// HOOK DE INTEGRAÇÃO SEGURA COM WHATSAPP
// ============================================================================

export const useSafeWhatsAppIntegration = () => {
  const { notifyWhatsAppStatus } = useNotifications();

  const safeNotifyWhatsAppStatus = (status: string, message: string) => {
    try {
      if (status && message && typeof status === 'string' && typeof message === 'string') {
        notifyWhatsAppStatus(status, message);
      }
    } catch (error) {
      console.warn('Erro ao notificar status WhatsApp (ignorando):', error);
    }
  };

  return {
    notifyWhatsAppStatus: safeNotifyWhatsAppStatus,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  NotificationCenter,
  useNotifications,
  useLeadNotifications,
};
