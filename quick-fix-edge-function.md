# Solução Rápida - Edge Function WhatsApp Connect

## Problema Atual
```
Edge Function Error Details: FunctionsHttpError: Edge Function returned a non-2xx status code
```

## Diagnóstico

### Use os Botões de Debug:
1. **"🔍 Check Function Exists"** - Verifica se a função está deployada
2. **"🧪 Test Edge Function"** - Testa a função básica

## Soluções Baseadas no Resultado

### Se "Check Function Exists" retorna 404:
**PROBLEMA**: Edge Function não está deployada

**SOLUÇÃO**:
1. **Supabase Dashboard** > **Functions**
2. **Create new function**
3. **Nome**: `whatsapp-connect`
4. **Copie o código** de `supabase/functions/whatsapp-connect/index.ts`
5. **Deploy**

### Se "Check Function Exists" retorna 200 mas "Test Edge Function" falha:
**PROBLEMA**: Variáveis de ambiente não configuradas

**SOLUÇÃO**:
1. **Supabase Dashboard** > **Settings** > **Edge Functions**
2. **Adicionar variáveis**:
   ```
   AUTHENTICATION_API_KEY=sua_api_key_evolution
   SERVER_URL=https://api.evolution-api.com
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   SUPABASE_URL=sua_url_supabase
   ```

### Se ambos falham com erro diferente:
**PROBLEMA**: Permissões ou configuração

**SOLUÇÃO**:
1. **Verificar** se usuário é gerente
2. **Verificar** logs no Supabase Dashboard
3. **Verificar** se Evolution API está funcionando

## Deploy Manual via Dashboard

### Passo 1: Criar Função
1. **Supabase Dashboard** > **Functions**
2. **"Create a new function"**
3. **Nome**: `whatsapp-connect`
4. **Runtime**: Deno

### Passo 2: Copiar Código
1. **Abra** `supabase/functions/whatsapp-connect/index.ts`
2. **Copie** todo o conteúdo
3. **Cole** no editor da função

### Passo 3: Configurar Variáveis
1. **Settings** > **Edge Functions**
2. **Environment Variables**
3. **Adicionar**:
   - `AUTHENTICATION_API_KEY`
   - `SERVER_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_URL`

### Passo 4: Deploy
1. **Clique** "Deploy function"
2. **Aguarde** o deploy completar
3. **Teste** com os botões de debug

## Teste Final

### Sequência de Testes:
1. **"🔍 Check Function Exists"** → Deve retornar 200
2. **"🧪 Test Edge Function"** → Deve retornar success
3. **"🔄 Check API Status"** → Deve retornar status da API
4. **"🔍 Check DB Status"** → Deve retornar status do banco

### Se todos passarem:
✅ **Edge Function está funcionando corretamente**

### Se algum falhar:
❌ **Verificar logs específicos** e corrigir problema identificado

## URLs Importantes

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Functions**: https://supabase.com/dashboard/project/[ID]/functions
- **Edge Functions Settings**: https://supabase.com/dashboard/project/[ID]/settings/functions

## Próximos Passos

1. **Execute** "🔍 Check Function Exists"
2. **Identifique** o problema baseado no resultado
3. **Aplique** a solução correspondente
4. **Teste** novamente até funcionar





