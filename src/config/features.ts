/**
 * Feature flags para habilitar/desabilitar funcionalidades
 *
 * ✅ OTIMIZAÇÃO: Desabilitar features que não estão sendo usadas
 */

export const FEATURES = {
  // Performance de Corretores (requer migration)
  CORRETOR_PERFORMANCE: false, // ✅ Desabilitado até executar migration

  // Notificações (polling desabilitado por padrão)
  NOTIFICATIONS_POLLING: false,

  // Realtime (Polling)
  REALTIME_ENABLED: false,

  // Analytics
  ANALYTICS_ENABLED: false,

  // Debug
  DEBUG_LOGS: !import.meta.env.PROD, // Apenas em desenvolvimento
} as const;



