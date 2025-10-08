-- 🔧 CORREÇÃO SEGURA DO REALTIME
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR STATUS ATUAL
-- =====================================================================================

-- Verificar se a tabela leads existe
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
-- 2. HABILITAR RLS
-- =====================================================================================

-- Habilitar RLS na tabela leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =====================================================================================
-- 3. CRIAR POLÍTICAS RLS
-- =====================================================================================

-- Remover políticas existentes se houver
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
-- 4. CONFIGURAR REALTIME
-- =====================================================================================

-- Verificar se realtime está habilitado
SELECT 
    'leads' as tabela,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND tablename = 'leads' 
            AND schemaname = 'public'
        ) THEN '✅ Realtime já habilitado'
        ELSE '❌ Realtime não habilitado'
    END as status_realtime;

-- Habilitar realtime para a tabela leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- =====================================================================================
-- 5. VERIFICAR CONFIGURAÇÃO
-- =====================================================================================

-- Verificar RLS
SELECT 
    'leads' as tabela,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS habilitado'
        ELSE '❌ RLS desabilitado'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

-- Verificar políticas
SELECT 
    policyname,
    cmd as operacao,
    '✅ Política criada' as status
FROM pg_policies 
WHERE tablename = 'leads' AND schemaname = 'public'
ORDER BY policyname;

-- Verificar realtime
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
-- 6. CRIAR DADOS DE TESTE (SE NECESSÁRIO)
-- =====================================================================================

-- Verificar se há dados
SELECT 
    COUNT(*) as total_leads,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '❌ Sem dados - criando dados de teste'
    END as status_dados
FROM public.leads;

-- Criar dados de teste se não existirem
DO $$
DECLARE
    gerente_user_id uuid := 'cec3f29d-3904-43b1-a0d5-bc99124751bc';
    lead_count integer;
BEGIN
    SELECT COUNT(*) INTO lead_count FROM public.leads WHERE user_id = gerente_user_id;
    
    IF lead_count = 0 THEN
        INSERT INTO public.leads (user_id, nome, telefone, email, imovel_interesse, valor_interesse, status, observacoes) VALUES
        (gerente_user_id, 'João Silva', '(11) 99999-9999', 'joao@email.com', 'Apartamento 3 quartos', 350000, 'novo', 'Interessado em apartamento no centro'),
        (gerente_user_id, 'Maria Santos', '(11) 88888-8888', 'maria@email.com', 'Casa 4 quartos', 450000, 'contatado', 'Já conversou sobre financiamento'),
        (gerente_user_id, 'Pedro Costa', '(11) 77777-7777', 'pedro@email.com', 'Apartamento 2 quartos', 280000, 'interessado', 'Muito interessado, quer agendar visita'),
        (gerente_user_id, 'Ana Oliveira', '(11) 66666-6666', 'ana@email.com', 'Casa 3 quartos', 380000, 'visita_agendada', 'Visita agendada para próxima semana'),
        (gerente_user_id, 'Carlos Ferreira', '(11) 55555-5555', 'carlos@email.com', 'Apartamento 4 quartos', 520000, 'proposta', 'Proposta enviada, aguardando resposta'),
        (gerente_user_id, 'Lucia Rodrigues', '(11) 44444-4444', 'lucia@email.com', 'Casa 5 quartos', 650000, 'fechado', 'Venda finalizada com sucesso!'),
        (gerente_user_id, 'Roberto Alves', '(11) 33333-3333', 'roberto@email.com', 'Apartamento 1 quarto', 180000, 'perdido', 'Desistiu da compra');
        
        RAISE NOTICE '✅ Dados de teste criados com sucesso!';
    ELSE
        RAISE NOTICE '✅ Dados já existem (% leads encontrados)', lead_count;
    END IF;
END $$;

-- =====================================================================================
-- 7. TESTE FINAL
-- =====================================================================================

-- Verificar se tudo está funcionando
SELECT 
    'TESTE FINAL' as categoria,
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
            SELECT 1 FROM public.leads LIMIT 1
        ) THEN '✅ DADOS OK'
        ELSE '❌ DADOS FALTANDO'
    END as dados;

SELECT '🎉 CONFIGURAÇÃO DO REALTIME CONCLUÍDA COM SUCESSO!' as resultado;