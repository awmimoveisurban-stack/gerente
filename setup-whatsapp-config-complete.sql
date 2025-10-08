-- CONFIGURAÇÃO COMPLETA WHATSAPP_CONFIG

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS whatsapp_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id UUID NOT NULL REFERENCES auth.users(id),
    instance_name TEXT NOT NULL,
    instance_id TEXT,
    qrcode TEXT,
    status TEXT DEFAULT 'desconectado' CHECK (status IN ('pendente', 'aguardando_qr', 'conectado', 'desconectado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar constraint única se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'whatsapp_config' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%instance_name%'
    ) THEN
        ALTER TABLE whatsapp_config 
        ADD CONSTRAINT whatsapp_config_instance_name_unique 
        UNIQUE (instance_name);
    END IF;
END $$;

-- 3. Habilitar RLS
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
DROP POLICY IF EXISTS "Gerentes can manage whatsapp config" ON whatsapp_config;
CREATE POLICY "Gerentes can manage whatsapp config" ON whatsapp_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'gerente'
        )
    );

-- 5. Inserir configuração padrão
INSERT INTO whatsapp_config (
    manager_id,
    instance_name,
    instance_id,
    qrcode,
    status
) VALUES (
    'cec3f29d-3904-43b1-a0d5-bc99124751bc', -- ID do gerente
    'empresa-whatsapp',
    NULL,
    NULL,
    'desconectado'
) ON CONFLICT (instance_name) DO UPDATE SET
    manager_id = EXCLUDED.manager_id,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 6. Verificar resultado
SELECT 
    id,
    manager_id,
    instance_name,
    status,
    created_at,
    updated_at
FROM whatsapp_config 
WHERE instance_name = 'empresa-whatsapp';

