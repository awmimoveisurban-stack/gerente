-- ============================================================================
-- MIGRATION: Adicionar coluna manager_id à tabela whatsapp_config
-- Data: 17 de Outubro de 2025
-- Objetivo: Corrigir erro "column whatsapp_config.manager_id does not exist"
-- ============================================================================

-- Verificar se a coluna manager_id existe, se não existir, adicionar
DO $$ 
BEGIN
    -- Verificar se a coluna manager_id existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'whatsapp_config' 
        AND column_name = 'manager_id'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna manager_id
        ALTER TABLE public.whatsapp_config 
        ADD COLUMN manager_id UUID;
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.whatsapp_config.manager_id IS 'ID do gerente responsável pela configuração WhatsApp';
        
        RAISE NOTICE '✅ Coluna manager_id adicionada à tabela whatsapp_config';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna manager_id já existe na tabela whatsapp_config';
    END IF;
END $$;

-- Verificar se a constraint unique_manager_instance existe
DO $$ 
BEGIN
    -- Verificar se a constraint existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_manager_instance'
        AND table_name = 'whatsapp_config'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a constraint se não existir
        ALTER TABLE public.whatsapp_config 
        ADD CONSTRAINT unique_manager_instance UNIQUE (manager_id, instance_name);
        
        RAISE NOTICE '✅ Constraint unique_manager_instance adicionada';
    ELSE
        RAISE NOTICE 'ℹ️ Constraint unique_manager_instance já existe';
    END IF;
END $$;

-- Verificar se o índice idx_whatsapp_config_one_active_per_manager existe
DO $$ 
BEGIN
    -- Verificar se o índice existe
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_whatsapp_config_one_active_per_manager'
        AND tablename = 'whatsapp_config'
        AND schemaname = 'public'
    ) THEN
        -- Adicionar o índice se não existir
        CREATE UNIQUE INDEX idx_whatsapp_config_one_active_per_manager
        ON public.whatsapp_config(manager_id, provider)
        WHERE status = 'authorized' AND deleted_at IS NULL;
        
        RAISE NOTICE '✅ Índice idx_whatsapp_config_one_active_per_manager adicionado';
    ELSE
        RAISE NOTICE 'ℹ️ Índice idx_whatsapp_config_one_active_per_manager já existe';
    END IF;
END $$;

-- Verificação final
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration executada com sucesso!';
    RAISE NOTICE '📋 Estrutura da tabela whatsapp_config:';
    RAISE NOTICE '   - manager_id: UUID';
    RAISE NOTICE '   - evolution_instance_name: TEXT';
    RAISE NOTICE '   - evolution_instance_token: TEXT';
    RAISE NOTICE '   - qr_code: TEXT';
    RAISE NOTICE '   - status: TEXT';
    RAISE NOTICE '   - auto_created: BOOLEAN';
    RAISE NOTICE '   - deleted_at: TIMESTAMPTZ';
END $$;
