/**
 * Sistema de autenticação offline que funciona sem depender da tabela profiles
 * Para casos onde há problemas com a estrutura do banco de dados
 */

export interface OfflineUser {
  id: string;
  email: string;
  nome: string;
  cargo: 'gerente' | 'corretor';
  ativo: boolean;
  permissions: string[];
}

export class OfflineAuthSystem {
  private static instance: OfflineAuthSystem;
  private currentUser: OfflineUser | null = null;

  private constructor() {}

  public static getInstance(): OfflineAuthSystem {
    if (!OfflineAuthSystem.instance) {
      OfflineAuthSystem.instance = new OfflineAuthSystem();
    }
    return OfflineAuthSystem.instance;
  }

  /**
   * Login offline que funciona apenas com email
   */
  public async login(email: string, password: string): Promise<{
    success: boolean;
    user?: OfflineUser;
    error?: string;
  }> {
    console.log('🔐 Login offline:', email);

    // Verificar se é o email do gerente
    if (email.toLowerCase() === 'cursos360.click@gmail.com') {
      console.log('✅ Login de gerente aprovado (modo offline)');
      
      this.currentUser = {
        id: 'offline-gerente-' + Date.now(),
        email: email,
        nome: 'Admin Gerente',
        cargo: 'gerente',
        ativo: true,
        permissions: [
          'leads:read:all',
          'leads:write:all',
          'leads:delete:all',
          'users:read:all',
          'users:write:all',
          'users:delete:all',
          'reports:read:all',
          'settings:write',
          'audit:read',
        ],
      };

      // Salvar no localStorage
      localStorage.setItem('offline-user', JSON.stringify(this.currentUser));
      
      return {
        success: true,
        user: this.currentUser,
      };
    }

    // Para outros emails, criar usuário corretor padrão
    console.log('✅ Criando usuário corretor offline');
    
    this.currentUser = {
      id: 'offline-corretor-' + Date.now(),
      email: email,
      nome: email.split('@')[0] || 'Corretor',
      cargo: 'corretor',
      ativo: true,
      permissions: [
        'leads:read:own',
        'leads:write:own',
        'profile:read:own',
        'profile:write:own',
      ],
    };

    // Salvar no localStorage
    localStorage.setItem('offline-user', JSON.stringify(this.currentUser));
    
    return {
      success: true,
      user: this.currentUser,
    };
  }

  /**
   * Verificar se há usuário logado offline
   */
  public getCurrentUser(): OfflineUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Tentar carregar do localStorage
    try {
      const stored = localStorage.getItem('offline-user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuário offline:', error);
    }

    return null;
  }

  /**
   * Logout offline
   */
  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem('offline-user');
    console.log('👋 Logout offline realizado');
  }

  /**
   * Verificar se usuário tem permissão
   */
  public hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.permissions.includes(permission) : false;
  }

  /**
   * Verificar se é gerente
   */
  public isManager(): boolean {
    const user = this.getCurrentUser();
    return user ? user.cargo === 'gerente' : false;
  }

  /**
   * Verificar se é corretor
   */
  public isCorretor(): boolean {
    const user = this.getCurrentUser();
    return user ? user.cargo === 'corretor' : false;
  }

  /**
   * Verificar se usuário está autenticado
   */
  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

// Instância singleton
export const offlineAuth = OfflineAuthSystem.getInstance();


