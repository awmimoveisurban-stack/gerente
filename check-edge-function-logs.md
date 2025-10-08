# Verificar Logs da Edge Function

## Problema Atual
```
Edge Function Error Details: FunctionsHttpError: Edge Function returned a non-2xx status code
Full response: {
  "data": null,
  "error": {
    "name": "FunctionsHttpError",
    "context": {}
  },
  "response": {}
}
```

## Diagnóstico
A Edge Function está retornando erro 500, mas não conseguimos ver a mensagem específica. Precisamos verificar os logs.

## Como Verificar os Logs

### Passo 1: Acessar Supabase Dashboard
1. **Acesse**: https://supabase.com/dashboard
2. **Selecione** seu projeto
3. **Vá em** **Functions** no menu lateral
4. **Clique** em `whatsapp-connect`

### Passo 2: Verificar Logs
1. **Clique** na aba **Logs**
2. **Procure** por logs recentes (últimos minutos)
3. **Identifique** erros ou mensagens de debug

### Passo 3: Logs Esperados
Se a função estiver funcionando, você deve ver:
```
🚀 Edge Function started
Request method: POST
Request URL: https://...
🔐 Starting request processing...
📝 Request body parsed: { action: 'test', instanceName: 'empresa-whatsapp' }
🔑 Auth header exists: true
Authenticated user: 809b3943-86e8-4ed4-81df-abf03cf5f73a
🧪 Test endpoint called
🧪 Test response: { success: true, message: 'Edge Function is working', ... }
```

### Passo 4: Logs de Erro
Se houver erro, você verá:
```
❌ Error in whatsapp-connect function: [erro específico]
❌ Error stack: [stack trace]
❌ Error name: [nome do erro]
```

## Possíveis Problemas

### 1. Variáveis de Ambiente Não Configuradas
**Logs mostrarão**:
```
🔧 Environment variables loaded: {
  hasSupabaseUrl: false,
  hasServiceKey: false,
  hasServerUrl: false,
  hasAuthApiKey: false
}
```

**Solução**: Configurar variáveis no Supabase Dashboard > Settings > Edge Functions

### 2. Erro de Autenticação
**Logs mostrarão**:
```
Auth error: [erro específico]
Invalid token
```

**Solução**: Verificar se usuário é gerente

### 3. Erro de Permissão
**Logs mostrarão**:
```
Profile error or not manager: [erro]
Acesso negado. Apenas gerentes podem configurar WhatsApp.
```

**Solução**: Verificar se usuário tem cargo 'gerente'

### 4. Erro de Parsing
**Logs mostrarão**:
```
❌ Failed to parse request body: [erro]
Invalid JSON in request body
```

**Solução**: Verificar formato do request

## Próximos Passos

1. **Verificar logs** no Supabase Dashboard
2. **Identificar** o erro específico
3. **Aplicar** a solução correspondente
4. **Testar** novamente

## Teste Após Correção

Após corrigir o problema identificado nos logs:

1. **Clique "🧪 Test Edge Function"** na interface
2. **Deve retornar**: Success com detalhes do ambiente
3. **Se funcionar**: Testar outras ações (status, connect, etc.)





