-- 🔧 SCRIPT SQL CORRIGIDO PARA CRIAR TABELA LEADS
-- Execute este script no Supabase Dashboard

-- 1. Criar tabela leads com estrutura correta
CREATE TABLE IF NOT EXISTS public.leads (
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
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('novo', 'contatado', 'interessado', 'visita_agendada', 'proposta', 'fechado', 'perdido')),
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_telefone CHECK (telefone IS NULL OR telefone ~* '^\+?[0-9\s\-\(\)]+$')
);

-- 2. Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON leads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON leads
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_ultima_interacao ON leads(ultima_interacao);

-- 5. Inserir dados de exemplo
INSERT INTO leads (user_id, nome, telefone, email, imovel_interesse, valor_interesse, status, observacoes) VALUES
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'João Silva', '(11) 99999-9999', 'joao@email.com', 'Apartamento 3 quartos', 350000, 'novo', 'Interessado em apartamento no centro'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Maria Santos', '(11) 88888-8888', 'maria@email.com', 'Casa 4 quartos', 450000, 'contatado', 'Já conversou sobre financiamento'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Pedro Costa', '(11) 77777-7777', 'pedro@email.com', 'Apartamento 2 quartos', 280000, 'interessado', 'Muito interessado, quer agendar visita'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Ana Oliveira', '(11) 66666-6666', 'ana@email.com', 'Casa 3 quartos', 380000, 'visita_agendada', 'Visita agendada para próxima semana'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Carlos Ferreira', '(11) 55555-5555', 'carlos@email.com', 'Apartamento 4 quartos', 520000, 'proposta', 'Proposta enviada, aguardando resposta'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Lucia Rodrigues', '(11) 44444-4444', 'lucia@email.com', 'Casa 5 quartos', 650000, 'fechado', 'Venda finalizada com sucesso!'),
('cec3f29d-3904-43b1-a0d5-bc99124751bc', 'Roberto Alves', '(11) 33333-3333', 'roberto@email.com', 'Apartamento 1 quarto', 180000, 'perdido', 'Desistiu da compra');

-- 6. Verificar se funcionou
SELECT * FROM leads ORDER BY created_at DESC;

-- 7. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'leads'
ORDER BY ordinal_position;





