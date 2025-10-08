-- 🔍 VERIFICAR ROLE DO USUÁRIO
-- Execute este script no Supabase Dashboard para verificar se o usuário tem a role correta

-- 1. Verificar se o usuário gerente existe
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'gerente@imobiliaria.com';

-- 2. Verificar se o perfil do usuário existe
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.created_at
FROM profiles p
WHERE p.email = 'gerente@imobiliaria.com';

-- 3. Verificar se o usuário tem a role de gerente
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'gerente@imobiliaria.com';

-- 4. Verificar todas as roles existentes
SELECT 
  ur.role,
  COUNT(*) as quantidade
FROM user_roles ur
GROUP BY ur.role;

-- 5. Se o usuário não tiver role, criar
INSERT INTO user_roles (user_id, role) 
SELECT 
  u.id,
  'gerente'
FROM auth.users u
WHERE u.email = 'gerente@imobiliaria.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = u.id
);

-- 6. Verificar novamente após inserção
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'gerente@imobiliaria.com';





