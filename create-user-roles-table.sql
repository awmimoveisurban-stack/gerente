-- 🔧 SCRIPT SQL PARA CRIAR TABELA USER_ROLES
-- Execute este script no Supabase Dashboard

-- 1. Criar tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('corretor', 'gerente')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraint para garantir uma role por usuário
    UNIQUE(user_id)
);

-- 2. Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role" ON user_roles
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Inserir roles para os usuários existentes
INSERT INTO user_roles (user_id, role) VALUES
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'gerente')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- 5. Verificar se funcionou
SELECT * FROM user_roles;





