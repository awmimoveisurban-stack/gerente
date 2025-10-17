/**
 * 🔐 Session Manager - Gerenciamento Seguro de Sessões
 * 
 * Gerencia sessões de usuário com segurança e controle de acesso
 * Implementa refresh tokens, expiração e validação
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import { AuthSession, SecureUser } from './security-manager';
import { securityManager } from './security-manager';

// ✅ Configurações de sessão
const SESSION_CONFIG = {
  STORAGE_KEY: 'urban_crm_session',
  REFRESH_KEY: 'urban_crm_refresh',
  EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutos antes da expiração
  MAX_CONCURRENT_SESSIONS: 3,
};

/**
 * ✅ Gerenciador de Sessões Seguro
 */
export class SessionManager {
  private static instance: SessionManager;
  private activeSessions: Map<string, AuthSession> = new Map();

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * 🔐 Salva sessão de forma segura
   */
  public saveSession(session: AuthSession): void {
    try {
      // Adicionar à memória
      this.activeSessions.set(session.user.id, session);

      // Salvar no sessionStorage (mais seguro que localStorage)
      const sessionData = {
        user: session.user,
        token: session.token,
        expires_at: session.expires_at,
        permissions: session.permissions,
      };

      sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
      // Backup no localStorage para persistir entre abas
      localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));

      // Salvar refresh token
      const refreshData = {
        user_id: session.user.id,
        token: session.token,
        created_at: Date.now(),
      };

      sessionStorage.setItem(SESSION_CONFIG.REFRESH_KEY, JSON.stringify(refreshData));
      // Backup no localStorage
      localStorage.setItem(SESSION_CONFIG.REFRESH_KEY, JSON.stringify(refreshData));

