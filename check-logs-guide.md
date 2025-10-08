# Como Verificar Logs da Edge Function

## Problema Atual
```
Function status: 500
Function response: {"error":"Ação não reconhecida","success":false}
```

## Diagnóstico
A Edge Function existe e aceita autenticação, mas retorna "Ação não reconhecida" para TODAS as ações, incluindo 'test' que está implementada.

## Como Verificar Logs

### Passo 1: Acessar Supabase Dashboard
1. **Acesse**: https://supabase.com/dashboard
2. **Selecione** projeto: `axtvngaoogqagwacjeek`
3. **Vá em** **Functions** no menu lateral
4. **Clique** em `whatsapp-connect`

### Passo 2: Verificar Logs
1. **Clique** na aba **Logs**
2. **Procure** por logs dos últimos minutos
3. **Identifique** onde está falhando

### Passo 3: Logs Esperados
Se funcionando corretamente:
```
🚀 Edge Function started
Request method: POST
🔐 Starting request processing...
📝 Request body parsed: { action: 'test', instanceName: 'empresa-whatsapp' }
🔑 Auth header exists: true
Authenticated user: 809b3943-86e8-4ed4-81df-abf03cf5f73a
🧪 Test endpoint called
🧪 Test response: { success: true, ... }
```

### Passo 4: Logs de Erro
Se houver erro:
```
❌ Error in whatsapp-connect function: [erro específico]
❌ Error stack: [stack trace]
❌ Error name: [nome do erro]
```

## Possíveis Problemas

### 1. Variáveis de Ambiente
**Se logs mostrarem**:
```
🔧 Environment variables loaded: {
  hasSupabaseUrl: false,
  hasServiceKey: false,
  hasServerUrl: false,
  hasAuthApiKey: false
}
```

**Solução**: Configurar no Supabase Dashboard > Settings > Edge Functions

### 2. Erro de Autenticação
**Se logs mostrarem**:
```
Auth error: [erro]
Invalid token
```

**Solução**: Verificar se usuário é gerente

### 3. Erro de Parsing
**Se logs mostrarem**:
```
❌ Failed to parse request body: [erro]
Invalid JSON in request body
```

**Solução**: Verificar formato do request

### 4. Erro de Permissão
**Se logs mostrarem**:
```
Profile error or not manager: [erro]
Acesso negado. Apenas gerentes podem configurar WhatsApp.
```

**Solução**: Verificar se usuário tem cargo 'gerente'

## Próximos Passos

1. **Verificar logs** no Supabase Dashboard
2. **Identificar** o erro específico
3. **Aplicar** a solução correspondente
4. **Testar** novamente

## URLs Diretas

- **Functions**: https://supabase.com/dashboard/project/axtvngaoogqagwacjeek/functions
- **whatsapp-connect**: https://supabase.com/dashboard/project/axtvngaoogqagwacjeek/functions/whatsapp-connect
- **Logs**: https://supabase.com/dashboard/project/axtvngaoogqagwacjeek/functions/whatsapp-connect/logs





