-- 🔍 SCRIPT SIMPLES PARA VERIFICAR STATUS DO REALTIME
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR RLS DA TABELA LEADS
-- =====================================================================================

SELECT 
    'leads' as tabela,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

-- =====================================================================================
-- 2. VERIFICAR REALTIME DA TABELA LEADS
-- =====================================================================================

SELECT 
    'leads' as tabela,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Realtime Habilitado'
        ELSE '❌ Realtime Desabilitado'
    END as realtime_status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'leads' 
AND schemaname = 'public';

-- =====================================================================================
-- 3. VERIFICAR POLÍTICAS RLS
-- =====================================================================================

SELECT 
    policyname,
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

-- =====================================================================================
-- 4. VERIFICAR DADOS DE EXEMPLO
-- =====================================================================================

-- Contar leads por usuário
SELECT 
    u.email,
    COUNT(l.id) as total_leads,
    CASE 
        WHEN COUNT(l.id) > 0 THEN '✅ Tem dados'
        ELSE '❌ Sem dados'
    END as status
FROM auth.users u
LEFT JOIN leads l ON u.id = l.user_id
WHERE u.email IN ('gerente@imobiliaria.com', 'corretor@imobiliaria.com')
GROUP BY u.id, u.email
ORDER BY u.email;

-- =====================================================================================
-- 5. TESTE DE CONSULTA
-- =====================================================================================

-- Testar se conseguimos consultar os dados
SELECT 
    COUNT(*) as total_leads,
    COUNT(DISTINCT user_id) as usuarios_com_leads,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Dados acessíveis'
        ELSE '❌ Nenhum dado encontrado'
    END as status
FROM leads;

-- =====================================================================================
-- 6. RESUMO FINAL
-- =====================================================================================

-- Status geral simplificado
SELECT 
    '📊 RESUMO GERAL' as categoria,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'leads' AND schemaname = 'public' AND rowsecurity = true
        ) THEN '✅ RLS OK'
        ELSE '❌ RLS FALTANDO'
    END as rls,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'leads' AND schemaname = 'public'
        ) THEN '✅ REALTIME OK'
        ELSE '❌ REALTIME FALTANDO'
    END as realtime,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'leads' AND schemaname = 'public'
        ) THEN '✅ POLÍTICAS OK'
        ELSE '❌ POLÍTICAS FALTANDO'
    END as policies,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM leads LIMIT 1
        ) THEN '✅ DADOS OK'
        ELSE '❌ DADOS FALTANDO'
    END as dados;

SELECT '🎯 VERIFICAÇÃO CONCLUÍDA!' as resultado;





