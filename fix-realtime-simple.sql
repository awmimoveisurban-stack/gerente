-- 🔧 SCRIPT SQL SIMPLES PARA HABILITAR REALTIME
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR SE A TABELA LEADS TEM RLS HABILITADO
-- =====================================================================================

SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END as status
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

-- =====================================================================================
-- 2. HABILITAR RLS SE NÃO ESTIVER HABILITADO
-- =====================================================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =====================================================================================
-- 3. VERIFICAR SE REALTIME ESTÁ HABILITADO
-- =====================================================================================

-- Habilitar realtime na tabela leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- =====================================================================================
-- 4. VERIFICAR POLÍTICAS RLS
-- =====================================================================================

-- Verificar se as políticas existem
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'r' THEN 'SELECT'
        WHEN cmd = 'a' THEN 'INSERT'
        WHEN cmd = 'w' THEN 'UPDATE'
        WHEN cmd = 'd' THEN 'DELETE'
        ELSE cmd::text
    END as operation
FROM pg_policies 
WHERE tablename = 'leads' AND schemaname = 'public';

-- =====================================================================================
-- 5. RECRIAR POLÍTICAS SE NECESSÁRIO
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
-- 6. VERIFICAÇÃO FINAL
-- =====================================================================================

-- Verificar se tudo está configurado corretamente
SELECT 
    'leads' as tabela,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Desabilitado'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

-- Verificar políticas criadas
SELECT 
    policyname,
    CASE 
        WHEN policyname LIKE '%view%' THEN '✅ SELECT'
        WHEN policyname LIKE '%insert%' THEN '✅ INSERT'
        WHEN policyname LIKE '%update%' THEN '✅ UPDATE'
        WHEN policyname LIKE '%delete%' THEN '✅ DELETE'
        ELSE '❓ Outro'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'leads' AND schemaname = 'public'
ORDER BY policyname;

SELECT '🎉 REALTIME CONFIGURADO COM SUCESSO!' as resultado;
