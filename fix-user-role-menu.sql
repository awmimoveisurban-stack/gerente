-- 🔧 SCRIPT PARA CORRIGIR ROLE DO USUÁRIO E GARANTIR QUE O MENU APAREÇA
-- Execute este script no Supabase Dashboard

-- 1. Verificar se o usuário gerente existe
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'gerente@imobiliaria.com';

-- 2. Verificar se o perfil existe
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.created_at
FROM profiles p
WHERE p.email = 'gerente@imobiliaria.com';

-- 3. Verificar role atual
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'gerente@imobiliaria.com';

-- 4. Garantir que o usuário tem role de gerente
INSERT INTO user_roles (user_id, role) 
SELECT 
  u.id,
  'gerente'
FROM auth.users u
WHERE u.email = 'gerente@imobiliaria.com'
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'gerente',
  created_at = now();

-- 5. Verificar se funcionou
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'gerente@imobiliaria.com';

-- 6. Verificar todas as roles existentes
SELECT 
  ur.role,
  COUNT(*) as quantidade,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
GROUP BY ur.role, u.email;





