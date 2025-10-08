-- 🔧 SCRIPT SQL PARA CORRIGIR REALTIME NO KANBAN
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR ESTRUTURA DA TABELA LEADS
-- =====================================================================================

-- Verificar se a tabela leads existe e tem RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

-- Verificar políticas RLS da tabela leads
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'leads' AND schemaname = 'public';

-- =====================================================================================
-- 2. HABILITAR RLS NA TABELA LEADS (SE NÃO ESTIVER)
-- =====================================================================================

-- Habilitar RLS na tabela leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =====================================================================================
-- 3. RECRIAR POLÍTICAS RLS PARA LEADS
-- =====================================================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

-- Criar políticas RLS
CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================================
-- 4. VERIFICAR SE REALTIME ESTÁ HABILITADO
-- =====================================================================================

-- Habilitar realtime na tabela leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- =====================================================================================
-- 5. VERIFICAR DADOS DE EXEMPLO
-- =====================================================================================

-- Verificar se há leads para testar
SELECT 
    l.id,
    l.nome,
    l.status,
    l.user_id,
    u.email as user_email
FROM leads l
JOIN auth.users u ON l.user_id = u.id
ORDER BY l.created_at DESC
LIMIT 5;

-- =====================================================================================
-- 6. TESTAR ATUALIZAÇÃO DE STATUS
-- =====================================================================================

-- Criar função para testar atualização de status
DO $$
DECLARE
    test_lead_id uuid;
    gerente_user_id uuid;
BEGIN
    -- Buscar ID do usuário gerente
    SELECT id INTO gerente_user_id FROM auth.users WHERE email = 'gerente@imobiliaria.com' LIMIT 1;
    
    -- Buscar um lead para testar
    SELECT id INTO test_lead_id FROM leads WHERE user_id = gerente_user_id LIMIT 1;
    
    IF test_lead_id IS NOT NULL THEN
        -- Atualizar status do lead para testar realtime
        UPDATE leads 
        SET 
            status = CASE 
                WHEN status = 'novo' THEN 'contatado'
                WHEN status = 'contatado' THEN 'interessado'
                ELSE 'novo'
            END,
            updated_at = now()
        WHERE id = test_lead_id;
        
        RAISE NOTICE '✅ Status do lead atualizado para testar realtime';
        RAISE NOTICE 'Lead ID: %', test_lead_id;
    ELSE
        RAISE NOTICE '❌ Nenhum lead encontrado para testar';
    END IF;
END $$;

-- =====================================================================================
-- 7. VERIFICAÇÃO FINAL
-- =====================================================================================

-- Verificar políticas RLS criadas
SELECT 
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN cmd = 'r' THEN 'SELECT'
        WHEN cmd = 'a' THEN 'INSERT'
        WHEN cmd = 'w' THEN 'UPDATE'
        WHEN cmd = 'd' THEN 'DELETE'
        ELSE cmd::text
    END as operation,
    CASE 
        WHEN policyname LIKE '%view%' THEN '✅ Visualização'
        WHEN policyname LIKE '%insert%' THEN '✅ Inserção'
        WHEN policyname LIKE '%update%' THEN '✅ Atualização'
        WHEN policyname LIKE '%delete%' THEN '✅ Exclusão'
        ELSE '❓ Outro'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'leads' AND schemaname = 'public'
ORDER BY policyname;

-- Verificar se realtime está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

SELECT '🎉 REALTIME DO KANBAN CONFIGURADO COM SUCESSO!' as resultado;





