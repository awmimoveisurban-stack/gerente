/**
 * 🔐 GERENCIADOR DE TOKENS DE AUTENTICAÇÃO
 *
 * Utilitário para limpar e gerenciar tokens corrompidos
 * que podem causar erros 400 no refresh token
 */

// Chaves possíveis do localStorage para tokens
const AUTH_KEYS = [
  'sb-bxtuynqauqasigcbocbm-auth-token',
  'supabase.auth.token',
  'sb-auth-token',
  'supabase-auth-token',
];

/**
 * Limpa todos os tokens de autenticação do localStorage
 */
export const clearAllAuthTokens = () => {
  console.log('🧹 Limpando todos os tokens de autenticação...');

  // Limpar localStorage
  AUTH_KEYS.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removido: ${key} (localStorage)`);
    }
  });

  // Limpar sessionStorage
  AUTH_KEYS.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      console.log(`🗑️ Removido: ${key} (sessionStorage)`);
    }
  });

  console.log('✅ Todos os tokens foram limpos');
};

/**
 * Verifica se há tokens corrompidos
 */
export const checkForCorruptedTokens = (): boolean => {
  console.log('🔍 Verificando tokens corrompidos...');

  for (const key of AUTH_KEYS) {
    try {
      const localToken = localStorage.getItem(key);
      if (localToken) {
        const parsed = JSON.parse(localToken);

        // Verificar se o token está corrompido
        if (parsed?.currentSession?.access_token) {
          const token = parsed.currentSession.access_token;
          if (!isValidJWT(token)) {
            console.warn(`⚠️ Token corrompido encontrado: ${key}`);
            return true;
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao verificar token ${key}:`, error);
      return true;
    }
  }

  return false;
};

/**
 * Verifica se um JWT é válido (formato básico)
 */
const isValidJWT = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // JWT deve ter 3 partes separadas por ponto
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Verificar se cada parte é base64 válido
  try {
    parts.forEach(part => {
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Recupera e limpa tokens corrompidos automaticamente
 */
export const recoverFromCorruptedTokens = () => {
  console.log('🔄 Iniciando recuperação de tokens corrompidos...');

  if (checkForCorruptedTokens()) {
    console.log('🚨 Tokens corrompidos detectados, limpando...');
    clearAllAuthTokens();

    // Recarregar a página para reinicializar a autenticação
    setTimeout(() => {
      console.log('🔄 Recarregando página para reinicializar autenticação...');
      window.location.reload();
    }, 1000);

    return true;
  }

  return false;
};

/**
 * Força limpeza de todos os dados de autenticação
 */
export const forceClearAllAuth = () => {
  console.log('🧹 Forçando limpeza completa de autenticação...');

  // Limpar todos os tokens
  clearAllAuthTokens();

  // Limpar dados específicos do Supabase
  const supabaseKeys = Object.keys(localStorage).filter(
    key =>
      key.includes('supabase') || key.includes('sb-') || key.includes('auth')
  );

  supabaseKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido: ${key}`);
  });

  // Limpar sessionStorage também
  const sessionKeys = Object.keys(sessionStorage).filter(
    key =>
      key.includes('supabase') || key.includes('sb-') || key.includes('auth')
  );

  sessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️ Removido (session): ${key}`);
  });

  console.log('✅ Limpeza completa realizada');
};

/**
 * Verifica e corrige tokens automaticamente
 */
export const autoFixAuthTokens = () => {
  console.log('🔧 Verificando e corrigindo tokens automaticamente...');

  try {
    // Verificar se há tokens válidos
    const hasValidTokens = isAuthenticated();

    if (!hasValidTokens) {
      console.log('⚠️ Nenhum token válido encontrado, limpando...');
      forceClearAllAuth();
      return false;
    }

    // Verificar se há tokens corrompidos
    if (checkForCorruptedTokens()) {
      console.log('🚨 Tokens corrompidos encontrados, corrigindo...');
      recoverFromCorruptedTokens();
      return false;
    }

    console.log('✅ Tokens válidos encontrados');
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação automática:', error);
    forceClearAllAuth();
    return false;
  }
};

/**
 * Força logout e limpeza completa
 */
export const forceLogout = () => {
  console.log('🚪 Forçando logout completo...');

  // Limpar todos os tokens
  clearAllAuthTokens();

  // Redirecionar para login
  window.location.href = '/login';
};

/**
 * Verifica se o usuário está autenticado (sem fazer requisições)
 */
export const isAuthenticated = (): boolean => {
  for (const key of AUTH_KEYS) {
    try {
      const localToken = localStorage.getItem(key);
      if (localToken) {
        const parsed = JSON.parse(localToken);
        if (parsed?.currentSession?.access_token) {
          const token = parsed.currentSession.access_token;
          if (isValidJWT(token)) {
            return true;
          }
        }
      }
    } catch (error) {
      // Ignorar erros
    }
  }

  return false;
};
