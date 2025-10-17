/**
 * 🚀 URBAN CRM - Application Root
 *
 * Aplicação principal com providers e rotas otimizadas
 * Design modular e fácil manutenção
 *
 * @version 2.0.0
 */

import { Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useRoutes } from 'react-router-dom';
import { UnifiedAuthProvider } from '@/contexts/unified-auth-context';
import { SearchProvider } from '@/contexts/search-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { GlobalLoading } from '@/components/global-loading';
import { routes } from '@/config/route-config';
import { ConsoleHelper } from '@/components/dev/console-helper';
import { AuthMiddleware } from '@/components/layout/auth-middleware';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      refetchOnWindowFocus: false, // Evita requisições desnecessárias
      retry: 1, // Apenas 1 retry
    },
  },
});

// ============================================================================
// APP ROUTES COMPONENT
// ============================================================================

function AppRoutes() {
  const routing = useRoutes(routes);
  return (
    <AuthMiddleware requireAuth={false}>
      {routing}
    </AuthMiddleware>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <UnifiedAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SearchProvider>
              {/* Console Helper para desenvolvimento */}
              <ConsoleHelper />
              {/* Suspense para lazy loading */}
              <Suspense fallback={<GlobalLoading message='Carregando...' />}>
                <AppRoutes />
              </Suspense>
            </SearchProvider>
          </TooltipProvider>
        </UnifiedAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
