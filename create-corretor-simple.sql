-- 🚀 SCRIPT SIMPLES PARA CRIAR USUÁRIO CORRETOR
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. LIMPAR DADOS EXISTENTES (SE NECESSÁRIO)
-- =====================================================================================

-- Remover dados relacionados ao corretor
DELETE FROM leads WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM user_roles WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM profiles WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM auth.users WHERE email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 2. CRIAR USUÁRIO CORRETOR
-- =====================================================================================

-- Obter instance_id e criar usuário
DO $$
DECLARE
    instance_id uuid;
BEGIN
    -- Buscar instance_id
    SELECT id INTO instance_id FROM auth.instances LIMIT 1;
    
    -- Criar usuário corretor
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        instance_id,
        'authenticated',
        'authenticated',
        'corretor@imobiliaria.com',
        crypt('12345678', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}'
    );
    
    RAISE NOTICE '✅ Usuário corretor criado!';
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
-- 6. VERIFICAÇÃO SIMPLES
-- =====================================================================================

-- Verificar usuário
SELECT 'USUÁRIO' as tipo, email, 
       CASE WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado' ELSE '❌ Não confirmado' END as status
FROM auth.users WHERE email = 'corretor@imobiliaria.com';

-- Verificar perfil
SELECT 'PERFIL' as tipo, email, 
       CASE WHEN id IS NOT NULL THEN '✅ Criado' ELSE '❌ Não criado' END as status
FROM profiles WHERE email = 'corretor@imobiliaria.com';

-- Verificar role
SELECT 'ROLE' as tipo, u.email, 
       CASE WHEN ur.role = 'corretor' THEN '✅ Correta' ELSE '❌ Incorreta' END as status
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com';

-- Verificar leads
SELECT 'LEADS' as tipo, u.email, 
       CASE WHEN COUNT(l.id) > 0 THEN '✅ Criados' ELSE '❌ Sem leads' END as status
FROM auth.users u
LEFT JOIN leads l ON l.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com'
GROUP BY u.email;

-- =====================================================================================
-- 7. DADOS DE LOGIN
-- =====================================================================================

SELECT '🔑 DADOS DE LOGIN' as info;
SELECT 'Email: corretor@imobiliaria.com' as email;
SELECT 'Senha: 12345678' as senha;

SELECT '🎉 USUÁRIO CORRETOR CRIADO COM SUCESSO!' as resultado;





