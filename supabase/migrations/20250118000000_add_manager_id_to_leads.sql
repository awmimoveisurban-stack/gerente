-- ============================================================================
-- MIGRATION: Adicionar coluna manager_id à tabela leads
-- Data: 18 de Janeiro de 2025
-- Objetivo: Corrigir erro "column leads.manager_id does not exist"
-- ============================================================================

-- Verificar se a coluna manager_id existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna manager_id existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'manager_id'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna manager_id
        ALTER TABLE public.leads 
        ADD COLUMN manager_id UUID;
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.manager_id IS 'ID do gerente responsável pelo lead';
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_leads_manager_id ON public.leads(manager_id);
        
        RAISE NOTICE '✅ Coluna manager_id adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna manager_id já existe na tabela leads';
    END IF;
END $$;

-- Verificar se a coluna atribuido_a existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna atribuido_a existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'atribuido_a'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna atribuido_a
        ALTER TABLE public.leads 
        ADD COLUMN atribuido_a UUID;
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.atribuido_a IS 'ID do usuário (corretor/gerente) atribuído ao lead';
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_leads_atribuido_a ON public.leads(atribuido_a);
        
        RAISE NOTICE '✅ Coluna atribuido_a adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna atribuido_a já existe na tabela leads';
    END IF;
END $$;

-- Verificar se a coluna score_ia existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna score_ia existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'score_ia'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna score_ia
        ALTER TABLE public.leads 
        ADD COLUMN score_ia INTEGER DEFAULT 0;
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.score_ia IS 'Score de qualidade do lead calculado pela IA (0-100)';
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_leads_score_ia ON public.leads(score_ia DESC);
        
        RAISE NOTICE '✅ Coluna score_ia adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna score_ia já existe na tabela leads';
    END IF;
END $$;

-- Verificar se a coluna prioridade existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna prioridade existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'prioridade'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna prioridade
        ALTER TABLE public.leads 
        ADD COLUMN prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta'));
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.prioridade IS 'Prioridade do lead (baixa, media, alta)';
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_leads_prioridade ON public.leads(prioridade);
        
        RAISE NOTICE '✅ Coluna prioridade adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna prioridade já existe na tabela leads';
    END IF;
END $$;

-- Verificar se a coluna interesse existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna interesse existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'interesse'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna interesse
        ALTER TABLE public.leads 
        ADD COLUMN interesse TEXT;
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.interesse IS 'Tipo de imóvel de interesse do lead';
        
        RAISE NOTICE '✅ Coluna interesse adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna interesse já existe na tabela leads';
    END IF;
END $$;

-- Verificar se a coluna cidade existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna cidade existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'cidade'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna cidade
        ALTER TABLE public.leads 
        ADD COLUMN cidade TEXT;
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.cidade IS 'Cidade de interesse do lead';
        
        RAISE NOTICE '✅ Coluna cidade adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna cidade já existe na tabela leads';
    END IF;
END $$;

-- Verificar se a coluna orcamento existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna orcamento existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'orcamento'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna orcamento
        ALTER TABLE public.leads 
        ADD COLUMN orcamento DECIMAL(15,2);
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.orcamento IS 'Orçamento estimado do lead';
        
        RAISE NOTICE '✅ Coluna orcamento adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna orcamento já existe na tabela leads';
    END IF;
END $$;

-- Verificar se a coluna origem existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna origem existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'origem'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna origem
        ALTER TABLE public.leads 
        ADD COLUMN origem TEXT DEFAULT 'manual';
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.origem IS 'Origem do lead (manual, whatsapp, site, etc)';
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_leads_origem ON public.leads(origem);
        
        RAISE NOTICE '✅ Coluna origem adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna origem já existe na tabela leads';
    END IF;
END $$;

-- Verificar se a coluna mensagem_inicial existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna mensagem_inicial existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'mensagem_inicial'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna mensagem_inicial
        ALTER TABLE public.leads 
        ADD COLUMN mensagem_inicial TEXT;
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.mensagem_inicial IS 'Primeira mensagem recebida do lead';
        
        RAISE NOTICE '✅ Coluna mensagem_inicial adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna mensagem_inicial já existe na tabela leads';
    END IF;
END $$;

-- Verificar se a coluna data_contato existe na tabela leads
DO $$ 
BEGIN
    -- Verificar se a coluna data_contato existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND column_name = 'data_contato'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar a coluna data_contato
        ALTER TABLE public.leads 
        ADD COLUMN data_contato TIMESTAMPTZ;
        
        -- Comentário da coluna
        COMMENT ON COLUMN public.leads.data_contato IS 'Data do primeiro contato com o lead';
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_leads_data_contato ON public.leads(data_contato);
        
        RAISE NOTICE '✅ Coluna data_contato adicionada à tabela leads';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna data_contato já existe na tabela leads';
    END IF;
END $$;

-- Verificação final
DO $$ 
BEGIN
    RAISE NOTICE '✅ Migration executada com sucesso!';
    RAISE NOTICE '📋 Colunas adicionadas à tabela leads:';
    RAISE NOTICE '   - manager_id: UUID (ID do gerente)';
    RAISE NOTICE '   - atribuido_a: UUID (ID do usuário atribuído)';
    RAISE NOTICE '   - score_ia: INTEGER (Score 0-100)';
    RAISE NOTICE '   - prioridade: TEXT (baixa, media, alta)';
    RAISE NOTICE '   - interesse: TEXT (tipo de imóvel)';
    RAISE NOTICE '   - cidade: TEXT (cidade de interesse)';
    RAISE NOTICE '   - orcamento: DECIMAL (orçamento estimado)';
    RAISE NOTICE '   - origem: TEXT (origem do lead)';
    RAISE NOTICE '   - mensagem_inicial: TEXT (primeira mensagem)';
    RAISE NOTICE '   - data_contato: TIMESTAMPTZ (data do contato)';
END $$;
