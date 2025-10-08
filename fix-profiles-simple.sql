-- 🔧 SCRIPT SQL SIMPLES PARA CORRIGIR TABELA PROFILES
-- Execute este script no Supabase Dashboard

-- 1. Verificar estrutura atual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Recriar tabela profiles com estrutura correta
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Inserir perfil do usuário gerente
INSERT INTO profiles (id, email, full_name)
VALUES (
    'cec3f29d-3904-43b1-a0d5-bc99124751bc',
    'gerente@imobiliaria.com',
    'Gerente Imobiliária'
);

-- 6. Verificar se funcionou
SELECT * FROM profiles;





