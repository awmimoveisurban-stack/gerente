/**
 * 🔍 Debug Navigation - Debug de Navegação
 * 
 * Utilitário para debugar problemas de contexto durante navegação
 */

import { forceOfflineAuth } from './force-offline-auth';

export const debugNavigation = {
  /**
   * Log completo do estado durante navegação
   */
  logNavigationState(page: string, context: any) {
    console.log(`\n🔍 === DEBUG NAVIGATION - ${page} ===`);
    
    // Estado do usuário
    const offlineUser = forceOfflineAuth.getCurrentUser();
    console.log('👤 Usuário offline:', offlineUser);
    
    // Contexto recebido
    if (context) {
      console.log('📋 Contexto recebido:', context);
      if (context.user) {
        console.log('👤 User do contexto:', {
          id: context.user.id,
          email: context.user.email,
          cargo: context.user.cargo,
          nome: context.user.nome
        });
      }
      if (context.roles) {
        console.log('🎭 Roles do contexto:', context.roles);
      }
    }
    
    // Verificar storages
    const sessionData = sessionStorage.getItem('urban_crm_session');
    const localData = localStorage.getItem('force-offline-user');
    
    console.log('🗂️ SessionStorage:', sessionData ? JSON.parse(sessionData) : null);
    console.log('💾 LocalStorage:', localData ? JSON.parse(localData) : null);
    
    console.log(`🔍 === END DEBUG NAVIGATION - ${page} ===\n`);
  },

  /**
   * Verificar inconsistências específicas de navegação
   */
  checkNavigationInconsistencies(page: string, context: any): string[] {
    const inconsistencies: string[] = [];
    
    const offlineUser = forceOfflineAuth.getCurrentUser();
    
    if (context && context.user) {
      // Verificar se o usuário mudou
      if (offlineUser && context.user.id !== offlineUser.id) {
        inconsistencies.push(`ID mismatch: offline=${offlineUser.id}, context=${context.user.id}`);
      }
      
      if (offlineUser && context.user.cargo !== offlineUser.cargo) {
        inconsistencies.push(`Cargo mismatch: offline=${offlineUser.cargo}, context=${context.user.cargo}`);
      }
      
      if (offlineUser && context.user.email !== offlineUser.email) {
        inconsistencies.push(`Email mismatch: offline=${offlineUser.email}, context=${context.user.email}`);
      }
    }
    
    // Verificar se roles estão corretos
    if (context && context.roles) {
      const expectedRole = offlineUser?.cargo === 'gerente' ? 'gerente' : 'corretor';
      if (!context.roles.includes(expectedRole)) {
        inconsistencies.push(`Role missing: expected=${expectedRole}, actual=${context.roles.join(',')}`);
      }
    }
    
    if (inconsistencies.length > 0) {
      console.warn(`⚠️ Inconsistências encontradas em ${page}:`, inconsistencies);
    } else {
      console.log(`✅ Nenhuma inconsistência encontrada em ${page}`);
    }
    
    return inconsistencies;
  },

  /**
   * Forçar sincronização durante navegação
   */
  forceNavigationSync(context: any) {
    console.log('🔄 Forçando sincronização de navegação...');
    
    const offlineUser = forceOfflineAuth.getCurrentUser();
    if (!offlineUser) {
      console.log('❌ Nenhum usuário offline encontrado');
      return;
    }
    
    // Sincronizar com sessionStorage
    const sessionData = {
      user: offlineUser,
      token: `offline-token-${offlineUser.id}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000),
      permissions: offlineUser.permissions,
    };
    
    sessionStorage.setItem('urban_crm_session', JSON.stringify(sessionData));
    localStorage.setItem('urban_crm_session', JSON.stringify(sessionData));
    
    console.log('✅ Sincronização de navegação concluída:', offlineUser);
  },

  /**
   * Monitorar mudanças de página
   */
  startNavigationMonitoring() {
    console.log('👀 Iniciando monitoramento de navegação...');
    
    let lastUser: any = null;
    
    const checkUser = () => {
      const currentUser = forceOfflineAuth.getCurrentUser();
      
      if (lastUser && currentUser) {
        if (lastUser.id !== currentUser.id || lastUser.cargo !== currentUser.cargo) {
          console.warn('⚠️ Usuário mudou durante navegação:', {
            from: { id: lastUser.id, cargo: lastUser.cargo },
            to: { id: currentUser.id, cargo: currentUser.cargo }
          });
        }
      }
      
      lastUser = currentUser;
    };
    
    // Verificar a cada 2 segundos
    const interval = setInterval(checkUser, 2000);
    
    // Limpar quando a página for fechada
    window.addEventListener('beforeunload', () => {
      clearInterval(interval);
    });
    
    return () => clearInterval(interval);
  }
};


