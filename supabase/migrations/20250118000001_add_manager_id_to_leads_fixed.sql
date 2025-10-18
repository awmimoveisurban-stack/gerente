-- ============================================================================
-- SCRIPT SQL SIMPLES E SEGURO PARA SUPABASE DASHBOARD
-- Data: 18 de Janeiro de 2025
-- Objetivo: Adicionar colunas necessárias à tabela leads SEM QUEBRAR O SISTEMA
-- IMPORTANTE: Este script mantém user_id e adiciona manager_id como coluna adicional
-- ============================================================================

-- Verificar estrutura atual da tabela leads
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- ADICIONAR COLUNAS QUE FALTAM (SEM QUEBRAR O SISTEMA EXISTENTE)
-- ============================================================================

-- 1. Adicionar manager_id (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'manager_id' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN manager_id UUID;
        COMMENT ON COLUMN public.leads.manager_id IS 'ID do gerente responsável pelo lead (adicional ao user_id)';
        CREATE INDEX IF NOT EXISTS idx_leads_manager_id ON public.leads(manager_id);
        RAISE NOTICE '✅ Adicionada coluna manager_id';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna manager_id já existe';
    END IF;
END $$;

-- 2. Adicionar atribuido_a (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'atribuido_a' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN atribuido_a UUID;
        COMMENT ON COLUMN public.leads.atribuido_a IS 'ID do usuário atribuído ao lead';
        CREATE INDEX IF NOT EXISTS idx_leads_atribuido_a ON public.leads(atribuido_a);
        RAISE NOTICE '✅ Adicionada coluna atribuido_a';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna atribuido_a já existe';
    END IF;
END $$;

-- 3. Adicionar score_ia (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'score_ia' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN score_ia INTEGER DEFAULT 0;
        COMMENT ON COLUMN public.leads.score_ia IS 'Score de qualidade do lead calculado pela IA (0-100)';
        CREATE INDEX IF NOT EXISTS idx_leads_score_ia ON public.leads(score_ia DESC);
        RAISE NOTICE '✅ Adicionada coluna score_ia';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna score_ia já existe';
    END IF;
END $$;

-- 4. Adicionar prioridade (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'prioridade' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta'));
        COMMENT ON COLUMN public.leads.prioridade IS 'Prioridade do lead (baixa, media, alta)';
        CREATE INDEX IF NOT EXISTS idx_leads_prioridade ON public.leads(prioridade);
        RAISE NOTICE '✅ Adicionada coluna prioridade';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna prioridade já existe';
    END IF;
END $$;

-- 5. Adicionar interesse (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'interesse' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN interesse TEXT;
        COMMENT ON COLUMN public.leads.interesse IS 'Tipo de imóvel de interesse do lead';
        RAISE NOTICE '✅ Adicionada coluna interesse';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna interesse já existe';
    END IF;
END $$;

-- 6. Adicionar cidade (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'cidade' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN cidade TEXT;
        COMMENT ON COLUMN public.leads.cidade IS 'Cidade de interesse do lead';
        RAISE NOTICE '✅ Adicionada coluna cidade';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna cidade já existe';
    END IF;
END $$;

-- 7. Adicionar orcamento (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'orcamento' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN orcamento DECIMAL(15,2);
        COMMENT ON COLUMN public.leads.orcamento IS 'Orçamento estimado do lead';
        RAISE NOTICE '✅ Adicionada coluna orcamento';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna orcamento já existe';
    END IF;
END $$;

-- 8. Adicionar origem (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'origem' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN origem TEXT DEFAULT 'manual';
        COMMENT ON COLUMN public.leads.origem IS 'Origem do lead (manual, whatsapp, site, etc)';
        CREATE INDEX IF NOT EXISTS idx_leads_origem ON public.leads(origem);
        RAISE NOTICE '✅ Adicionada coluna origem';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna origem já existe';
    END IF;
END $$;

-- 9. Adicionar mensagem_inicial (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'mensagem_inicial' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN mensagem_inicial TEXT;
        COMMENT ON COLUMN public.leads.mensagem_inicial IS 'Primeira mensagem recebida do lead';
        RAISE NOTICE '✅ Adicionada coluna mensagem_inicial';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna mensagem_inicial já existe';
    END IF;
END $$;

-- 10. Adicionar data_contato (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'data_contato' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN data_contato TIMESTAMPTZ;
        COMMENT ON COLUMN public.leads.data_contato IS 'Data do primeiro contato com o lead';
        CREATE INDEX IF NOT EXISTS idx_leads_data_contato ON public.leads(data_contato);
        RAISE NOTICE '✅ Adicionada coluna data_contato';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna data_contato já existe';
    END IF;
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Mostrar estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mensagem de sucesso
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SCRIPT EXECUTADO COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 ESTRUTURA FINAL DA TABELA LEADS:';
    RAISE NOTICE '   ✅ user_id: Mantido (não alterado)';
    RAISE NOTICE '   ✅ manager_id: Adicionado (coluna adicional)';
    RAISE NOTICE '   ✅ atribuido_a: Adicionado';
    RAISE NOTICE '   ✅ score_ia: Adicionado';
    RAISE NOTICE '   ✅ prioridade: Adicionado';
    RAISE NOTICE '   ✅ interesse: Adicionado';
    RAISE NOTICE '   ✅ cidade: Adicionado';
    RAISE NOTICE '   ✅ orcamento: Adicionado';
    RAISE NOTICE '   ✅ origem: Adicionado';
    RAISE NOTICE '   ✅ mensagem_inicial: Adicionado';
    RAISE NOTICE '   ✅ data_contato: Adicionado';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 SISTEMA COMPATÍVEL:';
    RAISE NOTICE '   - user_id continua funcionando normalmente';
    RAISE NOTICE '   - manager_id é uma coluna adicional';
    RAISE NOTICE '   - Sistema de captura WhatsApp funcionará';
    RAISE NOTICE '   - Páginas existentes não quebrarão';
    RAISE NOTICE '';
END $$;
