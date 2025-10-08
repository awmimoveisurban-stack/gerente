# Configuração de Variáveis de Ambiente

## Problema Identificado
```
Has anon key: false
Direct HTTP response body: {"error":"Ação não reconhecida","success":false}
```

## Causa
As variáveis de ambiente do Supabase não estão configuradas no frontend.

## Solução

### 1. Criar Arquivo .env
Crie um arquivo `.env` na raiz do projeto com:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://axtvngaoogqagwacjeek.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Evolution API Configuration (for Edge Functions)
AUTHENTICATION_API_KEY=sua_evolution_api_key_aqui
SERVER_URL=https://api.evolution-api.com

# Supabase Service Role Key (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 2. Obter as Chaves do Supabase

#### A. Supabase URL e Anon Key:
1. **Supabase Dashboard** > **Settings** > **API**
2. **Copie**:
   - **Project URL**: `https://axtvngaoogqagwacjeek.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### B. Service Role Key:
1. **Supabase Dashboard** > **Settings** > **API**
2. **Copie**:
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Obter Evolution API Key
1. **Evolution API Dashboard**
2. **Copie** sua API Key

### 4. Configurar Edge Functions
1. **Supabase Dashboard** > **Settings** > **Edge Functions**
2. **Environment Variables**
3. **Adicionar**:
   ```
   AUTHENTICATION_API_KEY=sua_evolution_api_key
   SERVER_URL=https://api.evolution-api.com
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   SUPABASE_URL=https://axtvngaoogqagwacjeek.supabase.co
   ```

### 5. Reiniciar Servidor
```bash
npm run dev
```

## Teste
Após configurar:

1. **Clique "🔍 Check Function Exists"**
2. **Deve mostrar**: `Has anon key: true`
3. **Deve retornar**: Status 200 ou resposta da função

## Verificação
- ✅ **WebSocket funcionando**: `✅ Successfully subscribed to WhatsApp status updates`
- ❌ **Variáveis de ambiente**: `Has anon key: false`
- ❌ **Edge Function**: Retorna "Ação não reconhecida"

## Próximos Passos
1. **Criar arquivo .env** com as variáveis
2. **Configurar Edge Functions** no Supabase
3. **Reiniciar servidor**
4. **Testar novamente**





