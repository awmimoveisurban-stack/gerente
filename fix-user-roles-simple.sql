-- 🔧 SCRIPT SQL SIMPLES PARA CORRIGIR CONSTRAINT UNIQUE
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR SE A CONSTRAINT UNIQUE EXISTE
-- =====================================================================================

-- Verificar constraints existentes na tabela user_roles
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_roles'::regclass
    AND contype = 'u'; -- 'u' = UNIQUE constraint

-- =====================================================================================
-- 2. ADICIONAR CONSTRAINT UNIQUE SE NÃO EXISTIR
-- =====================================================================================

-- Adicionar constraint UNIQUE no user_id se não existir
DO $$
BEGIN
    -- Verificar se já existe constraint UNIQUE no user_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.user_roles'::regclass 
        AND contype = 'u' 
        AND pg_get_constraintdef(oid) LIKE '%user_id%'
    ) THEN
        -- Adicionar constraint UNIQUE
        ALTER TABLE public.user_roles 
        ADD CONSTRAINT unique_user_id UNIQUE (user_id);
        
        RAISE NOTICE '✅ Constraint UNIQUE adicionada no user_id';
    ELSE
        RAISE NOTICE '✅ Constraint UNIQUE já existe no user_id';
    END IF;
END $$;

-- =====================================================================================
-- 3. TESTAR ON CONFLICT
-- =====================================================================================

-- Testar se ON CONFLICT funciona agora
DO $$
DECLARE
    gerente_user_id uuid;
BEGIN
    -- Buscar ID do usuário gerente
    SELECT id INTO gerente_user_id FROM auth.users WHERE email = 'gerente@imobiliaria.com' LIMIT 1;
    
    IF gerente_user_id IS NOT NULL THEN
        -- Tentar inserir com ON CONFLICT
        INSERT INTO user_roles (user_id, role)
        VALUES (gerente_user_id, 'gerente')
        ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
        
        RAISE NOTICE '✅ ON CONFLICT funcionando! Role inserido/atualizado para usuário: %', gerente_user_id;
    ELSE
        RAISE NOTICE '❌ Usuário gerente não encontrado';
    END IF;
END $$;

-- =====================================================================================
-- 4. VERIFICAR RESULTADO
-- =====================================================================================

-- Verificar constraints finais
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_roles'::regclass;

-- Verificar dados na tabela
SELECT 
    ur.user_id,
    u.email,
    ur.role,
    ur.created_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
ORDER BY ur.created_at;

SELECT '🎉 SCRIPT CONCLUÍDO! ON CONFLICT deve funcionar agora.' as resultado;





