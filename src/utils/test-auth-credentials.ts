/**
 * 🔐 UTILITÁRIO PARA TESTAR CREDENCIAIS DE AUTENTICAÇÃO
 *
 * Ferramenta para diagnosticar problemas de login
 */

import { supabase } from '@/integrations/supabase/client';

export interface AuthTestResult {
  success: boolean;
  error?: string;
  userEmail?: string;
  sessionValid?: boolean;
  details: any;
}

/**
 * Testa credenciais de login
 */
export const testAuthCredentials = async (
  email: string,
  password: string
): Promise<AuthTestResult> => {
  console.log('🧪 [AUTH-TEST] Testando credenciais para:', email);

  try {
    // Limpar tokens antes do teste
    const { clearAllAuthTokens } = await import('./auth-token-manager');
    clearAllAuthTokens();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    const result: AuthTestResult = {
      success: !error,
      userEmail: data?.user?.email,
      sessionValid: !!data?.session,
      details: {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        errorMessage: error?.message,
        errorStatus: error?.status,
        errorName: error?.name,
      },
    };

    if (error) {
      result.error = error.message;
      console.error('🧪 [AUTH-TEST] Falha:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
    } else {
      console.log('🧪 [AUTH-TEST] Sucesso:', {
        email: data.user?.email,
        sessionValid: !!data.session,
      });

      // Fazer logout após o teste
      await supabase.auth.signOut();
    }

    return result;
  } catch (error: any) {
    console.error('🧪 [AUTH-TEST] Erro de rede:', error);

    return {
      success: false,
      error: error.message || 'Erro de rede',
      details: {
        networkError: true,
        errorType: error.name,
        errorMessage: error.message,
      },
    };
  }
};

/**
 * Verifica configuração do Supabase
 */
export const testSupabaseConfig = async (): Promise<AuthTestResult> => {
  console.log('🧪 [AUTH-TEST] Testando configuração do Supabase...');

  try {
    // Testar conexão básica
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('🧪 [AUTH-TEST] Erro na conexão:', error);
      return {
        success: false,
        error: error.message,
        details: {
          connectionError: true,
          errorMessage: error.message,
          errorCode: error.code,
        },
      };
    }

    console.log('🧪 [AUTH-TEST] Conexão com Supabase OK');

    return {
      success: true,
      details: {
        connectionValid: true,
        profilesAccessible: true,
      },
    };
  } catch (error: any) {
    console.error('🧪 [AUTH-TEST] Erro de configuração:', error);

    return {
      success: false,
      error: error.message || 'Erro de configuração',
      details: {
        configError: true,
        errorType: error.name,
        errorMessage: error.message,
      },
    };
  }
};

/**
 * Lista usuários disponíveis para teste
 */
export const listTestUsers = async (): Promise<
  { email: string; role: string }[]
> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email, cargo')
      .limit(10);

    if (error) {
      console.error('🧪 [AUTH-TEST] Erro ao listar usuários:', error);
      return [];
    }

    return (data || []).map(user => ({
      email: user.email,
      role: user.cargo || 'indefinido',
    }));
  } catch (error) {
    console.error('🧪 [AUTH-TEST] Erro ao listar usuários:', error);
    return [];
  }
};

/**
 * Executa teste completo de autenticação
 */
export const runFullAuthTest = async (email?: string, password?: string) => {
  console.group('🧪 TESTE COMPLETO DE AUTENTICAÇÃO');

  // 1. Testar configuração
  console.log('1️⃣ Testando configuração do Supabase...');
  const configTest = await testSupabaseConfig();
  console.log('Configuração:', configTest);

  // 2. Listar usuários disponíveis
  console.log('2️⃣ Listando usuários disponíveis...');
  const users = await listTestUsers();
  console.log('Usuários disponíveis:', users);

  // 3. Testar credenciais se fornecidas
  if (email && password) {
    console.log('3️⃣ Testando credenciais...');
    const authTest = await testAuthCredentials(email, password);
    console.log('Teste de credenciais:', authTest);
  }

  console.groupEnd();

  return {
    config: configTest,
    users,
    auth: email && password ? await testAuthCredentials(email, password) : null,
  };
};



