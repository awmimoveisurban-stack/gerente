-- 🔧 SCRIPT SQL COMPLETO PARA CORRIGIR TODAS AS TABELAS FALTANDO
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- =====================================================================================

-- Verificar quais tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('visits', 'tasks', 'interactions', 'follow_ups') 
        THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('visits', 'tasks', 'interactions', 'follow_ups')
ORDER BY table_name;

-- =====================================================================================
-- 2. CRIAR TABELA VISITS
-- =====================================================================================

-- Remover tabela visits se existir
DROP TABLE IF EXISTS public.visits CASCADE;

-- Criar tabela visits
CREATE TABLE public.visits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    property_id text,
    data_visita timestamp with time zone NOT NULL,
    endereco text NOT NULL,
    observacoes text,
    status text DEFAULT 'agendada' NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own visits" ON visits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visits" ON visits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visits" ON visits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visits" ON visits
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================================
-- 3. CRIAR TABELA TASKS
-- =====================================================================================

-- Remover tabela tasks se existir
DROP TABLE IF EXISTS public.tasks CASCADE;

-- Criar tabela tasks
CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
    titulo text NOT NULL,
    descricao text,
    status text DEFAULT 'pendente' NOT NULL,
    data_vencimento timestamp with time zone,
    prioridade text DEFAULT 'media' NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================================
-- 4. CRIAR TABELA INTERACTIONS
-- =====================================================================================

-- Remover tabela interactions se existir
DROP TABLE IF EXISTS public.interactions CASCADE;

-- Criar tabela interactions
CREATE TABLE public.interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    tipo text NOT NULL, -- 'call', 'email', 'whatsapp', 'visit', 'meeting'
    descricao text,
    data_interacao timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    resultado text,
    proxima_acao text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own interactions" ON interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON interactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions" ON interactions
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================================
-- 5. CRIAR TABELA FOLLOW_UPS
-- =====================================================================================

-- Remover tabela follow_ups se existir
DROP TABLE IF EXISTS public.follow_ups CASCADE;

-- Criar tabela follow_ups
CREATE TABLE public.follow_ups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    tipo text NOT NULL, -- 'call', 'email', 'whatsapp', 'visit'
    data_agendada timestamp with time zone NOT NULL,
    observacoes text,
    prioridade text DEFAULT 'media' NOT NULL,
    status text DEFAULT 'agendado' NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own follow_ups" ON follow_ups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own follow_ups" ON follow_ups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own follow_ups" ON follow_ups
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own follow_ups" ON follow_ups
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================================
-- 6. INSERIR DADOS DE EXEMPLO
-- =====================================================================================

-- Inserir dados de exemplo se os usuários existirem
DO $$
DECLARE
    gerente_user_id uuid;
    corretor_user_id uuid;
    sample_lead_id uuid;
BEGIN
    -- Buscar IDs dos usuários existentes
    SELECT id INTO gerente_user_id FROM auth.users WHERE email = 'gerente@imobiliaria.com' LIMIT 1;
    SELECT id INTO corretor_user_id FROM auth.users WHERE email = 'corretor@imobiliaria.com' LIMIT 1;
    
    -- Buscar um lead de exemplo
    SELECT id INTO sample_lead_id FROM leads LIMIT 1;

    -- Inserir visitas de exemplo
    IF gerente_user_id IS NOT NULL AND sample_lead_id IS NOT NULL THEN
        INSERT INTO visits (user_id, lead_id, data_visita, endereco, observacoes, status) VALUES
        (gerente_user_id, sample_lead_id, now() + interval '2 days', 'Rua das Flores, 123 - Centro', 'Visita agendada para mostrar o apartamento', 'agendada'),
        (gerente_user_id, sample_lead_id, now() + interval '5 days', 'Av. Principal, 456 - Bairro Novo', 'Segunda visita para fechar negócio', 'agendada');
        
        RAISE NOTICE '✅ Visitas de exemplo inseridas';
    END IF;

    -- Inserir tarefas de exemplo
    IF gerente_user_id IS NOT NULL AND sample_lead_id IS NOT NULL THEN
        INSERT INTO tasks (user_id, lead_id, titulo, descricao, status, data_vencimento, prioridade) VALUES
        (gerente_user_id, sample_lead_id, 'Enviar proposta', 'Preparar e enviar proposta comercial', 'pendente', now() + interval '1 day', 'alta'),
        (gerente_user_id, sample_lead_id, 'Follow-up telefônico', 'Ligar para cliente após envio da proposta', 'pendente', now() + interval '3 days', 'media'),
        (gerente_user_id, null, 'Reunião semanal', 'Reunião de equipe para acompanhamento', 'pendente', now() + interval '7 days', 'baixa');
        
        RAISE NOTICE '✅ Tarefas de exemplo inseridas';
    END IF;

    -- Inserir interações de exemplo
    IF gerente_user_id IS NOT NULL AND sample_lead_id IS NOT NULL THEN
        INSERT INTO interactions (user_id, lead_id, tipo, descricao, resultado, proxima_acao) VALUES
        (gerente_user_id, sample_lead_id, 'call', 'Primeira ligação para apresentar imóveis', 'Cliente interessado', 'Agendar visita'),
        (gerente_user_id, sample_lead_id, 'email', 'Envio de catálogo de imóveis', 'Cliente visualizou', 'Ligar para confirmar interesse'),
        (gerente_user_id, sample_lead_id, 'whatsapp', 'Envio de fotos do imóvel', 'Cliente aprovou', 'Agendar visita presencial');
        
        RAISE NOTICE '✅ Interações de exemplo inseridas';
    END IF;

    -- Inserir follow-ups de exemplo
    IF gerente_user_id IS NOT NULL AND sample_lead_id IS NOT NULL THEN
        INSERT INTO follow_ups (user_id, lead_id, tipo, data_agendada, observacoes, prioridade) VALUES
        (gerente_user_id, sample_lead_id, 'call', now() + interval '1 day', 'Ligar para confirmar interesse na proposta', 'alta'),
        (gerente_user_id, sample_lead_id, 'email', now() + interval '2 days', 'Enviar documentação necessária', 'media'),
        (gerente_user_id, sample_lead_id, 'visit', now() + interval '3 days', 'Visita técnica para vistoria', 'alta');
        
        RAISE NOTICE '✅ Follow-ups de exemplo inseridos';
    END IF;

    RAISE NOTICE '🎉 Todos os dados de exemplo foram inseridos com sucesso!';
END $$;

-- =====================================================================================
-- 7. VERIFICAÇÃO FINAL
-- =====================================================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('visits', 'tasks', 'interactions', 'follow_ups') 
        THEN '✅ Criada'
        ELSE '❌ Não encontrada'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('visits', 'tasks', 'interactions', 'follow_ups')
ORDER BY table_name;

-- Verificar dados inseridos
SELECT 'visits' as tabela, COUNT(*) as registros FROM visits
UNION ALL
SELECT 'tasks' as tabela, COUNT(*) as registros FROM tasks
UNION ALL
SELECT 'interactions' as tabela, COUNT(*) as registros FROM interactions
UNION ALL
SELECT 'follow_ups' as tabela, COUNT(*) as registros FROM follow_ups
ORDER BY tabela;

SELECT '🎉 TODAS AS TABELAS FALTANDO FORAM CRIADAS COM SUCESSO!' as resultado;
