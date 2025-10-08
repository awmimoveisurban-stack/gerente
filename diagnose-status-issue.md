# Diagnóstico do Problema de Status WhatsApp

## Erro Atual
```
API Error: FunctionsHttpError: Edge Function returned a non-2xx status code
```

## Plano de Diagnóstico

### 1. Teste Básico da Edge Function
1. Clique em **"🧪 Test Edge Function"**
2. Se falhar: Problema na configuração básica da função
3. Se funcionar: Problema específico na ação `status`

### 2. Verificar Logs da Edge Function
1. Vá para Supabase Dashboard
2. Functions > whatsapp-connect
3. Logs tab
4. Procure por erros detalhados

### 3. Possíveis Causas do Erro 500

#### A. Variáveis de Ambiente
- `AUTHENTICATION_API_KEY` - API Key da Evolution API
- `SERVER_URL` - URL da Evolution API
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço

#### B. Evolution API
- API Key incorreta
- URL incorreta
- Instância não existe
- API offline

#### C. Banco de Dados
- Usuário não é gerente
- Configuração não existe
- Permissões incorretas

### 4. Testes de Debug

#### Teste 1: Edge Function Básica
```
Botão: "🧪 Test Edge Function"
Resultado esperado: Success
```

#### Teste 2: Status da API
```
Botão: "🔄 Check API Status"
Resultado esperado: Status da Evolution API
```

#### Teste 3: Banco de Dados
```
Botão: "🔍 Check DB Status"
Resultado esperado: Status atual no banco
```

#### Teste 4: Sincronização
```
Botão: "🔄 Sync State"
Resultado esperado: Estado sincronizado
```

#### Teste 5: Simulação Webhook
```
Botão: "🧪 Simulate Webhook"
Resultado esperado: Status atualizado via WebSocket
```

### 5. Próximos Passos

1. **Execute os testes** na ordem acima
2. **Verifique os logs** no console do navegador
3. **Verifique os logs** no Supabase Dashboard
4. **Identifique** qual teste falha
5. **Corrija** o problema específico

### 6. Soluções Comuns

#### Se Edge Function básica falha:
- Verificar variáveis de ambiente
- Verificar permissões do usuário
- Verificar se função está deployada

#### Se apenas status falha:
- Verificar Evolution API
- Verificar se instância existe
- Verificar API Key

#### Se WebSocket não funciona:
- Verificar subscription status
- Verificar filtros do listener
- Usar sincronização manual





