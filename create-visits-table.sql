-- 🔧 SCRIPT SQL SIMPLES PARA CRIAR TABELA VISITS
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. CRIAR TABELA VISITS
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
-- 2. CRIAR TABELA TASKS (SE NÃO EXISTIR OU SE ESTRUTURA ESTIVER INCORRETA)
-- =====================================================================================

-- Verificar se a tabela tasks existe e tem a estrutura correta
DO $$
BEGIN
    -- Verificar se a tabela tasks existe e tem a coluna user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tasks' AND table_schema = 'public'
    ) OR NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND table_schema = 'public' 
        AND column_name = 'user_id'
    ) THEN
        -- Remover tabela tasks se existir para garantir recriação limpa
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

        RAISE NOTICE 'Tabela tasks criada/recriada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela tasks já existe com estrutura correta';
    END IF;
END $$;

-- =====================================================================================
-- 3. INSERIR DADOS DE EXEMPLO
-- =====================================================================================

-- Inserir dados de exemplo se os usuários existirem
DO $$
DECLARE
    gerente_user_id uuid;
    sample_lead_id uuid;
BEGIN
    -- Buscar ID do usuário gerente
    SELECT id INTO gerente_user_id FROM auth.users WHERE email = 'gerente@imobiliaria.com' LIMIT 1;
    
    -- Buscar um lead de exemplo
    SELECT id INTO sample_lead_id FROM leads LIMIT 1;

    -- Inserir visitas de exemplo
    IF gerente_user_id IS NOT NULL AND sample_lead_id IS NOT NULL THEN
        INSERT INTO visits (user_id, lead_id, data_visita, endereco, observacoes, status) VALUES
        (gerente_user_id, sample_lead_id, now() + interval '2 days', 'Rua das Flores, 123 - Centro', 'Visita agendada para mostrar o apartamento', 'agendada'),
        (gerente_user_id, sample_lead_id, now() + interval '5 days', 'Av. Principal, 456 - Bairro Novo', 'Segunda visita para fechar negócio', 'agendada');
        
        RAISE NOTICE 'Visitas de exemplo inseridas';
    END IF;

    -- Inserir tarefas de exemplo
    IF gerente_user_id IS NOT NULL AND sample_lead_id IS NOT NULL THEN
        INSERT INTO tasks (user_id, lead_id, titulo, descricao, status, data_vencimento, prioridade) VALUES
        (gerente_user_id, sample_lead_id, 'Enviar proposta', 'Preparar e enviar proposta comercial', 'pendente', now() + interval '1 day', 'alta'),
        (gerente_user_id, sample_lead_id, 'Follow-up telefônico', 'Ligar para cliente após envio da proposta', 'pendente', now() + interval '3 days', 'media');
        
        RAISE NOTICE 'Tarefas de exemplo inseridas';
    END IF;
END $$;

-- =====================================================================================
-- 4. VERIFICAR RESULTADO
-- =====================================================================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('visits', 'tasks') 
        THEN '✅ Criada'
        ELSE '❌ Não encontrada'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('visits', 'tasks')
ORDER BY table_name;

-- Verificar dados inseridos
SELECT 'visits' as tabela, COUNT(*) as registros FROM visits
UNION ALL
SELECT 'tasks' as tabela, COUNT(*) as registros FROM tasks
ORDER BY tabela;

SELECT '🎉 TABELAS VISITS E TASKS CRIADAS COM SUCESSO!' as resultado;
