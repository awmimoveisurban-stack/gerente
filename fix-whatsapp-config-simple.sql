-- CORREÇÃO SIMPLES - TABELA WHATSAPP_CONFIG

-- 1. Adicionar constraint única em instance_name
ALTER TABLE whatsapp_config 
ADD CONSTRAINT whatsapp_config_instance_name_unique 
UNIQUE (instance_name);

-- 2. Inserir configuração WhatsApp
INSERT INTO whatsapp_config (
    manager_id,
    instance_name,
    instance_id,
    qrcode,
    status,
    created_at,
    updated_at
) VALUES (
    'cec3f29d-3904-43b1-a0d5-bc99124751bc', -- ID do gerente
    'empresa-whatsapp',
    NULL,
    NULL,
    'desconectado',
    NOW(),
    NOW()
) ON CONFLICT (instance_name) DO UPDATE SET
    manager_id = EXCLUDED.manager_id,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 3. Verificar se funcionou
SELECT * FROM whatsapp_config WHERE instance_name = 'empresa-whatsapp';

