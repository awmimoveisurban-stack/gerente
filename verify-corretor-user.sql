-- 🔍 VERIFICAR USUÁRIO CORRETOR
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR SE USUÁRIO EXISTE EM AUTH.USERS
-- =====================================================================================

SELECT 
    'AUTH.USERS' as tabela,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
        ELSE '❌ Email não confirmado'
    END as status_email
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 2. VERIFICAR PERFIL
-- =====================================================================================

SELECT 
    'PROFILES' as tabela,
    email,
    full_name,
    created_at,
    CASE 
        WHEN id IS NOT NULL THEN '✅ Perfil existe'
        ELSE '❌ Perfil não existe'
    END as status_perfil
FROM profiles 
WHERE email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 3. VERIFICAR ROLE
-- =====================================================================================

SELECT 
    'USER_ROLES' as tabela,
    u.email,
    ur.role,
    ur.created_at,
    CASE 
        WHEN ur.role = 'corretor' THEN '✅ Role correta'
        ELSE '❌ Role incorreta ou não existe'
    END as status_role
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 4. VERIFICAR LEADS
-- =====================================================================================

SELECT 
    'LEADS' as tabela,
    u.email,
    COUNT(l.id) as total_leads,
    CASE 
        WHEN COUNT(l.id) > 0 THEN '✅ Tem leads'
        ELSE '❌ Sem leads'
    END as status_leads
FROM auth.users u
LEFT JOIN leads l ON l.user_id = u.id
WHERE u.email = 'corretor@imobiliaria.com'
GROUP BY u.email;

-- =====================================================================================
-- 5. VERIFICAR TODOS OS USUÁRIOS (PARA COMPARAR)
-- =====================================================================================

SELECT 
    'TODOS_USUARIOS' as info,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmado,
    p.full_name,
    ur.role,
    COUNT(l.id) as total_leads
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN leads l ON l.user_id = u.id
WHERE u.email IN ('gerente@imobiliaria.com', 'corretor@imobiliaria.com')
GROUP BY u.email, u.email_confirmed_at, p.full_name, ur.role
ORDER BY u.email;

-- =====================================================================================
-- 6. TESTE DE SENHA (VERIFICAR SE ESTÁ CRIPTOGRAFADA)
-- =====================================================================================

SELECT 
    'SENHA' as info,
    email,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN '✅ Senha criptografada'
        ELSE '❌ Senha não criptografada'
    END as status_senha,
    LENGTH(encrypted_password) as tamanho_senha
FROM auth.users 
WHERE email = 'corretor@imobiliaria.com';

-- =====================================================================================
-- 7. RESUMO GERAL
-- =====================================================================================

SELECT 
    'RESUMO' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'corretor@imobiliaria.com') 
        THEN '✅ Usuário existe'
        ELSE '❌ Usuário não existe'
    END as usuario,
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

SELECT '🔍 VERIFICAÇÃO CONCLUÍDA!' as resultado;





