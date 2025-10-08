# Como fazer deploy da Edge Function

## Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard
2. Vá para "Edge Functions"
3. Clique em "Create a new function"
4. Nome: `whatsapp-connect`
5. Copie o conteúdo do arquivo `supabase/functions/whatsapp-connect/index.ts`
6. Cole no editor e faça deploy

## Opção 2: Via CLI (se tiver acesso)

```bash
# Fazer login
npx supabase login

# Fazer deploy
npx supabase functions deploy whatsapp-connect
```

## Opção 3: Via GitHub Actions

Se o projeto estiver conectado ao GitHub, pode usar o workflow automático do Supabase.

## Variáveis de Ambiente Necessárias

Certifique-se de que estas variáveis estão configuradas no Supabase:

- `SERVER_URL`: URL da Evolution API (ex: https://api.evolution-api.com)
- `AUTHENTICATION_API_KEY`: Chave da API da Evolution API

## Teste após Deploy

Use o botão "🧪 Test Edge Function" na interface para verificar se está funcionando.





