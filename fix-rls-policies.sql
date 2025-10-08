-- Corrigir políticas RLS para permitir criação de usuários

-- 1. Desabilitar RLS temporariamente para criar dados iniciais
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- 2. Inserir usuários diretamente
INSERT INTO profiles (id, email, full_name, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'corretor@imobiliaria.com', 'Corretor Teste', NOW(), NOW()),
('00000000-0000-0000-0000-000000000002', 'gerente@imobiliaria.com', 'Gerente Teste', NOW(), NOW());

INSERT INTO user_roles (user_id, role, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'corretor', NOW()),
('00000000-0000-0000-0000-000000000002', 'gerente', NOW());

-- 3. Reabilitar RLS com políticas corretas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas que permitem operações básicas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para user_roles
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
CREATE POLICY "Users can insert own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);





