/**
 * 🐛 UTILITÁRIO DE DEBUG PARA ROLES
 *
 * Ferramenta para diagnosticar problemas de detecção de roles
 */

import { supabase } from '@/integrations/supabase/client';

export interface RoleDebugInfo {
  userEmail: string;
  userId: string;
  detectedRoles: string[];
  emailBasedRole: string | null;
  databaseRoles: string[];
  sessionRoles: string | null;
  timestamp: string;
}

/**
 * Coleta informações completas sobre roles do usuário
 */
export const debugUserRoles = async (user: any): Promise<RoleDebugInfo> => {
  const debugInfo: RoleDebugInfo = {
    userEmail: user?.email || 'unknown',
    userId: user?.id || 'unknown',
    detectedRoles: [],
    emailBasedRole: null,
    databaseRoles: [],
    sessionRoles: null,
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Detectar role baseado no email
    const emailLower = user?.email?.toLowerCase() || '';

    if (
      emailLower === 'gerente@imobiliaria.com' ||
      emailLower.includes('gerente@') ||
      emailLower === 'admin@imobiliaria.com' ||
      emailLower === 'administrador@imobiliaria.com'
    ) {
      debugInfo.emailBasedRole = 'gerente';
    } else if (
      emailLower.includes('corretor@') ||
      emailLower.includes('vendedor@') ||
      emailLower.includes('comercial@')
    ) {
      debugInfo.emailBasedRole = 'corretor';
    }

    // 2. Buscar roles no banco de dados
    if (user?.id) {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!error && data) {
        debugInfo.databaseRoles = data.map((r: any) => r.role);
      }
    }

    // 3. Verificar cache de sessão
    const cacheKey = `user_roles_${user?.id}`;
    const cachedRoles = sessionStorage.getItem(cacheKey);
    if (cachedRoles) {
      try {
        debugInfo.sessionRoles = JSON.parse(cachedRoles);
      } catch (e) {
        // Ignorar erro de parse
      }
    }

    // 4. Determinar roles finais
    if (debugInfo.emailBasedRole) {
      debugInfo.detectedRoles = [debugInfo.emailBasedRole];
    } else if (debugInfo.databaseRoles.length > 0) {
      debugInfo.detectedRoles = debugInfo.databaseRoles;
    } else if (debugInfo.sessionRoles) {
      debugInfo.detectedRoles = debugInfo.sessionRoles;
    } else {
      debugInfo.detectedRoles = ['gerente']; // Fallback
    }
  } catch (error) {
    console.error('Erro no debug de roles:', error);
  }

  return debugInfo;
};

/**
 * Exibe informações de debug no console
 */
export const logRoleDebugInfo = (debugInfo: RoleDebugInfo) => {
  console.group('🐛 DEBUG DE ROLES');
  console.log('📧 Email:', debugInfo.userEmail);
  console.log('🆔 User ID:', debugInfo.userId);
  console.log('📧 Role baseado no email:', debugInfo.emailBasedRole);
  console.log('🗄️ Roles no banco:', debugInfo.databaseRoles);
  console.log('💾 Roles no cache:', debugInfo.sessionRoles);
  console.log('✅ Roles finais detectados:', debugInfo.detectedRoles);
  console.log('⏰ Timestamp:', debugInfo.timestamp);
  console.groupEnd();
};

/**
 * Força uma atualização de roles
 */
export const forceRoleRefresh = async (user: any) => {
  console.log('🔄 Forçando atualização de roles...');

  // Limpar cache
  const cacheKey = `user_roles_${user?.id}`;
  const cacheTimeKey = `user_roles_time_${user?.id}`;
  sessionStorage.removeItem(cacheKey);
  sessionStorage.removeItem(cacheTimeKey);

  // Recarregar página
  window.location.reload();
};

/**
 * Verifica se um usuário tem um role específico
 */
export const hasRoleDebug = (user: any, role: string): boolean => {
  const debugInfo = debugUserRoles(user);
  return debugInfo.detectedRoles.includes(role);
};



