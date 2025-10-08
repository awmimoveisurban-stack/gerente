-- CORRIGIR CHAVE DUPLICADA - SOLUÇÃO DEFINITIVA

-- 1. PRIMEIRO: Limpar dados existentes que podem estar causando conflito
DELETE FROM user_roles WHERE user_id = 'cec3f29d-3904-43b1-a0d5-bc99124751bc';
DELETE FROM profiles WHERE id = 'cec3f29d-3904-43b1-a0d5-bc99124751bc';

-- 2. Limpar TODOS os dados para recomeçar limpo
DELETE FROM user_roles;
DELETE FROM profiles;

-- 3. Verificar se foi limpo
SELECT 'Profiles restantes:' as tabela, COUNT(*) as total FROM profiles
UNION ALL
SELECT 'Roles restantes:' as tabela, COUNT(*) as total FROM user_roles;

-- 4. Agora inserir os dados limpos
-- Primeiro, vamos ver quais usuários existem na tabela auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com')
ORDER BY created_at;

-- 5. Inserir profiles baseado nos usuários existentes em auth.users
INSERT INTO profiles (id, email, full_name, created_at, updated_at) 
SELECT 
  id,
  email,
  split_part(email, '@', 1) as full_name,
  created_at,
  NOW() as updated_at
FROM auth.users 
WHERE email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- 6. Inserir roles
INSERT INTO user_roles (user_id, role, created_at)
SELECT 
  id,
  CASE 
    WHEN email = 'corretor@imobiliaria.com' THEN 'corretor'
    WHEN email = 'gerente@imobiliaria.com' THEN 'gerente'
  END as role,
  NOW()
FROM auth.users 
WHERE email IN ('corretor@imobiliaria.com', 'gerente@imobiliaria.com')
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  created_at = NOW();

-- 7. Verificar resultado final
SELECT 
  'RESULTADO FINAL:' as status,
  p.id,
  p.email,
  p.full_name,
  ur.role,
  p.created_at
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.created_at;





