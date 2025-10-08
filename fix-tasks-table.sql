-- 🔧 SCRIPT SQL SIMPLES PARA CORRIGIR TABELA TASKS
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA TASKS
-- =====================================================================================

-- Verificar se a tabela tasks existe e sua estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================================================
-- 2. CORRIGIR TABELA TASKS
-- =====================================================================================

-- Remover tabela tasks se existir para garantir recriação limpa
DROP TABLE IF EXISTS public.tasks CASCADE;

-- Criar tabela tasks com a estrutura correta
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

    -- Inserir tarefas de exemplo
    IF gerente_user_id IS NOT NULL AND sample_lead_id IS NOT NULL THEN
        INSERT INTO tasks (user_id, lead_id, titulo, descricao, status, data_vencimento, prioridade) VALUES
        (gerente_user_id, sample_lead_id, 'Enviar proposta', 'Preparar e enviar proposta comercial', 'pendente', now() + interval '1 day', 'alta'),
        (gerente_user_id, sample_lead_id, 'Follow-up telefônico', 'Ligar para cliente após envio da proposta', 'pendente', now() + interval '3 days', 'media'),
        (gerente_user_id, null, 'Reunião semanal', 'Reunião de equipe para acompanhamento', 'pendente', now() + interval '7 days', 'baixa');
        
        RAISE NOTICE '✅ Tarefas de exemplo inseridas com sucesso';
    ELSE
        RAISE NOTICE '⚠️ Usuário gerente ou lead não encontrado, pulando inserção de dados';
    END IF;
END $$;

-- =====================================================================================
-- 4. VERIFICAR RESULTADO
-- =====================================================================================

-- Verificar estrutura da tabela criada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar dados inseridos
SELECT 
    t.id,
    t.titulo,
    t.status,
    t.prioridade,
    u.email as usuario,
    l.nome as lead_nome
FROM tasks t
LEFT JOIN auth.users u ON t.user_id = u.id
LEFT JOIN leads l ON t.lead_id = l.id
ORDER BY t.created_at;

-- Contar registros
SELECT COUNT(*) as total_tarefas FROM tasks;

SELECT '🎉 TABELA TASKS CORRIGIDA COM SUCESSO!' as resultado;
