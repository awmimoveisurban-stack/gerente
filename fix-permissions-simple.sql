-- =====================================================
-- CORRIGIR PERMISSÕES - SCRIPT SIMPLIFICADO
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
-- =====================================================

-- Remover políticas da tabela leads
DROP POLICY IF EXISTS "Gerentes can view all leads" ON leads;
DROP POLICY IF EXISTS "Corretores can view own leads" ON leads;
DROP POLICY IF EXISTS "Gerentes can insert leads" ON leads;
DROP POLICY IF EXISTS "Corretores can insert own leads" ON leads;
DROP POLICY IF EXISTS "Gerentes can update all leads" ON leads;
DROP POLICY IF EXISTS "Corretores can update own leads" ON leads;
DROP POLICY IF EXISTS "Temporary access for leads" ON leads;

-- Remover políticas da tabela tasks
DROP POLICY IF EXISTS "Gerentes can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Corretores can manage own tasks" ON tasks;
DROP POLICY IF EXISTS "Temporary access for tasks" ON tasks;

-- Remover políticas da tabela visits
DROP POLICY IF EXISTS "Gerentes can manage all visits" ON visits;
DROP POLICY IF EXISTS "Corretores can manage own visits" ON visits;
DROP POLICY IF EXISTS "Temporary access for visits" ON visits;

-- Remover políticas da tabela interactions
DROP POLICY IF EXISTS "Gerentes can manage all interactions" ON interactions;
DROP POLICY IF EXISTS "Corretores can manage own interactions" ON interactions;
DROP POLICY IF EXISTS "Temporary access for interactions" ON interactions;

-- Remover políticas da tabela invites
DROP POLICY IF EXISTS "Gerentes can manage invites" ON invites;

-- 2. REMOVER FUNÇÕES EXISTENTES
-- =====================================================

DROP FUNCTION IF EXISTS is_gerente(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_corretor(UUID) CASCADE;

-- 3. CRIAR FUNÇÕES COM PERMISSÕES CORRETAS
-- =====================================================

-- Função is_gerente com SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_gerente(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'gerente'
  );
END;
$$ LANGUAGE plpgsql;

-- Função is_corretor com SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_corretor(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'corretor'
  );
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR POLÍTICAS RLS SIMPLIFICADAS
-- =====================================================

-- Política temporária para leads (permitir tudo para debug)
CREATE POLICY "Temporary access for leads" ON leads
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Política temporária para tasks
CREATE POLICY "Temporary access for tasks" ON tasks
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Política temporária para visits
CREATE POLICY "Temporary access for visits" ON visits
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Política temporária para interactions
CREATE POLICY "Temporary access for interactions" ON interactions
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- 5. INSERIR DADOS DE TESTE MANUALMENTE
-- =====================================================

-- Primeiro, verificar se há usuários na tabela auth.users
SELECT id, email FROM auth.users LIMIT 3;

-- Inserir dados de teste usando um user_id específico
-- (Substitua 'USER_ID_AQUI' pelo ID de um usuário real)
INSERT INTO leads (
  user_id,
  nome,
  telefone,
  email,
  imovel_interesse,
  valor_interesse,
  status,
  corretor,
  observacoes
) VALUES 
(
  (SELECT id FROM auth.users WHERE email = 'gerente@imobiliaria.com' LIMIT 1),
  'João Silva (Teste)',
  '(11) 99999-9999',
  'joao@teste.com',
  'Apartamento 3 quartos',
  450000,
  'novo',
  'gerente@imobiliaria.com',
  'Lead de teste criado para debug'
),
(
  (SELECT id FROM auth.users WHERE email = 'gerente@imobiliaria.com' LIMIT 1),
  'Maria Santos (Teste)',
  '(11) 88888-8888',
  'maria@teste.com',
  'Casa 4 quartos',
  650000,
  'interessado',
  'gerente@imobiliaria.com',
  'Lead de teste criado para debug'
),
(
  (SELECT id FROM auth.users WHERE email = 'gerente@imobiliaria.com' LIMIT 1),
  'Pedro Costa (Teste)',
  '(11) 77777-7777',
  'pedro@teste.com',
  'Casa 5 quartos',
  850000,
  'proposta',
  'gerente@imobiliaria.com',
  'Lead de teste criado para debug'
)
ON CONFLICT DO NOTHING;

-- 6. VERIFICAR RESULTADO
-- =====================================================

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_leads FROM leads;

-- Verificar os leads inseridos
SELECT id, nome, status, corretor, user_id FROM leads;

-- Verificar se as funções estão funcionando
SELECT 
  is_gerente() as eh_gerente,
  is_corretor() as eh_corretor;

-- Testar consulta simples
SELECT * FROM leads LIMIT 5;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
