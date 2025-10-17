/**
 * Sistema de autenticação offline que não depende do banco de dados
 * Funciona apenas com validação de email
 */

export const offlineAuth = {
  /**
   * Lista de emails autorizados (gerentes)
   */
  authorizedEmails: [
    'cursos360.click@gmail.com',
    'admin@imobiliaria.com',
    'gerente@teste.com',
  ],

  /**
   * Login offline - apenas verifica se o email está na lista
   */
  async login(email: string, password: string) {
    console.log('🔐 Login offline:', email);
    
    // Validação básica
    if (!email || !password) {
      return {
        success: false,
        error: 'Email e senha são obrigatórios'
      };
    }

    // Verificar se o email está na lista de autorizados
    const isAuthorized = this.authorizedEmails.includes(email.toLowerCase());
    
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Email não autorizado para login'
      };
    }

    console.log('✅ Login offline aprovado para:', email);

    // Retornar usuário simulado
    return {
      success: true,
      user: {
        id: `offline-${email.replace('@', '-').replace('.', '-')}`,
        email: email,
        nome: this.getDisplayName(email),
        cargo: 'gerente' as const,
        ativo: true,
        created_at: new Date().toISOString(),
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
      }
    };
  },

  /**
   * Obter nome de exibição baseado no email
   */
  getDisplayName(email: string): string {
    const nameMap: { [key: string]: string } = {
      'cursos360.click@gmail.com': 'Admin Gerente',
      'admin@imobiliaria.com': 'Administrador',
      'gerente@teste.com': 'Gerente Teste',
    };

    return nameMap[email.toLowerCase()] || 'Usuário Gerente';
  },

  /**
   * Adicionar novo email autorizado
   */
  addAuthorizedEmail(email: string) {
    if (!this.authorizedEmails.includes(email.toLowerCase())) {
      this.authorizedEmails.push(email.toLowerCase());
      console.log('✅ Email adicionado à lista autorizada:', email);
    }
  },

  /**
   * Remover email autorizado
   */
  removeAuthorizedEmail(email: string) {
    const index = this.authorizedEmails.indexOf(email.toLowerCase());
    if (index > -1) {
      this.authorizedEmails.splice(index, 1);
      console.log('✅ Email removido da lista autorizada:', email);
    }
  },

  /**
   * Listar emails autorizados
   */
  getAuthorizedEmails() {
    return [...this.authorizedEmails];
  }
};


