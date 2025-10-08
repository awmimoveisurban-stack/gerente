-- CORRIGIR TABELA WHATSAPP_CONFIG - CONSTRAINT ÚNICA

-- 1. Verificar estrutura atual da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'whatsapp_config' 
ORDER BY ordinal_position;

-- 2. Verificar constraints existentes
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'whatsapp_config';

-- 3. Adicionar constraint única se não existir
DO $$
BEGIN
    -- Verificar se já existe constraint única em instance_name
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'whatsapp_config' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%instance_name%'
    ) THEN
        -- Adicionar constraint única
        ALTER TABLE whatsapp_config 
        ADD CONSTRAINT whatsapp_config_instance_name_unique 
        UNIQUE (instance_name);
        
        RAISE NOTICE 'Constraint única adicionada em instance_name';
    ELSE
        RAISE NOTICE 'Constraint única já existe em instance_name';
    END IF;
END $$;

-- 4. Verificar se a constraint foi criada
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'whatsapp_config'
AND tc.constraint_type = 'UNIQUE';

-- 5. Inserir dados de teste com ON CONFLICT
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

-- 6. Verificar dados inseridos
SELECT * FROM whatsapp_config WHERE instance_name = 'empresa-whatsapp';