-- 🔧 SCRIPT SQL PARA CORRIGIR PROBLEMAS QUE CAUSAM PÁGINAS EM BRANCO
-- Execute este script no Supabase Dashboard -> SQL Editor

-- =====================================================================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================================================

-- Verificar se todas as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('profiles', 'user_roles', 'leads', 'whatsapp_config') 
        THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'user_roles', 'leads', 'whatsapp_config')
ORDER BY table_name;

-- =====================================================================================
-- 2. VERIFICAR E CORRIGIR TABELA PROFILES
-- =====================================================================================

-- Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Recriar tabela profiles se necessário
DO $$
BEGIN
    -- Verificar se a tabela profiles tem a estrutura correta
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        -- Remover tabela profiles se existir para garantir recriação limpa
        DROP TABLE IF EXISTS public.profiles CASCADE;

        -- Criar tabela profiles com a estrutura correta
        CREATE TABLE public.profiles (
            id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email text UNIQUE,
            full_name text,
            avatar_url text,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Habilitar RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Criar políticas RLS
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
        CREATE POLICY "Users can insert own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);

        RAISE NOTICE 'Tabela profiles recriada com estrutura correta';
    ELSE
        RAISE NOTICE 'Tabela profiles já tem estrutura correta';
    END IF;
END $$;

-- =====================================================================================
-- 3. VERIFICAR E CORRIGIR TABELA USER_ROLES
-- =====================================================================================

-- Verificar estrutura da tabela user_roles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Recriar tabela user_roles se necessário
DO $$
BEGIN
    -- Verificar se a tabela user_roles tem a estrutura correta
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND table_schema = 'public' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Remover tabela user_roles se existir para garantir recriação limpa
        DROP TABLE IF EXISTS public.user_roles CASCADE;

        -- Criar tabela user_roles com a estrutura correta
        CREATE TABLE public.user_roles (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            role text NOT NULL CHECK (role IN ('corretor', 'gerente')),
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(user_id)
        );

        -- Habilitar RLS
        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

        -- Criar políticas RLS
        DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
        CREATE POLICY "Users can view own role" ON user_roles
            FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
        CREATE POLICY "Users can insert own role" ON user_roles
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own role" ON user_roles;
        CREATE POLICY "Users can update own role" ON user_roles
            FOR UPDATE USING (auth.uid() = user_id);

        RAISE NOTICE 'Tabela user_roles recriada com estrutura correta';
    ELSE
        RAISE NOTICE 'Tabela user_roles já tem estrutura correta';
    END IF;
END $$;

-- =====================================================================================
-- 4. VERIFICAR E CORRIGIR TABELA LEADS
-- =====================================================================================

-- Verificar estrutura da tabela leads
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'leads' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Recriar tabela leads se necessário
DO $$
BEGIN
    -- Verificar se a tabela leads tem a estrutura correta
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' 
        AND table_schema = 'public' 
        AND column_name = 'user_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Remover tabela leads se existir para garantir recriação limpa
        DROP TABLE IF EXISTS public.leads CASCADE;

        -- Criar tabela leads com a estrutura correta
        CREATE TABLE public.leads (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            nome text NOT NULL,
            telefone text,
            email text,
            imovel_interesse text,
            valor_interesse numeric,
            status text DEFAULT 'novo' NOT NULL,
            corretor text,
            observacoes text,
            data_entrada timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            ultima_interacao timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Habilitar RLS
        ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

        -- Criar políticas RLS
        DROP POLICY IF EXISTS "Users can view own leads" ON leads;
        CREATE POLICY "Users can view own leads" ON leads
            FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert own leads" ON leads;
        CREATE POLICY "Users can insert own leads" ON leads
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own leads" ON leads;
        CREATE POLICY "Users can update own leads" ON leads
            FOR UPDATE USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can delete own leads" ON leads;
        CREATE POLICY "Users can delete own leads" ON leads
            FOR DELETE USING (auth.uid() = user_id);

        RAISE NOTICE 'Tabela leads recriada com estrutura correta';
    ELSE
        RAISE NOTICE 'Tabela leads já tem estrutura correta';
    END IF;
END $$;

-- =====================================================================================
-- 5. VERIFICAR E CORRIGIR TABELA WHATSAPP_CONFIG
-- =====================================================================================

-- Verificar estrutura da tabela whatsapp_config
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'whatsapp_config' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Recriar tabela whatsapp_config se necessário
DO $$
BEGIN
    -- Verificar se a tabela whatsapp_config tem a estrutura correta
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_config' 
        AND table_schema = 'public' 
        AND column_name = 'manager_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Remover tabela whatsapp_config se existir para garantir recriação limpa
        DROP TABLE IF EXISTS public.whatsapp_config CASCADE;

        -- Criar tabela whatsapp_config com a estrutura correta
        CREATE TABLE public.whatsapp_config (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            manager_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
            instance_name text NOT NULL,
            instance_id text,
            qrcode text,
            status text DEFAULT 'pendente' NOT NULL,
            webhook_url text,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Habilitar RLS
        ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

        -- Criar políticas RLS
        DROP POLICY IF EXISTS "Users can view own whatsapp config" ON whatsapp_config;
        CREATE POLICY "Users can view own whatsapp config" ON whatsapp_config
            FOR SELECT USING (auth.uid() = manager_id);

        DROP POLICY IF EXISTS "Users can insert own whatsapp config" ON whatsapp_config;
        CREATE POLICY "Users can insert own whatsapp config" ON whatsapp_config
            FOR INSERT WITH CHECK (auth.uid() = manager_id);

        DROP POLICY IF EXISTS "Users can update own whatsapp config" ON whatsapp_config;
        CREATE POLICY "Users can update own whatsapp config" ON whatsapp_config
            FOR UPDATE USING (auth.uid() = manager_id);

        RAISE NOTICE 'Tabela whatsapp_config recriada com estrutura correta';
    ELSE
        RAISE NOTICE 'Tabela whatsapp_config já tem estrutura correta';
    END IF;
END $$;

-- =====================================================================================
-- 6. INSERIR DADOS DE EXEMPLO PARA TESTE
-- =====================================================================================

-- Inserir dados de exemplo se não existirem
DO $$
DECLARE
    gerente_user_id uuid;
    corretor_user_id uuid;
BEGIN
    -- Buscar IDs dos usuários existentes
    SELECT id INTO gerente_user_id FROM auth.users WHERE email = 'gerente@imobiliaria.com' LIMIT 1;
    SELECT id INTO corretor_user_id FROM auth.users WHERE email = 'corretor@imobiliaria.com' LIMIT 1;

    -- Inserir perfil do gerente se não existir
    IF gerente_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name)
        VALUES (gerente_user_id, 'gerente@imobiliaria.com', 'Gerente Imobiliária')
        ON CONFLICT (id) DO UPDATE SET 
            email = EXCLUDED.email, 
            full_name = EXCLUDED.full_name, 
            updated_at = now();

        -- Inserir role do gerente se não existir
        INSERT INTO user_roles (user_id, role)
        VALUES (gerente_user_id, 'gerente')
        ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

        -- Inserir configuração WhatsApp do gerente se não existir
        INSERT INTO whatsapp_config (manager_id, instance_name, status)
        VALUES (gerente_user_id, 'empresa-whatsapp', 'pendente')
        ON CONFLICT (manager_id) DO UPDATE SET 
            instance_name = EXCLUDED.instance_name, 
            status = EXCLUDED.status, 
            updated_at = now();

        RAISE NOTICE 'Dados do gerente inseridos/atualizados';
    END IF;

    -- Inserir perfil do corretor se não existir
    IF corretor_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name)
        VALUES (corretor_user_id, 'corretor@imobiliaria.com', 'Corretor Teste')
        ON CONFLICT (id) DO UPDATE SET 
            email = EXCLUDED.email, 
            full_name = EXCLUDED.full_name, 
            updated_at = now();

        -- Inserir role do corretor se não existir
        INSERT INTO user_roles (user_id, role)
        VALUES (corretor_user_id, 'corretor')
        ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

        RAISE NOTICE 'Dados do corretor inseridos/atualizados';
    END IF;
END $$;

-- =====================================================================================
-- 7. VERIFICAÇÃO FINAL
-- =====================================================================================

-- Verificar se todas as tabelas estão funcionando
SELECT 'profiles' as tabela, COUNT(*) as registros FROM profiles
UNION ALL
SELECT 'user_roles' as tabela, COUNT(*) as registros FROM user_roles
UNION ALL
SELECT 'leads' as tabela, COUNT(*) as registros FROM leads
UNION ALL
SELECT 'whatsapp_config' as tabela, COUNT(*) as registros FROM whatsapp_config
ORDER BY tabela;

-- Verificar usuários e suas roles
SELECT 
    u.email,
    p.full_name,
    ur.role,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as perfil,
    CASE WHEN ur.role IS NOT NULL THEN '✅' ELSE '❌' END as role_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('gerente@imobiliaria.com', 'corretor@imobiliaria.com')
ORDER BY u.email;

-- =====================================================================================
-- 8. RESULTADO FINAL
-- =====================================================================================

SELECT 
    '🎉 SCRIPT CONCLUÍDO COM SUCESSO!' as resultado,
    'Todas as tabelas foram verificadas e corrigidas.' as detalhes,
    'Agora você pode testar as páginas no navegador.' as proximo_passo;
