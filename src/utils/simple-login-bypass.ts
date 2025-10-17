import { offlineAuth } from './offline-auth-system';
import { forceOfflineAuth } from './force-offline-auth';

/**
 * Sistema de login simplificado que bypassa a verificação de senha
 * Para uso temporário durante desenvolvimento e testes
 */

export const simpleLoginBypass = {
  /**
   * Login simplificado que aceita qualquer senha para usuários existentes
   */
  async login(email: string, password: string) {
    console.log('🔐 Login simplificado iniciado:', { email, password: '***' });
    
    // Simular validação básica
    if (!email || !password) {
      console.log('❌ Email ou senha vazios');
      return {
        success: false,
        error: 'Email e senha são obrigatórios'
      };
    }
    
    // Usar login forçado offline (funciona sempre, sem banco)
    console.log('🔄 Chamando forceOfflineAuth.login...');
    try {
      const offlineResult = await forceOfflineAuth.login(email, password);
      console.log('📋 Resultado do forceOfflineAuth:', offlineResult);
      
      if (offlineResult.success && offlineResult.user) {
        console.log('✅ Login forçado offline bem-sucedido:', offlineResult.user);
        return {
          success: true,
          user: offlineResult.user
        };
      } else {
        console.log('❌ Login forçado offline falhou:', offlineResult.error);
        return {
          success: false,
          error: offlineResult.error || 'Erro no login forçado offline'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao chamar forceOfflineAuth:', error);
      return {
        success: false,
        error: 'Erro interno no sistema de login'
      };
    }
  }
};
