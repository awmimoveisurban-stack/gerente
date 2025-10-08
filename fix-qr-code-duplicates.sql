-- Script para corrigir QR Codes com prefixos duplicados no banco de dados
-- Execute este script no Supabase SQL Editor

UPDATE whatsapp_config 
SET qrcode = 'data:image/png;base64,' || REPLACE(qrcode, 'data:image/png;base64,', '')
WHERE qrcode LIKE 'data:image/png;base64,data:image/png;base64,%';

-- Verificar se a correção funcionou
SELECT 
  id,
  instance_name,
  CASE 
    WHEN qrcode LIKE 'data:image/png;base64,data:image/png;base64,%' THEN 'Ainda tem duplicatas'
    WHEN qrcode LIKE 'data:image/png;base64,%' THEN 'Formato correto'
    ELSE 'Formato desconhecido'
  END as qr_format_status,
  LENGTH(qrcode) as qr_length
FROM whatsapp_config 
WHERE qrcode IS NOT NULL;





