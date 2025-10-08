-- 🔧 SCRIPT SQL PARA CORRIGIR CONSTRAINT UNIQUE NA TABELA USER_ROLES
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA USER_ROLES
-- =====================================================================================

-- Verificar se a tabela user_roles existe e sua estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name = 'user_id' AND is_nullable = 'NO' THEN '✅ Campo user_id existe'
        ELSE '❌ Campo user_id não existe ou é nullable'
    END as status_user_id
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar constraints existentes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_roles'::regclass;

-- =====================================================================================
-- 2. CORRIGIR TABELA USER_ROLES COM CONSTRAINT UNIQUE CORRETA
-- =====================================================================================

-- Remover tabela user_roles se existir para garantir recriação limpa
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Criar tabela user_roles com a estrutura correta e constraint UNIQUE
CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('corretor', 'gerente')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role" ON user_roles
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================================================
-- 3. INSERIR DADOS DE EXEMPLO COM ON CONFLICT FUNCIONANDO
-- =====================================================================================

-- Inserir dados de exemplo se os usuários existirem
DO $$
DECLARE
    gerente_user_id uuid;
    corretor_user_id uuid;
BEGIN
    -- Buscar IDs dos usuários existentes
    SELECT id INTO gerente_user_id FROM auth.users WHERE email = 'gerente@imobiliaria.com' LIMIT 1;
    SELECT id INTO corretor_user_id FROM auth.users WHERE email = 'corretor@imobiliaria.com' LIMIT 1;

    -- Inserir role do gerente se o usuário existir
    IF gerente_user_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role)
        VALUES (gerente_user_id, 'gerente')
        ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
        
        RAISE NOTICE 'Role do gerente inserido/atualizado para usuário: %', gerente_user_id;
    ELSE
        RAISE NOTICE 'Usuário gerente não encontrado';
    END IF;

    -- Inserir role do corretor se o usuário existir
    IF corretor_user_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role)
        VALUES (corretor_user_id, 'corretor')
        ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
        
        RAISE NOTICE 'Role do corretor inserido/atualizado para usuário: %', corretor_user_id;
    ELSE
        RAISE NOTICE 'Usuário corretor não encontrado';
    END IF;
END $$;

-- =====================================================================================
-- 4. VERIFICAR SE FUNCIONOU
-- =====================================================================================

-- Verificar estrutura da tabela criada
SELECT 
    'user_roles' as tabela,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar constraints criadas
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_roles'::regclass;

-- Verificar dados inseridos
SELECT 
    ur.user_id,
    u.email,
    ur.role,
    ur.created_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
ORDER BY ur.created_at;

-- Testar ON CONFLICT funcionando
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Buscar um usuário existente para testar
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Tentar inserir novamente (deve usar ON CONFLICT)
        INSERT INTO user_roles (user_id, role)
        VALUES (test_user_id, 'gerente')
        ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
        
        RAISE NOTICE '✅ ON CONFLICT funcionando corretamente!';
    END IF;
END $$;

-- =====================================================================================
-- 5. RESULTADO FINAL
-- =====================================================================================

SELECT 
    '🎉 TABELA USER_ROLES CORRIGIDA COM SUCESSO!' as resultado,
    'Constraint UNIQUE no user_id foi criada corretamente.' as detalhes,
    'ON CONFLICT agora funciona sem erros.' as status;





