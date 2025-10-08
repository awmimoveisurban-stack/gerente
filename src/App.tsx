import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { SearchProvider } from "@/contexts/search-context";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/auth";
import Login from "./pages/login";
import CorretorDashboard from "./pages/corretor-dashboard";
import GerenteDashboard from "./pages/gerente-dashboard";
import GerenteWhatsAppPage from "./pages/gerente-whatsapp-final";
import Leads from "./pages/leads";
import Kanban from "./pages/kanban";
import Relatorios from "./pages/relatorios";
import GerenteRelatorios from "./pages/gerente-relatorios";
import GerenteEquipe from "./pages/gerente-equipe";
import TodosLeads from "./pages/todos-leads";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SearchProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['corretor']}>
                <CorretorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/corretor" element={
              <ProtectedRoute allowedRoles={['corretor']}>
                <CorretorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute allowedRoles={['corretor']}>
                <Leads />
              </ProtectedRoute>
            } />
            <Route path="/todos-leads" element={
              <ProtectedRoute allowedRoles={['gerente']}>
                <TodosLeads />
              </ProtectedRoute>
            } />
            <Route path="/kanban" element={
              <ProtectedRoute allowedRoles={['corretor', 'gerente']}>
                <Kanban />
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute allowedRoles={['corretor']}>
                <Relatorios />
              </ProtectedRoute>
            } />
            <Route path="/gerente" element={
              <ProtectedRoute allowedRoles={['gerente']}>
                <GerenteDashboard />
              </ProtectedRoute>
            } />
            <Route path="/gerente-whatsapp" element={
              <ProtectedRoute allowedRoles={['gerente']}>
                <AppLayout>
                  <GerenteWhatsAppPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/gerente/relatorios" element={
              <ProtectedRoute allowedRoles={['gerente']}>
                <GerenteRelatorios />
              </ProtectedRoute>
            } />
            <Route path="/gerente/equipe" element={
              <ProtectedRoute allowedRoles={['gerente']}>
                <GerenteEquipe />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </SearchProvider>
        </BrowserRouter>
          </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
