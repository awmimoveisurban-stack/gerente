-- =====================================================
-- CONFIGURAÇÃO DE SEGURANÇA - SISTEMA DE CONVITES (CORRIGIDO)
-- =====================================================
-- Este script configura as políticas de segurança para garantir
-- que apenas gerentes possam convidar corretores e que não haja
-- auto-cadastro público.

-- 1. CRIAR FUNÇÕES DE VERIFICAÇÃO DE ROLES
-- =====================================================

-- Função para verificar se o usuário é gerente
CREATE OR REPLACE FUNCTION is_gerente(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'gerente'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é corretor
CREATE OR REPLACE FUNCTION is_corretor(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'corretor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CONFIGURAR RLS PARA TABELA LEADS
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Gerentes can view all leads" ON leads;
DROP POLICY IF EXISTS "Corretores can view own leads" ON leads;
DROP POLICY IF EXISTS "Gerentes can insert leads" ON leads;
DROP POLICY IF EXISTS "Corretores can insert own leads" ON leads;
DROP POLICY IF EXISTS "Gerentes can update all leads" ON leads;
DROP POLICY IF EXISTS "Corretores can update own leads" ON leads;

-- Política para gerentes: podem ver todos os leads
CREATE POLICY "Gerentes can view all leads" ON leads
  FOR SELECT USING (is_gerente());

-- Política para corretores: podem ver apenas seus próprios leads
-- (baseado na coluna 'corretor' que contém o email do corretor)
CREATE POLICY "Corretores can view own leads" ON leads
  FOR SELECT USING (
    is_corretor() AND 
    corretor = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Política para gerentes: podem inserir leads
CREATE POLICY "Gerentes can insert leads" ON leads
  FOR INSERT WITH CHECK (is_gerente());

-- Política para corretores: podem inserir leads atribuídos a eles
CREATE POLICY "Corretores can insert own leads" ON leads
  FOR INSERT WITH CHECK (
    is_corretor() AND 
    corretor = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Política para gerentes: podem atualizar todos os leads
CREATE POLICY "Gerentes can update all leads" ON leads
  FOR UPDATE USING (is_gerente());

-- Política para corretores: podem atualizar apenas seus próprios leads
CREATE POLICY "Corretores can update own leads" ON leads
  FOR UPDATE USING (
    is_corretor() AND 
    corretor = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 3. CONFIGURAR RLS PARA TABELA TASKS
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Gerentes can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Corretores can manage own tasks" ON tasks;

-- Política para gerentes: podem gerenciar todas as tarefas
CREATE POLICY "Gerentes can manage all tasks" ON tasks
  FOR ALL USING (is_gerente());

-- Política para corretores: podem gerenciar apenas suas próprias tarefas
CREATE POLICY "Corretores can manage own tasks" ON tasks
  FOR ALL USING (
    is_corretor() AND 
    user_id = auth.uid()
  );

-- 4. CONFIGURAR RLS PARA TABELA VISITS
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Gerentes can manage all visits" ON visits;
DROP POLICY IF EXISTS "Corretores can manage own visits" ON visits;

-- Política para gerentes: podem gerenciar todas as visitas
CREATE POLICY "Gerentes can manage all visits" ON visits
  FOR ALL USING (is_gerente());

-- Política para corretores: podem gerenciar apenas suas próprias visitas
CREATE POLICY "Corretores can manage own visits" ON visits
  FOR ALL USING (
    is_corretor() AND 
    user_id = auth.uid()
  );

-- 5. CONFIGURAR RLS PARA TABELA INTERACTIONS
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Gerentes can manage all interactions" ON interactions;
DROP POLICY IF EXISTS "Corretores can manage own interactions" ON interactions;

-- Política para gerentes: podem gerenciar todas as interações
CREATE POLICY "Gerentes can manage all interactions" ON interactions
  FOR ALL USING (is_gerente());

-- Política para corretores: podem gerenciar apenas suas próprias interações
CREATE POLICY "Corretores can manage own interactions" ON interactions
  FOR ALL USING (
    is_corretor() AND 
    user_id = auth.uid()
  );

-- 6. CONFIGURAR RLS PARA TABELA USER_ROLES
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;

-- Política para usuários: podem ver apenas seu próprio role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários: podem inserir apenas seu próprio role
CREATE POLICY "Users can insert own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. CONFIGURAR RLS PARA TABELA PROFILES
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Política para usuários: podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários: podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários: podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. CRIAR TABELA DE CONVITES (FUTURA IMPLEMENTAÇÃO)
-- =====================================================

-- Criar tabela para gerenciar convites
CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('corretor')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para tabela de convites
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Política para gerentes: podem gerenciar convites
DROP POLICY IF EXISTS "Gerentes can manage invites" ON invites;
CREATE POLICY "Gerentes can manage invites" ON invites
  FOR ALL USING (is_gerente());

-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION is_gerente(UUID) IS 'Verifica se o usuário é um gerente';
COMMENT ON FUNCTION is_corretor(UUID) IS 'Verifica se o usuário é um corretor';
COMMENT ON TABLE invites IS 'Tabela para gerenciar convites de usuários';
COMMENT ON COLUMN invites.token IS 'Token único para validação do convite';
COMMENT ON COLUMN invites.expires_at IS 'Data de expiração do convite';
COMMENT ON COLUMN invites.used_at IS 'Data em que o convite foi utilizado';

-- 10. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se todas as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_roles', 'leads', 'tasks', 'visits', 'interactions', 'invites')
ORDER BY tablename, policyname;

-- Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('is_gerente', 'is_corretor');

-- =====================================================
-- FIM DA CONFIGURAÇÃO DE SEGURANÇA
-- =====================================================





