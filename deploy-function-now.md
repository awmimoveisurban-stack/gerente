# Deploy Imediato da Edge Function

## Status Atual
A Edge Function ainda retorna erro 500 porque não foi atualizada com os logs de debug.

## Deploy Manual Obrigatório

### Passo 1: Acessar Dashboard
1. **Abra**: https://supabase.com/dashboard/project/axtvngaoogqagwacjeek/functions/whatsapp-connect
2. **Clique** em "Edit function" (ou "Edit")

### Passo 2: Copiar Código Atualizado
1. **Abra** o arquivo: `supabase/functions/whatsapp-connect/index.ts`
2. **Selecione** todo o conteúdo (Ctrl+A)
3. **Copie** (Ctrl+C)

### Passo 3: Colar no Dashboard
1. **Cole** no editor da função no dashboard
2. **Clique** "Deploy function" (ou "Save")

### Passo 4: Aguardar Deploy
1. **Aguarde** o deploy completar (pode levar 1-2 minutos)
2. **Verifique** se aparece "Deployed successfully"

## Teste Após Deploy

1. **Clique** "🧪 Test Edge Function" na interface
2. **Verifique** logs em: https://supabase.com/dashboard/project/axtvngaoogqagwacjeek/functions/whatsapp-connect/logs
3. **Procure** pelos novos logs:
   ```
   🎯 Extracted action: test
   🎯 Extracted instanceName: empresa-whatsapp
   🎯 Request body keys: ['action', 'instanceName']
   ```

## Se Deploy Falhar

### Problema: Código muito grande
**Solução**: Copie em partes menores

### Problema: Erro de sintaxe
**Solução**: Verifique se copiou completamente

### Problema: Timeout
**Solução**: Tente novamente após alguns minutos

## Verificação de Sucesso

Após deploy bem-sucedido:
- ✅ **Interface**: "🧪 Test Edge Function" deve retornar success
- ✅ **Logs**: Deve mostrar logs de debug detalhados
- ✅ **Status**: Edge Function deve funcionar corretamente

## URLs Importantes

- **Edit Function**: https://supabase.com/dashboard/project/axtvngaoogqagwacjeek/functions/whatsapp-connect
- **Logs**: https://supabase.com/dashboard/project/axtvngaoogqagwacjeek/functions/whatsapp-connect/logs
- **Functions List**: https://supabase.com/dashboard/project/axtvngaoogqagwacjeek/functions





