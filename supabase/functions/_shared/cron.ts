// ============================================================
// 🔐 CRON AUTHENTICATION
// ============================================================
// Middleware para validar requisições CRON
// ============================================================

export function validateCronRequest(req: Request): boolean {
  // Verificar se é uma requisição CRON válida
  const authHeader = req.headers.get('authorization');
  const cronSecret = Deno.env.get('CRON_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!authHeader) {
    console.warn('⚠️ Requisição sem Authorization header');
    return false;
  }
  
  // Aceitar tanto Bearer token quanto API key
  const token = authHeader.replace('Bearer ', '').replace('apikey ', '');
  
  if (token === cronSecret) {
    console.log('✅ Requisição CRON autenticada');
    return true;
  }
  
  console.warn('⚠️ Token CRON inválido');
  return false;
}

export function createCronResponse(success: boolean, message: string, data?: any) {
  return new Response(
    JSON.stringify({
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }),
    {
      status: success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}










