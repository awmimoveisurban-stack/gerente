-- Verificar configuração atual do WhatsApp
SELECT 
  id,
  manager_id,
  instance_name,
  instance_id,
  status,
  qrcode IS NOT NULL as has_qrcode,
  created_at,
  updated_at
FROM whatsapp_config 
WHERE instance_name = 'empresa-whatsapp';

-- Se quiser limpar a configuração (descomente as linhas abaixo):
-- UPDATE whatsapp_config 
-- SET 
--   status = 'pendente',
--   qrcode = NULL,
--   updated_at = NOW()
-- WHERE instance_name = 'empresa-whatsapp';





