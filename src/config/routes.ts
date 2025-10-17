/**
 * 🛣️ ROTAS DO SISTEMA
 *
 * Constantes centralizadas para todas as rotas da aplicação.
 * Usar estas constantes garante consistência e evita links quebrados.
 *
 * Padrão: Usar HÍFEN para separar palavras (/gerente-equipe)
 */

export const ROUTES = {
  // ============================================================================
  // AUTENTICAÇÃO
  // ============================================================================
  AUTH: '/auth',
  LOGIN: '/login',

  // ============================================================================
  // CORRETOR
  // ============================================================================
  CORRETOR_DASHBOARD: '/corretor',
  CORRETOR_LEADS: '/leads',
  CORRETOR_KANBAN: '/kanban',
  CORRETOR_RELATORIOS: '/relatorios',

  // ============================================================================
  // GERENTE
  // ============================================================================
  GERENTE_DASHBOARD: '/gerente',
  GERENTE_TODOS_LEADS: '/todos-leads',
  GERENTE_PERFORMANCE: '/gerente-performance',
  GERENTE_EQUIPE: '/gerente-equipe',
  GERENTE_RELATORIOS: '/gerente-relatorios',
  GERENTE_WHATSAPP: '/whatsapp',

  // ============================================================================
  // COMUM (CORRETOR E GERENTE)
  // ============================================================================
  KANBAN: '/kanban',
  NOTIFICATIONS: '/notifications',

  // ============================================================================
  // OUTROS
  // ============================================================================
  HOME: '/',
  NOT_FOUND: '/404',
} as const;

/**
 * Type-safe navigation helper
 *
 * Uso:
 * ```tsx
 * import { ROUTES } from '@/config/routes';
 *
 * // Em vez de:
 * navigate('/gerente-equipe');  // ❌ Pode ter typo
 *
 * // Use:
 * navigate(ROUTES.GERENTE_EQUIPE);  // ✅ Type-safe e consistente
 * ```
 */

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];
