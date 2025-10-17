/**
 * 🔍 Debug User Context - Utilitário para debugar contexto do usuário
 */

import { forceOfflineAuth } from './force-offline-auth';

export const debugUserContext = {
  /**
   * Log completo do estado do usuário
   */
  logUserState(context: string = 'Unknown') {
    console.log(`\n🔍 === DEBUG USER CONTEXT - ${context} ===`);
    
    // Verificar forceOfflineAuth
    const offlineUser = forceOfflineAuth.getCurrentUser();
    console.log('📱 Force Offline Auth:', offlineUser);
    
    // Verificar localStorage
    const localUser = localStorage.getItem('force-offline-user');
    console.log('💾 localStorage force-offline-user:', localUser ? JSON.parse(localUser) : null);
    
    const localUser2 = localStorage.getItem('offline-user');
    console.log('💾 localStorage offline-user:', localUser2 ? JSON.parse(localUser2) : null);
    
    // Verificar sessionStorage
    const sessionUser = sessionStorage.getItem('urban_crm_session');
    console.log('🗂️ sessionStorage urban_crm_session:', sessionUser ? JSON.parse(sessionUser) : null);
    
    // Verificar localStorage backup
    const localSession = localStorage.getItem('urban_crm_session');
    console.log('💾 localStorage urban_crm_session:', localSession ? JSON.parse(localSession) : null);
    
    console.log(`🔍 === END DEBUG - ${context} ===\n`);
  },

  /**
   * Verificar se há inconsistências
   */
  checkInconsistencies() {
    const offlineUser = forceOfflineAuth.getCurrentUser();
    const sessionData = sessionStorage.getItem('urban_crm_session');
    const localSessionData = localStorage.getItem('urban_crm_session');
    
    let inconsistencies: string[] = [];
    
    if (offlineUser && sessionData) {
      const session = JSON.parse(sessionData);
      if (offlineUser.id !== session.user.id) {
        inconsistencies.push(`ID mismatch: offline=${offlineUser.id}, session=${session.user.id}`);
      }
      if (offlineUser.cargo !== session.user.cargo) {
        inconsistencies.push(`Cargo mismatch: offline=${offlineUser.cargo}, session=${session.user.cargo}`);
      }
    }
    
    if (sessionData && localSessionData) {
      const session = JSON.parse(sessionData);
      const localSession = JSON.parse(localSessionData);
      if (session.user.id !== localSession.user.id) {
        inconsistencies.push(`Session storage mismatch: session=${session.user.id}, local=${localSession.user.id}`);
      }
    }
    
    if (inconsistencies.length > 0) {
      console.warn('⚠️ INCONSISTÊNCIAS ENCONTRADAS:', inconsistencies);
    } else {
      console.log('✅ Nenhuma inconsistência encontrada');
    }
    
    return inconsistencies;
  },

  /**
   * Forçar sincronização de todos os storages
   */
  forceSync(email: string) {
    console.log('🔄 Forçando sincronização para email:', email);
    
    const offlineUser = forceOfflineAuth.getCurrentUser();
    if (!offlineUser) {
      console.log('❌ Nenhum usuário offline encontrado');
      return;
    }
    
    // Sincronizar localStorage
    localStorage.setItem('force-offline-user', JSON.stringify(offlineUser));
    localStorage.setItem('offline-user', JSON.stringify(offlineUser));
    
    // Sincronizar sessionStorage
    const sessionData = {
      user: offlineUser,
      token: `offline-token-${offlineUser.id}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000),
      permissions: offlineUser.permissions,
    };
    
    sessionStorage.setItem('urban_crm_session', JSON.stringify(sessionData));
    localStorage.setItem('urban_crm_session', JSON.stringify(sessionData));
    
    console.log('✅ Sincronização forçada concluída:', offlineUser);
  },

  /**
   * Limpar todos os storages
   */
  clearAll() {
    console.log('🗑️ Limpando todos os storages...');
    
    localStorage.removeItem('force-offline-user');
    localStorage.removeItem('offline-user');
    localStorage.removeItem('urban_crm_session');
    localStorage.removeItem('urban_crm_refresh');
    
    sessionStorage.removeItem('urban_crm_session');
    sessionStorage.removeItem('urban_crm_refresh');
    
    console.log('✅ Todos os storages limpos');
  }
};


