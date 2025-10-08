-- 🔧 SCRIPT PARA CRIAR USUÁRIO CORRETOR
-- Execute este script no Supabase Dashboard

-- 1. Criar usuário corretor (se não existir)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'corretor@imobiliaria.com',
  crypt('12345678', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Criar perfil do corretor
INSERT INTO profiles (id, email, full_name) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'corretor@imobiliaria.com', 'Corretor Imobiliário')
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- 3. Criar role de corretor
INSERT INTO user_roles (user_id, role) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'corretor')
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'corretor',
  created_at = NOW();

-- 4. Criar leads de exemplo para o corretor
INSERT INTO leads (user_id, nome, telefone, email, imovel_interesse, valor_interesse, status, observacoes) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Carlos Mendes', '(11) 99999-1111', 'carlos@email.com', 'Apartamento 2 quartos', 280000, 'novo', 'Interessado em apartamento próximo ao metrô'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ana Paula', '(11) 88888-2222', 'ana.paula@email.com', 'Casa 3 quartos', 420000, 'contatado', 'Já conversou sobre financiamento'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Roberto Silva', '(11) 77777-3333', 'roberto@email.com', 'Apartamento 4 quartos', 550000, 'interessado', 'Muito interessado, quer agendar visita'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maria Oliveira', '(11) 66666-4444', 'maria.oliveira@email.com', 'Casa 2 quartos', 320000, 'visita_agendada', 'Visita agendada para próxima terça'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'João Santos', '(11) 55555-5555', 'joao.santos@email.com', 'Apartamento 3 quartos', 380000, 'proposta', 'Proposta enviada, aguardando resposta'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Lucia Costa', '(11) 44444-6666', 'lucia@email.com', 'Casa 4 quartos', 480000, 'fechado', 'Venda finalizada com sucesso!'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pedro Alves', '(11) 33333-7777', 'pedro.alves@email.com', 'Apartamento 1 quarto', 220000, 'perdido', 'Desistiu da compra');

-- 5. Verificar se tudo foi criado corretamente
SELECT 'USUÁRIO CORRETOR' as tipo, u.email, u.email_confirmed_at
FROM auth.users u
WHERE u.email = 'corretor@imobiliaria.com'

UNION ALL

SELECT 'PERFIL CORRETOR', p.email, p.created_at
FROM profiles p
WHERE p.email = 'corretor@imobiliaria.com'

UNION ALL

SELECT 'ROLE CORRETOR', u.email, ur.created_at
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'corretor@imobiliaria.com'

UNION ALL

SELECT 'LEADS CORRETOR', u.email, COUNT(l.id)
FROM leads l
JOIN auth.users u ON u.id = l.user_id
WHERE u.email = 'corretor@imobiliaria.com'
GROUP BY u.email;

-- 6. Verificar todos os usuários criados
SELECT 
  u.email,
  p.full_name,
  ur.role,
  COUNT(l.id) as total_leads
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN leads l ON l.user_id = u.id
WHERE u.email IN ('gerente@imobiliaria.com', 'corretor@imobiliaria.com')
GROUP BY u.email, p.full_name, ur.role
ORDER BY ur.role;





