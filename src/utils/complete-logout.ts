/**
 * 🔐 Complete Logout - Logout Completo e Robusto
 * 
 * Função para fazer logout completo, limpando todos os storages
 * e garantindo que o usuário seja completamente desconectado
 */

export const completeLogout = () => {
  console.log('🚪 Iniciando logout completo...');
  
  try {
    // 1. Limpar sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage limpo');
    
    // 2. Limpar localStorage (apenas dados de autenticação)
    const keysToRemove = [
      'urban_crm_session',
      'urban_crm_refresh',
      'force-offline-user',
      'offline-user',
      'offline-auth-session',
      'auth-tokens',
      'user-session',
      'user-roles-cache',
      'user-roles-cache-time'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✅ Removido do localStorage: ${key}`);
    });
    
    // 3. Limpar cookies (se houver)
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    console.log('✅ Cookies limpos');
    
    // 4. Forçar reload da página para garantir limpeza completa
    console.log('🔄 Redirecionando para login...');
    window.location.href = '/login';
    
  } catch (error) {
    console.error('❌ Erro durante logout completo:', error);
    // Mesmo com erro, tentar redirecionar
    window.location.href = '/login';
  }
};

/**
 * 🔐 Logout Suave - Logout sem reload da página
 */
export const softLogout = () => {
  console.log('🚪 Iniciando logout suave...');
  
  try {
    // Limpar apenas dados de autenticação
    const authKeys = [
      'urban_crm_session',
      'urban_crm_refresh', 
      'force-offline-user',
      'offline-user'
    ];
    
    authKeys.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    
    console.log('✅ Logout suave concluído');
    
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('user-logout'));
    
  } catch (error) {
    console.error('❌ Erro durante logout suave:', error);
  }
};

/**
 * 🔐 Verificar se há dados de autenticação residuais
 */
export const checkResidualAuthData = (): string[] => {
  const residualData: string[] = [];
  
  // Verificar sessionStorage
  const sessionKeys = ['urban_crm_session', 'urban_crm_refresh'];
  sessionKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      residualData.push(`sessionStorage: ${key}`);
    }
  });
  
  // Verificar localStorage
  const localKeys = ['force-offline-user', 'offline-user'];
  localKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      residualData.push(`localStorage: ${key}`);
    }
  });
  
  if (residualData.length > 0) {
    console.warn('⚠️ Dados de autenticação residuais encontrados:', residualData);
  }
  
  return residualData;
};