      console.log('✅ Sessão salva com sucesso para:', session.user.email);
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
    }
  }

  /**
   * 🔐 Carrega sessão válida
   */
  public loadSession(): AuthSession | null {
    try {
      // Verificar se há sessão no sessionStorage primeiro
      let sessionData = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
      
      // Se não encontrou no sessionStorage, tentar localStorage
      if (!sessionData) {
        console.log('🔄 Sessão não encontrada no sessionStorage, tentando localStorage...');
        sessionData = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
      }
      
      if (!sessionData) {
        console.log('❌ Nenhuma sessão encontrada');
        return null;
      }

      const parsedSession = JSON.parse(sessionData);
      const session: AuthSession = {
        user: parsedSession.user,
        token: parsedSession.token,
        expires_at: parsedSession.expires_at,
        permissions: parsedSession.permissions,
      };

      // Validar se sessão ainda é válida
      if (!securityManager.validateSession(session)) {
        this.clearSession();
        return null;
      }

      // Verificar se está próximo da expiração
      const timeUntilExpiry = session.expires_at - Date.now();
      if (timeUntilExpiry < SESSION_CONFIG.EXPIRY_BUFFER) {
        // Sessão próxima da expiração, tentar renovar
        return this.refreshSession(session) || session;
      }

      // Sessão válida
      this.activeSessions.set(session.user.id, session);
      return session;
    } catch (error) {
      console.error('❌ Erro ao carregar sessão:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * 🔐 Renova sessão se possível
   */
  public refreshSession(session: AuthSession): AuthSession | null {
    try {
      // Verificar se pode renovar (usuário ainda ativo)
      const timeUntilExpiry = session.expires_at - Date.now();
      if (timeUntilExpiry < 0) {
        // Sessão já expirada
        this.clearSession();
        return null;
      }

      // Criar nova sessão com tempo estendido
      const newSession = securityManager.createSecureSession(session.user);
      this.saveSession(newSession);

      console.log('✅ Sessão renovada para:', session.user.email);
      return newSession;
    } catch (error) {
      console.error('❌ Erro ao renovar sessão:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * 🔐 Limpa sessão
   */
  public clearSession(): void {
    try {
      // Limpar da memória
      this.activeSessions.clear();

      // Limpar do sessionStorage
      sessionStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
      sessionStorage.removeItem(SESSION_CONFIG.REFRESH_KEY);
      
      // Limpar do localStorage também
      localStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
      localStorage.removeItem(SESSION_CONFIG.REFRESH_KEY);
      
      // Limpar também os dados do sistema forçado offline
      localStorage.removeItem('force-offline-user');
      localStorage.removeItem('offline-user');

      console.log('✅ Sessão limpa com sucesso (todos os storages)');
    } catch (error) {
      console.error('❌ Erro ao limpar sessão:', error);
    }
  }

  /**
   * 🔐 Verifica se usuário está autenticado
   */
  public isAuthenticated(): boolean {
    const session = this.loadSession();
    return session !== null;
  }

  /**
   * 🔐 Obtém usuário atual
   */
  public getCurrentUser(): SecureUser | null {
    const session = this.loadSession();
    return session?.user || null;
  }

  /**
   * 🔐 Obtém permissões do usuário atual
   */
  public getCurrentPermissions(): string[] {
    const session = this.loadSession();
    return session?.permissions || [];
  }

  /**
   * 🔐 Verifica se usuário tem permissão específica
   */
  public hasPermission(permission: string): boolean {
    const permissions = this.getCurrentPermissions();
    return permissions.includes(permission);
  }

  /**
   * 🔐 Verifica se usuário é gerente
   */
  public isManager(): boolean {
    const user = this.getCurrentUser();
    return user?.cargo === 'gerente';
  }

  /**
   * 🔐 Verifica se usuário é corretor
   */
  public isCorretor(): boolean {
    const user = this.getCurrentUser();
    return user?.cargo === 'corretor';
  }

  /**
   * 🔐 Força logout de todas as sessões
   */
  public forceLogout(): void {
    this.clearSession();
    
    // Redirecionar para login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * 🔐 Valida acesso a rota
   */
  public canAccessRoute(route: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Rotas públicas
    const publicRoutes = ['/login', '/corretor-login', '/admin-test-data'];
    if (publicRoutes.includes(route)) return true;

    // Verificar permissões baseadas na rota
    if (route.startsWith('/gerente') || route.startsWith('/equipe') || route.startsWith('/relatorios')) {
      return this.isManager();
    }

    if (route.startsWith('/corretor') || route.startsWith('/leads')) {
      return this.isCorretor() || this.isManager();
    }

    return true;
  }

  /**
   * 🔐 Monitora expiração de sessão
   */
  public startSessionMonitor(): void {
    // Verificar sessão a cada minuto
    setInterval(() => {
      const session = this.loadSession();
      if (!session) {
        // Sessão inválida, redirecionar para login
        this.forceLogout();
      }
    }, 60000); // 1 minuto
  }

  /**
   * 🔐 Logout automático por inatividade
   */
  public startInactivityTimer(timeout: number = 30 * 60 * 1000): void { // 30 minutos
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('🚪 Logout automático por inatividade');
        this.forceLogout();
      }, timeout);
    };

    // Eventos que indicam atividade
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Iniciar timer
    resetTimer();
  }
}

// ✅ Instância singleton
export const sessionManager = SessionManager.getInstance();

// ✅ Hook para usar o session manager
export const useSession = () => {
  return {
    isAuthenticated: () => sessionManager.isAuthenticated(),
    getCurrentUser: () => sessionManager.getCurrentUser(),
    getCurrentPermissions: () => sessionManager.getCurrentPermissions(),
    hasPermission: (permission: string) => sessionManager.hasPermission(permission),
    isManager: () => sessionManager.isManager(),
    isCorretor: () => sessionManager.isCorretor(),
    canAccessRoute: (route: string) => sessionManager.canAccessRoute(route),
    logout: () => sessionManager.forceLogout(),
  };
};
