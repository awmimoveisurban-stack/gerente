-- 🔧 SCRIPT SQL CORRIGIDO PARA CRIAR TABELA USER_ROLES
-- Execute este script no Supabase Dashboard

-- 1. Recriar tabela user_roles sem conflitos
DROP TABLE IF EXISTS public.user_roles CASCADE;

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('corretor', 'gerente')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar constraint UNIQUE após criar a tabela
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE(user_id);

-- 3. Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role" ON user_roles
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Inserir role para o usuário gerente (sem ON CONFLICT por enquanto)
INSERT INTO user_roles (user_id, role) VALUES
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'gerente');

-- 6. Verificar se funcionou
SELECT * FROM user_roles;





