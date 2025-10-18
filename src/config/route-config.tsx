/**
 * 🛣️ CONFIGURAÇÃO DE ROTAS DO SISTEMA
 *
 * Sistema centralizado de rotas com:
 * - Type safety completo
 * - Documentação inline
 * - Fácil manutenção
 * - Lazy loading configurável
 *
 * @version 2.0.0
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute, ManagerRoute, CorretorRoute } from '@/components/layout/auth-middleware';
import { DashboardRedirect } from '@/components/layout/dashboard-redirect';
import { AppLayout } from '@/components/layout/app-layout';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { CorretorLogin } from '@/pages/corretor-login';
import AdminTestData from '@/pages/admin-test-data';

// ============================================================================
// LAZY LOADING PAGES (Performance)
// ============================================================================

const Auth = lazy(() => import('@/pages/auth-v2'));
const CorretorDashboard = lazy(() => import('@/pages/corretor-dashboard'));
const GerenteDashboard = lazy(() => import('@/pages/gerente-dashboard-v2'));
const Leads = lazy(() => import('@/pages/leads-v3')); // ✅ PÁGINA PADRONIZADA
const KanbanEnhanced = lazy(() => import('@/pages/kanban-enhanced'));
const Relatorios = lazy(() => import('@/pages/relatorios'));
const GerenteRelatorios = lazy(() => import('@/pages/gerente-relatorios-v3')); // ✅ PÁGINA PADRONIZADA
const GerenteEquipe = lazy(() => import('@/pages/gerente-equipe-v3')); // ✅ PÁGINA PADRONIZADA
const TodosLeads = lazy(() => import('@/pages/todos-leads-v3-simple')); // ✅ PÁGINA PADRONIZADA
const NotificationsPage = lazy(() => import('@/pages/notifications'));
const EvolutionWhatsAppAuto = lazy(() => import('@/pages/evolution-whatsapp-v3')); // ✅ PÁGINA PADRONIZADA
const TestNotifications = lazy(() => import('@/pages/test-notifications'));
const TestNotificationsDebug = lazy(() => import('@/pages/test-notifications-debug'));
const GerentePerformance = lazy(() => import('@/pages/gerente-performance-v3')); // ✅ PÁGINA PADRONIZADA
const Profile = lazy(() => import('@/pages/profile')); // ✅ Página de perfil
const Configuracoes = lazy(() => import('@/pages/configuracoes')); // ✅ Página de configurações
const DiagnosticoLeads = lazy(() => import('@/pages/diagnostico-leads')); // ✅ Página de diagnóstico
const TesteCapturaLeads = lazy(() => import('@/pages/teste-captura-leads')); // ✅ Página de teste

// ============================================================================
// DEFINIÇÃO DE ROTAS
// ============================================================================

export const routes: RouteObject[] = [
  // ----------------------------------------------------------------------------
  // ROTAS PÚBLICAS (sem autenticação)
  // ----------------------------------------------------------------------------
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/login',
    element: <Auth />,
  },
  {
    path: '/corretor-login',
    element: <CorretorLogin />,
  },
  {
    path: '/admin-test-data',
    element: <AdminTestData />,
  },

  // ----------------------------------------------------------------------------
  // ROTAS DO CORRETOR (protegidas)
  // ----------------------------------------------------------------------------
  {
    path: '/corretor',
    element: (
      <ProtectedRoute allowedRoles={['corretor']}>
        <CorretorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard', // Redireciona baseado no role
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <DashboardRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: '/leads',
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <Leads />
      </ProtectedRoute>
    ),
  },
  {
    path: '/relatorios',
    element: (
      <ProtectedRoute allowedRoles={['corretor']}>
        <Relatorios />
      </ProtectedRoute>
    ),
  },

  // ----------------------------------------------------------------------------
  // ROTAS DO GERENTE (protegidas)
  // ----------------------------------------------------------------------------
  {
    path: '/gerente',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <GerenteDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gerente-dashboard', // Alias para /gerente
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <GerenteDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/todos-leads',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <TodosLeads />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gerente-todos-leads', // Alias
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <TodosLeads />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gerente-equipe',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <GerenteEquipe />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gerente/equipe', // Nested route
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <GerenteEquipe />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gerente-relatorios',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <GerenteRelatorios />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gerente/relatorios', // Nested route
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <GerenteRelatorios />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gerente-performance',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <GerentePerformance />
      </ProtectedRoute>
    ),
  },
  {
    path: '/test-notifications',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <TestNotifications />
      </ProtectedRoute>
    ),
  },
  {
    path: '/test-notifications-debug',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <TestNotificationsDebug />
      </ProtectedRoute>
    ),
  },
  {
    path: '/whatsapp',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <EvolutionWhatsAppAuto />
      </ProtectedRoute>
    ),
  },
  {
    path: '/diagnostico-leads',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <DiagnosticoLeads />
      </ProtectedRoute>
    ),
  },
  {
    path: '/teste-captura-leads',
    element: (
      <ProtectedRoute allowedRoles={['gerente']}>
        <TesteCapturaLeads />
      </ProtectedRoute>
    ),
  },

  // ----------------------------------------------------------------------------
  // ROTAS COMPARTILHADAS (corretor + gerente)
  // ----------------------------------------------------------------------------
  {
    path: '/kanban',
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <KanbanEnhanced />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <AppLayout>
          <NotificationsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/configuracoes',
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <AppLayout>
          <Configuracoes />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  // ----------------------------------------------------------------------------
  // FALLBACK
  // ----------------------------------------------------------------------------
  {
    path: '*',
    element: <NotFound />,
  },
];

// ============================================================================
// METADATA DAS ROTAS (Para navegação e breadcrumbs)
// ============================================================================

export const ROUTE_METADATA = {
  // Corretor
  '/corretor': {
    title: 'Dashboard',
    icon: 'LayoutDashboard',
    role: 'corretor',
    showInMenu: true,
  },
  '/leads': {
    title: 'Leads',
    icon: 'Users',
    role: 'both',
    showInMenu: true,
  },
  '/relatorios': {
    title: 'Relatórios',
    icon: 'BarChart',
    role: 'corretor',
    showInMenu: true,
  },

  // Gerente
  '/gerente': {
    title: 'Dashboard',
    icon: 'LayoutDashboard',
    role: 'gerente',
    showInMenu: true,
  },
  '/todos-leads': {
    title: 'Todos os Leads',
    icon: 'Database',
    role: 'gerente',
    showInMenu: true,
  },
  '/gerente-equipe': {
    title: 'Equipe',
    icon: 'Users',
    role: 'gerente',
    showInMenu: true,
  },
  '/gerente-performance': {
    title: 'Performance',
    icon: 'TrendingUp',
    role: 'gerente',
    showInMenu: true,
  },
  '/gerente-relatorios': {
    title: 'Relatórios',
    icon: 'FileText',
    role: 'gerente',
    showInMenu: true,
  },
  '/whatsapp': {
    title: 'WhatsApp',
    icon: 'MessageSquare',
    role: 'gerente',
    showInMenu: true,
  },

  // Compartilhado
  '/kanban': {
    title: 'Kanban',
    icon: 'Kanban',
    role: 'both',
    showInMenu: true,
  },
  '/notifications': {
    title: 'Notificações',
    icon: 'Bell',
    role: 'both',
    showInMenu: true,
  },
  '/profile': {
    title: 'Perfil',
    icon: 'User',
    role: 'both',
    showInMenu: true,
  },
  '/configuracoes': {
    title: 'Configurações',
    icon: 'Settings',
    role: 'both',
    showInMenu: true,
  },
} as const;
