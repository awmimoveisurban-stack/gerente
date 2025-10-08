-- 🚀 CORREÇÃO MÍNIMA DO REALTIME
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. HABILITAR RLS
-- =====================================================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =====================================================================================
-- 2. CRIAR POLÍTICAS RLS
-- =====================================================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

-- Criar políticas
CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================================
-- 3. HABILITAR REALTIME
-- =====================================================================================

-- Adicionar tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- =====================================================================================
-- 4. VERIFICAR RESULTADO
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
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ Políticas completas'
        ELSE '❌ Políticas faltando'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'leads' AND schemaname = 'public';

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
-- 5. CRIAR DADOS DE TESTE
-- =====================================================================================

-- Inserir dados de teste
INSERT INTO public.leads (user_id, nome, telefone, email, imovel_interesse, valor_interesse, status, observacoes) VALUES
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'João Silva', '(11) 99999-9999', 'joao@email.com', 'Apartamento 3 quartos', 350000, 'novo', 'Interessado em apartamento no centro'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Maria Santos', '(11) 88888-8888', 'maria@email.com', 'Casa 4 quartos', 450000, 'contatado', 'Já conversou sobre financiamento'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Pedro Costa', '(11) 77777-7777', 'pedro@email.com', 'Apartamento 2 quartos', 280000, 'interessado', 'Muito interessado, quer agendar visita'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Ana Oliveira', '(11) 66666-6666', 'ana@email.com', 'Casa 3 quartos', 380000, 'visita_agendada', 'Visita agendada para próxima semana'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Carlos Ferreira', '(11) 55555-5555', 'carlos@email.com', 'Apartamento 4 quartos', 520000, 'proposta', 'Proposta enviada, aguardando resposta'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Lucia Rodrigues', '(11) 44444-4444', 'lucia@email.com', 'Casa 5 quartos', 650000, 'fechado', 'Venda finalizada com sucesso!'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Roberto Alves', '(11) 33333-3333', 'roberto@email.com', 'Apartamento 1 quarto', 180000, 'perdido', 'Desistiu da compra')
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- 6. TESTE FINAL
-- =====================================================================================

SELECT 
    'leads' as tabela,
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

SELECT '🎉 REALTIME CONFIGURADO COM SUCESSO!' as resultado;





