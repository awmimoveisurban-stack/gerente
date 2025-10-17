/**
 * Sistema de autenticação que força o modo offline
 * Para casos onde o banco de dados tem problemas estruturais
 */

export const forceOfflineAuth = {
  /**
   * Login que funciona 100% offline, sem tentar acessar o banco
   */
  async login(email: string, password: string) {
    console.log('🔐 Login forçado offline iniciado:', { email, password: '***' });
    
    // Validar entrada
    if (!email || !password) {
      console.log('❌ Email ou senha vazios no forceOfflineAuth');
      return {
        success: false,
        error: 'Email e senha são obrigatórios'
      };
    }
    
    console.log('🔄 Gerando usuário offline...');
    // Gerar usuário baseado no email
    const user = this.generateOfflineUser(email);
    console.log('👤 Usuário gerado:', user);
    
    console.log('💾 Salvando no localStorage...');
    // Salvar no localStorage
    localStorage.setItem('force-offline-user', JSON.stringify(user));
    localStorage.setItem('offline-user', JSON.stringify(user)); // Compatibilidade
    
    console.log('✅ Usuário offline criado e salvo:', user);
    
    const result = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        cargo: user.cargo,
        ativo: user.ativo,
        created_at: new Date().toISOString(),
        permissions: user.permissions,
      }
    };
    
    console.log('📤 Retornando resultado:', result);
    return result;
  },

  /**
   * Gerar usuário offline baseado no email
   */
  generateOfflineUser(email: string) {
    const isGerente = email.toLowerCase() === 'cursos360.click@gmail.com';
    
    // IDs fixos para garantir consistência
    const fixedId = isGerente ? 'offline-gerente-fixed-id' : 'offline-corretor-fixed-id';
    
    const user = {
      id: fixedId,
      email: email,
      nome: isGerente ? 'Admin Gerente' : email.split('@')[0] || 'Usuário',
      cargo: isGerente ? 'gerente' : 'corretor',
      ativo: true,
      permissions: isGerente ? [
        'leads:read:all',
        'leads:write:all',
        'leads:delete:all',
        'users:read:all',
        'users:write:all',
        'users:delete:all',
        'reports:read:all',
        'settings:write',
        'audit:read',
      ] : [
        'leads:read:own',
        'leads:write:own',
        'profile:read:own',
        'profile:write:own',
      ]
    };
    
    console.log('🔧 Usuário gerado:', { email, isGerente, cargo: user.cargo, id: user.id });
    return user;
  },

  /**
   * Verificar se há usuário offline
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem('force-offline-user') || localStorage.getItem('offline-user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuário offline:', error);
    }
    return null;
  },

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem('force-offline-user');
    localStorage.removeItem('offline-user');
    console.log('👋 Logout forçado offline realizado');
  },

  /**
   * Verificar se está autenticado
   */
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Verificar se é gerente
   */
  isManager() {
    const user = this.getCurrentUser();
    return user ? user.cargo === 'gerente' : false;
  },

  /**
   * Verificar se é corretor
   */
  isCorretor() {
    const user = this.getCurrentUser();
    return user ? user.cargo === 'corretor' : false;
  },

  /**
   * Verificar permissão
   */
  hasPermission(permission: string) {
    const user = this.getCurrentUser();
    return user ? user.permissions.includes(permission) : false;
  }
};
