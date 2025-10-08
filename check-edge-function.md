# Verificação da Edge Function whatsapp-connect

## Erro 500 - Diagnóstico

O erro 500 na Edge Function pode ter várias causas:

### 1. Verificar Variáveis de Ambiente
A Edge Function precisa das seguintes variáveis:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SERVER_URL` (URL da Evolution API)
- `AUTHENTICATION_API_KEY` (API Key da Evolution API)

### 2. Testar Edge Function
Use o botão "🧪 Test Edge Function" para verificar se a função básica está funcionando.

### 3. Verificar Evolution API
O erro pode ser causado por:
- API Key incorreta
- URL da Evolution API incorreta
- Instância não existe
- Evolution API offline

### 4. Logs da Edge Function
Para ver os logs detalhados:
1. Vá para Supabase Dashboard
2. Functions > whatsapp-connect
3. Logs tab
4. Procure por erros detalhados

### 5. Teste Manual
Use o botão "🧪 Simulate Webhook" para testar o WebSocket sem depender da Evolution API.

## Próximos Passos
1. Teste a Edge Function com o botão de teste
2. Verifique os logs no Supabase Dashboard
3. Confirme se as variáveis de ambiente estão configuradas
4. Teste o WebSocket com simulação manual





