-- 🔧 SCRIPT SQL COMPLETO PARA CORRIGIR TODAS AS TABELAS
-- Execute este script no Supabase Dashboard

-- 1. RECRIAR TABELA PROFILES
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RECRIAR TABELA USER_ROLES
DROP TABLE IF EXISTS public.user_roles CASCADE;

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('corretor', 'gerente')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RECRIAR TABELA WHATSAPP_CONFIG
DROP TABLE IF EXISTS public.whatsapp_config CASCADE;

CREATE TABLE public.whatsapp_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    manager_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    instance_name text NOT NULL,
    instance_id text,
    qrcode text,
    status text DEFAULT 'pendente' NOT NULL,
    webhook_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. RECRIAR TABELA LEADS
DROP TABLE IF EXISTS public.leads CASCADE;

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

-- 5. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS RLS PARA PROFILES
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. CRIAR POLÍTICAS RLS PARA USER_ROLES
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role" ON user_roles
    FOR UPDATE USING (auth.uid() = user_id);

-- 8. CRIAR POLÍTICAS RLS PARA WHATSAPP_CONFIG
CREATE POLICY "Users can view own whatsapp config" ON whatsapp_config
    FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Users can insert own whatsapp config" ON whatsapp_config
    FOR INSERT WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Users can update own whatsapp config" ON whatsapp_config
    FOR UPDATE USING (auth.uid() = manager_id);

CREATE POLICY "Users can delete own whatsapp config" ON whatsapp_config
    FOR DELETE USING (auth.uid() = manager_id);

-- 9. CRIAR POLÍTICAS RLS PARA LEADS
CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON leads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON leads
    FOR DELETE USING (auth.uid() = user_id);

-- 10. INSERIR DADOS DE EXEMPLO
-- Perfil do gerente
INSERT INTO profiles (id, email, full_name) VALUES
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'gerente@imobiliaria.com', 'Gerente Imobiliária');

-- Role do gerente
INSERT INTO user_roles (user_id, role) VALUES
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'gerente');

-- Configuração WhatsApp do gerente
INSERT INTO whatsapp_config (manager_id, instance_name, status) VALUES
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'empresa-whatsapp', 'pendente');

-- Leads de exemplo
INSERT INTO leads (user_id, nome, telefone, email, imovel_interesse, valor_interesse, status, observacoes) VALUES
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'João Silva', '(11) 99999-9999', 'joao@email.com', 'Apartamento 3 quartos', 350000, 'novo', 'Interessado em apartamento no centro'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Maria Santos', '(11) 88888-8888', 'maria@email.com', 'Casa 4 quartos', 450000, 'contatado', 'Já conversou sobre financiamento'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Pedro Costa', '(11) 77777-7777', 'pedro@email.com', 'Apartamento 2 quartos', 280000, 'interessado', 'Muito interessado, quer agendar visita'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Ana Oliveira', '(11) 66666-6666', 'ana@email.com', 'Casa 3 quartos', 380000, 'visita_agendada', 'Visita agendada para próxima semana'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Carlos Ferreira', '(11) 55555-5555', 'carlos@email.com', 'Apartamento 4 quartos', 520000, 'proposta', 'Proposta enviada, aguardando resposta'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Lucia Rodrigues', '(11) 44444-4444', 'lucia@email.com', 'Casa 5 quartos', 650000, 'fechado', 'Venda finalizada com sucesso!'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Roberto Alves', '(11) 33333-3333', 'roberto@email.com', 'Apartamento 1 quarto', 180000, 'perdido', 'Desistiu da compra');

-- 11. VERIFICAR SE TUDO FUNCIONOU
SELECT 'profiles' as tabela, count(*) as registros FROM profiles
UNION ALL
SELECT 'user_roles', count(*) FROM user_roles
UNION ALL
SELECT 'whatsapp_config', count(*) FROM whatsapp_config
UNION ALL
SELECT 'leads', count(*) FROM leads;





