-- 🚀 CONFIGURAÇÃO COMPLETA DO CORRETOR
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. REMOVER USUÁRIO EXISTENTE (SE HOUVER PROBLEMAS)
-- =====================================================================================

-- Remover dados relacionados ao corretor
DELETE FROM leads WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM user_roles WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM profiles WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM auth.users WHERE email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 2. CRIAR USUÁRIO CORRETOR COM EMAIL JÁ CONFIRMADO
-- =====================================================================================

-- Obter instance_id
DO $$
DECLARE
    instance_id uuid;
    corretor_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN
    -- Buscar instance_id
    SELECT id INTO instance_id FROM auth.instances LIMIT 1;
    
    -- Criar usuário corretor com email já confirmado
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,  -- JÁ CONFIRMADO
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        corretor_id,
        instance_id,
        'authenticated',
        'authenticated',
        'corretor@imobiliaria.com',
        crypt('12345678', gen_salt('bf')),
        NOW(),  -- Email confirmado imediatamente
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}'
    );
    
    RAISE NOTICE '✅ Usuário corretor criado com email confirmado!';
END $$;

-- =====================================================================================
-- 3. CRIAR PERFIL
-- =====================================================================================

INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'corretor@imobiliaria.com',
    'Corretor Imobiliário',
    NOW(),
    NOW()
);

-- =====================================================================================
-- 4. CRIAR ROLE
-- =====================================================================================

INSERT INTO user_roles (user_id, role, created_at)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'corretor',
    NOW()
);

-- =====================================================================================
-- 5. CRIAR LEADS DE EXEMPLO
-- =====================================================================================

INSERT INTO leads (user_id, nome, telefone, email, imovel_interesse, valor_interesse, status, observacoes) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Carlos Mendes', '(11) 99999-1111', 'carlos@email.com', 'Apartamento 2 quartos', 280000, 'novo', 'Interessado em apartamento próximo ao metrô'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ana Paula', '(11) 88888-2222', 'ana.paula@email.com', 'Casa 3 quartos', 420000, 'contatado', 'Já conversou sobre financiamento'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Roberto Silva', '(11) 77777-3333', 'roberto@email.com', 'Apartamento 4 quartos', 550000, 'interessado', 'Muito interessado, quer agendar visita'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maria Oliveira', '(11) 66666-4444', 'maria.oliveira@email.com', 'Casa 2 quartos', 320000, 'visita_agendada', 'Visita agendada para próxima terça'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'João Santos', '(11) 55555-5555', 'joao.santos@email.com', 'Apartamento 3 quartos', 380000, 'proposta', 'Proposta enviada, aguardando resposta'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Lucia Costa', '(11) 44444-6666', 'lucia@email.com', 'Casa 4 quartos', 480000, 'fechado', 'Venda finalizada com sucesso!'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pedro Alves', '(11) 33333-7777', 'pedro.alves@email.com', 'Apartamento 1 quarto', 220000, 'perdido', 'Desistiu da compra');

-- =====================================================================================
-- 6. VERIFICAÇÃO FINAL
-- =====================================================================================

-- Verificar usuário
SELECT 
    'USUÁRIO' as tipo,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
        ELSE '❌ Email não confirmado'
    END as status
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';

-- Verificar perfil
SELECT 
    'PERFIL' as tipo,
    email,
    full_name,
    CASE 
        WHEN id IS NOT NULL THEN '✅ Perfil criado'
        ELSE '❌ Perfil não criado'
    END as status
FROM profiles 
WHERE email = 'corretor@imobiliaria.com';

-- Verificar role
SELECT 
    'ROLE' as tipo,
    u.email,
    ur.role,
    CASE 
        WHEN ur.role = 'corretor' THEN '✅ Role correta'
        ELSE '❌ Role incorreta'
    END as status
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com';

-- Verificar leads
SELECT 
    'LEADS' as tipo,
    u.email,
    COUNT(l.id) as total_leads,
    CASE 
        WHEN COUNT(l.id) > 0 THEN '✅ Leads criados'
        ELSE '❌ Sem leads'
    END as status
FROM auth.users u
LEFT JOIN leads l ON l.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com'
GROUP BY u.email;

-- =====================================================================================
-- 7. RESUMO FINAL
-- =====================================================================================

SELECT 
    'RESUMO FINAL' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'corretor@imobiliaria.com' AND email_confirmed_at IS NOT NULL) 
        THEN '✅ Email confirmado'
        ELSE '❌ Email não confirmado'
    END as email,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'corretor@imobiliaria.com') 
        THEN '✅ Perfil existe'
        ELSE '❌ Perfil não existe'
    END as perfil,
    CASE 
        WHEN EXISTS (SELECT 1 FROM user_roles ur JOIN auth.users u ON u.id = ur.user_id WHERE u.email = 'corretor@imobiliaria.com' AND ur.role = 'corretor') 
        THEN '✅ Role correta'
        ELSE '❌ Role incorreta'
    END as role,
    CASE 
        WHEN EXISTS (SELECT 1 FROM leads l JOIN auth.users u ON u.id = l.user_id WHERE u.email = 'corretor@imobiliaria.com') 
        THEN '✅ Leads existem'
        ELSE '❌ Sem leads'
    END as leads;

-- =====================================================================================
-- 8. DADOS DE LOGIN
-- =====================================================================================

SELECT '🔑 DADOS DE LOGIN DO CORRETOR' as info;
SELECT 'Email: corretor@imobiliaria.com' as email;
SELECT 'Senha: 12345678' as senha;
SELECT 'Status: Email confirmado automaticamente' as status;

SELECT '🎉 CORRETOR CONFIGURADO COM EMAIL CONFIRMADO!' as resultado;





