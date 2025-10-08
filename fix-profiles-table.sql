-- 🔧 SCRIPT SQL PARA CORRIGIR TABELA PROFILES
-- Execute este script no Supabase Dashboard

-- 1. Verificar estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Se a tabela não existir, criar com estrutura correta
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.1 Se a tabela existir mas não tiver as colunas necessárias, adicionar
DO $$ 
BEGIN
    -- Adicionar coluna email se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email text;
        RAISE NOTICE 'Coluna email adicionada';
    END IF;
    
    -- Adicionar coluna full_name se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN full_name text;
        RAISE NOTICE 'Coluna full_name adicionada';
    END IF;
    
    -- Adicionar coluna avatar_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url text;
        RAISE NOTICE 'Coluna avatar_url adicionada';
    END IF;
    
    -- Adicionar coluna created_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
        RAISE NOTICE 'Coluna created_at adicionada';
    END IF;
    
    -- Adicionar coluna updated_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
        RAISE NOTICE 'Coluna updated_at adicionada';
    END IF;
END $$;

-- 3. Se a tabela existir mas tiver user_id, renomear para id
DO $$ 
BEGIN
    -- Verificar se existe coluna user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        -- Renomear user_id para id
        ALTER TABLE profiles RENAME COLUMN user_id TO id;
        
        -- Adicionar constraints se não existirem
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'profiles' AND constraint_type = 'PRIMARY KEY'
        ) THEN
            ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'profiles' AND constraint_name = 'profiles_id_fkey'
        ) THEN
            ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        RAISE NOTICE 'Coluna user_id renomeada para id com sucesso';
    ELSE
        RAISE NOTICE 'Coluna user_id não encontrada, estrutura já está correta';
    END IF;
END $$;

-- 4. Habilitar RLS se não estiver habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- 6. Criar políticas RLS corretas
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Inserir perfil do usuário gerente se não existir
INSERT INTO profiles (id, email, full_name)
VALUES (
    'cec3f29d-3904-43b1-a0d5-bc99124751bc',
    'gerente@imobiliaria.com',
    'Gerente Imobiliária'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();

-- 8. Verificar se a correção foi aplicada
SELECT 
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 9. Testar query
SELECT * FROM profiles WHERE id = 'cec3f29d-3904-43b1-a0d5-bc99124751bc';
