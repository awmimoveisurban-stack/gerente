/**
 * Environment Variables Helper
 * Fornece fallback para credenciais hardcoded no client.ts
 *
 * NOTA: Este projeto usa credenciais hardcoded em client.ts
 * Este arquivo só é útil se você quiser usar .env no futuro
 */

interface EnvironmentVariables {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

// ✅ FIX: Credenciais do client.ts como fallback
const HARDCODED_URL = 'https://bxtuynqauqasigcbocbm.supabase.co';
const HARDCODED_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o';

function getEnvVar(key: string, fallback: string): string {
  const value = import.meta.env[key];

  // Se existe no .env, usar
  if (value && value.trim() !== '') {
    return value;
  }

  // Senão, usar fallback hardcoded
  if (import.meta.env.DEV) {
    console.log(`ℹ️ ${key} não encontrado no .env, usando valor hardcoded`);
  }

  return fallback;
}

// ✅ Usar .env se existir, senão usar hardcoded
const env: EnvironmentVariables = {
  VITE_SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL', HARDCODED_URL),
  VITE_SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', HARDCODED_KEY),
};

// Log de status (apenas em dev)
if (import.meta.env.DEV) {
  const usingEnv =
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (usingEnv) {
    console.log('✅ Usando credenciais do .env');
  } else {
    console.log('ℹ️ Usando credenciais hardcoded (client.ts)');
  }
  console.log(
    '   SUPABASE_URL:',
    env.VITE_SUPABASE_URL.substring(0, 30) + '...'
  );
  console.log(
    '   ANON_KEY:',
    env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...'
  );
}

export { env };
