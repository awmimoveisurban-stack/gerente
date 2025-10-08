# Verificação da Edge Function WhatsApp Connect

## Erro Atual
```
Edge Function Error Details: FunctionsHttpError: Edge Function returned a non-2xx status code
```

## Possíveis Causas

### 1. Edge Function Não Deployada ❌
- A função `whatsapp-connect` não está deployada no Supabase
- Arquivo não está no local correto

### 2. Variáveis de Ambiente Não Configuradas ❌
- `AUTHENTICATION_API_KEY` - API Key da Evolution API
- `SERVER_URL` - URL da Evolution API  
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço
- `SUPABASE_URL` - URL do Supabase

### 3. Permissões Incorretas ❌
- Usuário não é gerente
- RLS (Row Level Security) bloqueando acesso
- Service Role Key incorreta

## Como Verificar

### Passo 1: Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Functions** no menu lateral
4. Verifique se `whatsapp-connect` aparece na lista

### Passo 2: Verificar Deploy
Se a função não aparecer:
1. **Instalar Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login no Supabase**:
   ```bash
   supabase login
   ```

3. **Link do projeto**:
   ```bash
   supabase link --project-ref SEU_PROJECT_ID
   ```

4. **Deploy da função**:
   ```bash
   supabase functions deploy whatsapp-connect
   ```

### Passo 3: Configurar Variáveis de Ambiente
1. **Supabase Dashboard** > **Settings** > **Edge Functions**
2. **Adicionar variáveis**:
   - `AUTHENTICATION_API_KEY` = sua API key da Evolution API
   - `SERVER_URL` = https://api.evolution-api.com (ou sua URL)
   - `SUPABASE_SERVICE_ROLE_KEY` = sua service role key
   - `SUPABASE_URL` = sua URL do Supabase

### Passo 4: Verificar Logs
1. **Supabase Dashboard** > **Functions** > **whatsapp-connect**
2. **Logs tab** - Procure por erros detalhados
3. **Verifique** se as variáveis estão sendo carregadas

## Teste Manual

### Usar o Botão "🧪 Test Edge Function"
1. **Clique no botão** na interface
2. **Verifique console** para detalhes
3. **Se falhar**: Problema de deploy ou configuração
4. **Se funcionar**: Problema específico na ação `status`

## Solução Alternativa

Se não conseguir fazer deploy via CLI:

### Deploy Manual via Dashboard
1. **Supabase Dashboard** > **Functions**
2. **Create new function**
3. **Nome**: `whatsapp-connect`
4. **Copie o código** do arquivo `supabase/functions/whatsapp-connect/index.ts`
5. **Configure variáveis** de ambiente
6. **Deploy**

## Verificação de Status

### Teste 1: Função Básica
```
Botão: "🧪 Test Edge Function"
Resultado esperado: Success com detalhes do ambiente
```

### Teste 2: Status da API
```
Botão: "🔄 Check API Status"  
Resultado esperado: Status da Evolution API ou erro específico
```

### Teste 3: Banco de Dados
```
Botão: "🔍 Check DB Status"
Resultado esperado: Status atual no banco
```

## Próximos Passos

1. **Verificar** se a função está deployada
2. **Configurar** variáveis de ambiente
3. **Testar** função básica primeiro
4. **Verificar** logs para erros específicos
5. **Corrigir** problema identificado





