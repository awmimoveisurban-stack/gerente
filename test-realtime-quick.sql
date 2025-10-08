-- 🚀 TESTE RÁPIDO DE REALTIME
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR SE TABELA LEADS EXISTE
-- =====================================================================================

SELECT 
    'leads' as tabela,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'leads' AND table_schema = 'public'
        ) THEN '✅ Tabela existe'
        ELSE '❌ Tabela não existe'
    END as status;

-- =====================================================================================
-- 2. VERIFICAR RLS
-- =====================================================================================

SELECT 
    'leads' as tabela,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS habilitado'
        ELSE '❌ RLS desabilitado'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

-- =====================================================================================
-- 3. VERIFICAR REALTIME
-- =====================================================================================

SELECT 
    'leads' as tabela,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND tablename = 'leads' 
            AND schemaname = 'public'
        ) THEN '✅ Realtime habilitado'
        ELSE '❌ Realtime desabilitado'
    END as realtime_status;

-- =====================================================================================
-- 4. VERIFICAR POLÍTICAS
-- =====================================================================================

SELECT 
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ Políticas completas'
        WHEN COUNT(*) > 0 THEN '⚠️ Políticas parciais'
        ELSE '❌ Sem políticas'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'leads' AND schemaname = 'public';

-- =====================================================================================
-- 5. VERIFICAR DADOS
-- =====================================================================================

SELECT 
    COUNT(*) as total_leads,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '❌ Sem dados'
    END as data_status
FROM leads;

-- =====================================================================================
-- 6. TESTE FINAL
-- =====================================================================================

-- Tentar fazer uma consulta simples
SELECT 
    'leads' as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM leads LIMIT 1) THEN '✅ Consulta funcionando'
        ELSE '❌ Erro na consulta'
    END as test_status;

SELECT '🎉 TESTE CONCLUÍDO!' as resultado;





