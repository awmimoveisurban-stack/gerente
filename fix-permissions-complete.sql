-- =====================================================
-- CORRIGIR PERMISSÕES - SCRIPT COMPLETO
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

-- Remover políticas da tabela tasks
DROP POLICY IF EXISTS "Gerentes can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Corretores can manage own tasks" ON tasks;

-- Remover políticas da tabela visits
DROP POLICY IF EXISTS "Gerentes can manage all visits" ON visits;
DROP POLICY IF EXISTS "Corretores can manage own visits" ON visits;

-- Remover políticas da tabela interactions
DROP POLICY IF EXISTS "Gerentes can manage all interactions" ON interactions;
DROP POLICY IF EXISTS "Corretores can manage own interactions" ON interactions;

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

-- 5. VERIFICAR ESTADO ATUAL
-- =====================================================

-- Verificar se há leads na tabela
SELECT COUNT(*) as total_leads FROM leads;

-- Verificar se há usuários na tabela user_roles
SELECT COUNT(*) as total_user_roles FROM user_roles;

-- Verificar roles do usuário atual
SELECT role, user_id 
FROM user_roles 
WHERE user_id = auth.uid();

-- 6. VERIFICAR USUÁRIO ATUAL E INSERIR DADOS DE TESTE
-- =====================================================

-- Verificar se há usuário autenticado
DO $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
BEGIN
  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  current_user_email := (SELECT email FROM auth.users WHERE id = current_user_id);
  
  -- Verificar se usuário está autenticado
  IF current_user_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuário autenticado. Dados de teste não serão inseridos.';
  ELSE
    RAISE NOTICE 'Usuário autenticado: % (%)', current_user_email, current_user_id;
    
    -- Inserir dados de teste apenas se a tabela estiver vazia
    IF NOT EXISTS (SELECT 1 FROM leads LIMIT 1) THEN
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
        current_user_id,
        'João Silva (Teste)',
        '(11) 99999-9999',
        'joao@teste.com',
        'Apartamento 3 quartos',
        450000,
        'novo',
        current_user_email,
        'Lead de teste criado para debug'
      ),
      (
        current_user_id,
        'Maria Santos (Teste)',
        '(11) 88888-8888',
        'maria@teste.com',
        'Casa 4 quartos',
        650000,
        'interessado',
        current_user_email,
        'Lead de teste criado para debug'
      ),
      (
        current_user_id,
        'Pedro Costa (Teste)',
        '(11) 77777-7777',
        'pedro@teste.com',
        'Casa 5 quartos',
        850000,
        'proposta',
        current_user_email,
        'Lead de teste criado para debug'
      );
      
      RAISE NOTICE '3 leads de teste inseridos com sucesso!';
    ELSE
      RAISE NOTICE 'Tabela leads já possui dados. Nenhum lead de teste inserido.';
    END IF;
  END IF;
END $$;

-- 7. VERIFICAR RESULTADO FINAL
-- =====================================================

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as leads_apos_insercao FROM leads;

-- Verificar se as funções estão funcionando
SELECT 
  auth.uid() as user_id,
  is_gerente() as eh_gerente,
  is_corretor() as eh_corretor;

-- Testar consulta simples
SELECT id, nome, status, corretor FROM leads LIMIT 5;

-- Verificar políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('leads', 'tasks', 'visits', 'interactions')
ORDER BY tablename, policyname;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
