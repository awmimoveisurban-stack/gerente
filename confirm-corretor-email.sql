-- 🔧 CONFIRMAR EMAIL DO CORRETOR
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR STATUS ATUAL
-- =====================================================================================

SELECT 
    'STATUS ATUAL' as info,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Já confirmado'
        ELSE '❌ Não confirmado'
    END as status
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 2. CONFIRMAR EMAIL DO CORRETOR
-- =====================================================================================

UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 3. VERIFICAR SE FOI CONFIRMADO
-- =====================================================================================

SELECT 
    'APÓS CONFIRMAÇÃO' as info,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado com sucesso'
        ELSE '❌ Ainda não confirmado'
    END as status
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';

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

-- =====================================================================================
-- 5. VERIFICAÇÃO COMPLETA
-- =====================================================================================

SELECT 
    'VERIFICAÇÃO COMPLETA' as categoria,
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
    END as role;

-- =====================================================================================
-- 6. DADOS DE LOGIN
-- =====================================================================================

SELECT '🔑 DADOS DE LOGIN' as info;
SELECT 'Email: corretor@imobiliaria.com' as email;
SELECT 'Senha: 12345678' as senha;
SELECT 'Status: Email confirmado' as status;

SELECT '🎉 EMAIL DO CORRETOR CONFIRMADO COM SUCESSO!' as resultado;





