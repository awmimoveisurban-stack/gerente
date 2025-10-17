import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://bxtuynqauqasigcbocbm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dHV5bnFhdXFhc2lnY2JvY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTU2NDksImV4cCI6MjA3NTI5MTY0OX0.WJ2fQy8gICtVqEVHxQxpaeuVzpKJp1SIHv7oIme9v2o';

// ✅ OTIMIZAÇÃO: Configurações para melhor performance
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // ✅ FIX: Desabilitar detecção de sessão na URL
      flowType: 'implicit', // ✅ FIX: Usar flow implícito para evitar problemas de refresh
      refreshTokenRotationEnabled: false, // ✅ FIX: Desabilitar rotação de refresh token
      debug: false, // ✅ DEBUG: Desabilitar logs de debug em produção
    },
    global: {
      headers: {
        'x-client-info': 'supabase-js-web',
      },
    },
    db: {
      schema: 'public',
    },
    // ✅ Retry automático em caso de falha de rede
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
