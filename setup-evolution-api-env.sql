-- CONFIGURAÇÃO DAS VARIÁVEIS DE AMBIENTE PARA EVOLUTION API
-- Execute este script no Supabase Dashboard > Settings > Edge Functions > Environment Variables

-- Variáveis necessárias para a Evolution API:
/*
EVOLUTION_API_URL=https://api.urbanautobot.com
EVOLUTION_API_KEY=cfd9b746ea9e400dc8f4d3e8d57b0180
*/

-- Instruções para configurar:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para Settings > Edge Functions
-- 3. Na seção "Environment Variables", adicione:
--    - EVOLUTION_API_URL = https://api.urbanautobot.com
--    - EVOLUTION_API_KEY = cfd9b746ea9e400dc8f4d3e8d57b0180
-- 4. Salve as configurações
-- 5. Redeploy das Edge Functions

-- Verificar se as variáveis estão configuradas (executar na Edge Function):
SELECT 
  'EVOLUTION_API_URL' as variable_name,
  CASE 
    WHEN current_setting('EVOLUTION_API_URL', true) IS NOT NULL 
    THEN 'Configured' 
    ELSE 'Not configured' 
  END as status,
  current_setting('EVOLUTION_API_URL', true) as value
UNION ALL
SELECT 
  'EVOLUTION_API_KEY' as variable_name,
  CASE 
    WHEN current_setting('EVOLUTION_API_KEY', true) IS NOT NULL 
    THEN 'Configured' 
    ELSE 'Not configured' 
  END as status,
  CASE 
    WHEN current_setting('EVOLUTION_API_KEY', true) IS NOT NULL 
    THEN '***' || RIGHT(current_setting('EVOLUTION_API_KEY', true), 4)
    ELSE NULL 
  END as value;


