-- 🔧 CORRIGIR LOGIN DO CORRETOR
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR USUÁRIO CORRETOR
-- =====================================================================================

-- Verificar se o usuário corretor existe
SELECT 
    'corretor@imobiliaria.com' as email,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = 'corretor@imobiliaria.com'
        ) THEN '✅ Usuário existe'
        ELSE '❌ Usuário não existe'
    END as status_usuario;

-- =====================================================================================
-- 2. VERIFICAR EMAIL CONFIRMADO
-- =====================================================================================

-- Verificar se o email foi confirmado
SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
        ELSE '❌ Email não confirmado'
    END as status_email,
    created_at
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 3. CORRIGIR EMAIL CONFIRMADO (SE NECESSÁRIO)
-- =====================================================================================

-- Confirmar email do corretor
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'corretor@imobiliaria.com' 
AND email_confirmed_at IS NULL;

-- =====================================================================================
-- 4. VERIFICAR PERFIL E ROLE
-- =====================================================================================

-- Verificar perfil
SELECT 
    'PERFIL' as tipo,
    email,
    full_name,
    CASE 
        WHEN id IS NOT NULL THEN '✅ Perfil existe'
        ELSE '❌ Perfil não existe'
    END as status
FROM profiles 
WHERE email = 'corretor@imobiliaria.com'

UNION ALL

-- Verificar role
SELECT 
    'ROLE' as tipo,
    u.email,
    ur.role,
    CASE 
        WHEN ur.role IS NOT NULL THEN '✅ Role existe'
        ELSE '❌ Role não existe'
    END as status
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 5. CRIAR/CORRIGIR PERFIL E ROLE (SE NECESSÁRIO)
-- =====================================================================================

-- Obter ID do usuário corretor
DO $$
DECLARE
    corretor_id uuid;
BEGIN
    -- Buscar ID do corretor
    SELECT id INTO corretor_id FROM auth.users WHERE email = 'corretor@imobiliaria.com';
    
    IF corretor_id IS NOT NULL THEN
        -- Criar/atualizar perfil
        INSERT INTO profiles (id, email, full_name, created_at, updated_at)
        VALUES (corretor_id, 'corretor@imobiliaria.com', 'Corretor Imobiliário', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            updated_at = NOW();
        
        -- Criar/atualizar role
        INSERT INTO user_roles (user_id, role, created_at)
        VALUES (corretor_id, 'corretor', NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            role = EXCLUDED.role,
            created_at = NOW();
        
        RAISE NOTICE '✅ Perfil e role do corretor configurados com sucesso!';
    ELSE
        RAISE NOTICE '❌ Usuário corretor não encontrado!';
    END IF;
END $$;

-- =====================================================================================
-- 6. CRIAR DADOS DE TESTE PARA O CORRETOR
-- =====================================================================================

-- Inserir leads de exemplo para o corretor
DO $$
DECLARE
    corretor_id uuid;
BEGIN
    -- Buscar ID do corretor
    SELECT id INTO corretor_id FROM auth.users WHERE email = 'corretor@imobiliaria.com';
    
    IF corretor_id IS NOT NULL THEN
        -- Inserir leads de exemplo
        INSERT INTO leads (user_id, nome, telefone, email, imovel_interesse, valor_interesse, status, observacoes) VALUES
        (corretor_id, 'Carlos Mendes', '(11) 99999-1111', 'carlos@email.com', 'Apartamento 2 quartos', 280000, 'novo', 'Interessado em apartamento próximo ao metrô'),
        (corretor_id, 'Ana Paula', '(11) 88888-2222', 'ana.paula@email.com', 'Casa 3 quartos', 420000, 'contatado', 'Já conversou sobre financiamento'),
        (corretor_id, 'Roberto Silva', '(11) 77777-3333', 'roberto@email.com', 'Apartamento 4 quartos', 550000, 'interessado', 'Muito interessado, quer agendar visita'),
        (corretor_id, 'Maria Oliveira', '(11) 66666-4444', 'maria.oliveira@email.com', 'Casa 2 quartos', 320000, 'visita_agendada', 'Visita agendada para próxima terça'),
        (corretor_id, 'João Santos', '(11) 55555-5555', 'joao.santos@email.com', 'Apartamento 3 quartos', 380000, 'proposta', 'Proposta enviada, aguardando resposta'),
        (corretor_id, 'Lucia Costa', '(11) 44444-6666', 'lucia@email.com', 'Casa 4 quartos', 480000, 'fechado', 'Venda finalizada com sucesso!'),
        (corretor_id, 'Pedro Alves', '(11) 33333-7777', 'pedro.alves@email.com', 'Apartamento 1 quarto', 220000, 'perdido', 'Desistiu da compra')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Leads de exemplo criados para o corretor!';
    ELSE
        RAISE NOTICE '❌ Usuário corretor não encontrado!';
    END IF;
END $$;

-- =====================================================================================
-- 7. VERIFICAÇÃO FINAL
-- =====================================================================================

-- Verificar usuário
SELECT 'USUÁRIO' as tipo, email, 
       CASE WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado' ELSE '❌ Email não confirmado' END as status
FROM auth.users WHERE email = 'corretor@imobiliaria.com';

-- Verificar perfil
SELECT 'PERFIL' as tipo, email, 
       CASE WHEN id IS NOT NULL THEN '✅ Perfil existe' ELSE '❌ Perfil não existe' END as status
FROM profiles WHERE email = 'corretor@imobiliaria.com';

-- Verificar role
SELECT 'ROLE' as tipo, u.email, 
       CASE WHEN ur.role = 'corretor' THEN '✅ Role correta' ELSE '❌ Role incorreta' END as status
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com';

-- Verificar leads
SELECT 'LEADS' as tipo, u.email, 
       CASE WHEN COUNT(l.id) > 0 THEN '✅ Tem leads' ELSE '❌ Sem leads' END as status
FROM auth.users u
LEFT JOIN leads l ON l.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com'
GROUP BY u.email;

-- =====================================================================================
-- 8. DADOS DE LOGIN
-- =====================================================================================

SELECT 
    '🔑 DADOS DE LOGIN DO CORRETOR' as info,
    'Email: corretor@imobiliaria.com' as email,
    'Senha: 12345678' as senha;

SELECT '🎉 LOGIN DO CORRETOR CORRIGIDO!' as resultado;
