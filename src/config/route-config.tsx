/**
 * 🛣️ CONFIGURAÇÃO DE ROTAS DO SISTEMA
 *
 * Sistema centralizado de rotas com:
 * - Type safety completo
 * - Documentação inline
 * - Fácil manutenção
 * - Lazy loading configurável
 *
 * @version 3.0.0 - Sistema Unificado
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute, ManagerRoute, CorretorRoute } from '@/components/layout/auth-middleware';
import { DashboardRedirect } from '@/components/layout/dashboard-redirect';
import { AppLayout } from '@/components/layout/app-layout';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// ============================================================================
// LAZY LOADING PAGES (Performance)
// ============================================================================

// ✅ NOVOS COMPONENTES UNIFICADOS
const LoginPage = lazy(() => import('@/features/auth/login-page'));
const ManagerDashboard = lazy(() => import('@/features/dashboard/manager-dashboard'));

// 🔄 COMPONENTES EXISTENTES (temporários)
const CorretorDashboard = lazy(() => import('@/pages/corretor-dashboard'));
const Leads = lazy(() => import('@/pages/leads-v3'));
const KanbanEnhanced = lazy(() => import('@/pages/kanban-enhanced'));
const TodosLeads = lazy(() => import('@/pages/todos-leads-v3-simple'));
const EvolutionWhatsAppAuto = lazy(() => import('@/pages/evolution-whatsapp-v3'));

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
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth',
    element: <LoginPage />,
  },

  // ----------------------------------------------------------------------------
  // REDIRECIONAMENTO DO DASHBOARD
  // ----------------------------------------------------------------------------
  {
    path: '/dashboard',
    element: <DashboardRedirect />,
  },

  // ----------------------------------------------------------------------------
  // ROTAS DO GERENTE (protegidas)
  // ----------------------------------------------------------------------------
  {
    path: '/gerente',
    element: (
      <ManagerRoute>
        <AppLayout>
          <ManagerDashboard />
        </AppLayout>
      </ManagerRoute>
    ),
  },

  // ----------------------------------------------------------------------------
  // ROTAS DO CORRETOR (protegidas)
  // ----------------------------------------------------------------------------
  {
    path: '/corretor',
    element: (
      <CorretorRoute>
        <AppLayout>
          <CorretorDashboard />
        </AppLayout>
      </CorretorRoute>
    ),
  },

  // ----------------------------------------------------------------------------
  // ROTAS COMPARTILHADAS (gerente e corretor)
  // ----------------------------------------------------------------------------
  {
    path: '/leads',
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <AppLayout>
          <Leads />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/kanban',
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <AppLayout>
          <KanbanEnhanced />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/todos-leads',
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <AppLayout>
          <TodosLeads />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/whatsapp',
    element: (
      <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
        <AppLayout>
          <EvolutionWhatsAppAuto />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  // ----------------------------------------------------------------------------
  // ROTA 404 (Not Found)
  // ----------------------------------------------------------------------------
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;