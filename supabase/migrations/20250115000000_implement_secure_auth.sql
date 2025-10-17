-- =====================================================
-- MIGRAÇÃO: Sistema de Autenticação Seguro
-- Data: 15 de Janeiro de 2025
-- Objetivo: Implementar sistema de segurança robusto
-- =====================================================

-- =====================================================
-- PARTE 1: CRIAR TABELA DE LOGS DE AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  user_email VARCHAR NOT NULL,
  user_cargo VARCHAR NOT NULL,
  event_type VARCHAR NOT NULL,
  severity VARCHAR NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR,
  user_agent TEXT,
  resource_id VARCHAR,
  resource_type VARCHAR,
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- =====================================================
-- PARTE 2: ATUALIZAR TABELA PROFILES
-- =====================================================

-- Adicionar campos de segurança se não existirem
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_nome VARCHAR UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS senha VARCHAR; -- Será substituído por hash
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_by VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_by VARCHAR;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_login_nome ON profiles(login_nome);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_cargo ON profiles(cargo);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON profiles(ativo);

-- =====================================================
-- PARTE 3: ATUALIZAR TABELA USER_ROLES
-- =====================================================

-- Adicionar campos de auditoria
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS created_by VARCHAR;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- =====================================================
-- PARTE 4: ATUALIZAR TABELA LEADS
-- =====================================================

-- Adicionar campos de auditoria
ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_by VARCHAR;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_by VARCHAR;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_modified_by VARCHAR;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_corretor ON leads(corretor);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- =====================================================
-- PARTE 5: CRIAR TABELA DE SESSÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- =====================================================
-- PARTE 6: CRIAR TABELA DE CONFIGURAÇÕES DE SEGURANÇA
-- =====================================================

CREATE TABLE IF NOT EXISTS security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações padrão
INSERT INTO security_settings (setting_key, setting_value, description) VALUES
('password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_symbols": true}', 'Política de senhas'),
('session_duration', '{"hours": 24}', 'Duração da sessão em horas'),
('max_login_attempts', '{"count": 5}', 'Máximo de tentativas de login'),
('lockout_duration', '{"minutes": 15}', 'Duração do bloqueio em minutos'),
('audit_retention', '{"days": 365}', 'Retenção de logs de auditoria em dias')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- PARTE 7: IMPLEMENTAR RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 8: POLÍTICAS RLS PARA PROFILES
-- =====================================================

-- Política para visualizar próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id::uuid OR 
       EXISTS (
         SELECT 1 FROM user_roles ur 
         WHERE ur.user_id = auth.uid()::text 
         AND ur.role = 'gerente'
       ));

-- Política para atualizar próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id::uuid);

-- Política para gerentes criarem perfis
DROP POLICY IF EXISTS "Managers can create profiles" ON profiles;
CREATE POLICY "Managers can create profiles" 
ON profiles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid()::text 
    AND ur.role = 'gerente'
  )
);

-- =====================================================
-- PARTE 9: POLÍTICAS RLS PARA USER_ROLES
-- =====================================================

-- Política para visualizar roles
DROP POLICY IF EXISTS "Users can view roles" ON user_roles;
CREATE POLICY "Users can view roles" 
ON user_roles FOR SELECT 
USING (auth.uid()::text = user_id OR 
       EXISTS (
         SELECT 1 FROM user_roles ur 
         WHERE ur.user_id = auth.uid()::text 
         AND ur.role = 'gerente'
       ));

-- Política para gerentes gerenciarem roles
DROP POLICY IF EXISTS "Managers can manage roles" ON user_roles;
CREATE POLICY "Managers can manage roles" 
ON user_roles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid()::text 
    AND ur.role = 'gerente'
  )
);

-- =====================================================
-- PARTE 10: POLÍTICAS RLS PARA LEADS
-- =====================================================

-- Política para corretores verem apenas seus leads
DROP POLICY IF EXISTS "Corretores view own leads" ON leads;
CREATE POLICY "Corretores view own leads" 
ON leads FOR SELECT 
USING (
  corretor = (SELECT email FROM profiles WHERE id = auth.uid()) OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid()::text 
    AND ur.role = 'gerente'
  )
);

-- Política para corretores gerenciarem seus leads
DROP POLICY IF EXISTS "Corretores manage own leads" ON leads;
CREATE POLICY "Corretores manage own leads" 
ON leads FOR ALL 
USING (
  corretor = (SELECT email FROM profiles WHERE id = auth.uid()) OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid()::text 
    AND ur.role = 'gerente'
  )
);

-- =====================================================
-- PARTE 11: POLÍTICAS RLS PARA AUDIT_LOGS
-- =====================================================

-- Apenas gerentes podem ver logs de auditoria
DROP POLICY IF EXISTS "Managers can view audit logs" ON audit_logs;
CREATE POLICY "Managers can view audit logs" 
ON audit_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid()::text 
    AND ur.role = 'gerente'
  )
);

-- Sistema pode inserir logs
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" 
ON audit_logs FOR INSERT 
WITH CHECK (true);

-- =====================================================
-- PARTE 12: POLÍTICAS RLS PARA USER_SESSIONS
-- =====================================================

-- Usuários podem gerenciar suas próprias sessões
DROP POLICY IF EXISTS "Users manage own sessions" ON user_sessions;
CREATE POLICY "Users manage own sessions" 
ON user_sessions FOR ALL 
USING (user_id = auth.uid()::text);

-- =====================================================
-- PARTE 13: FUNÇÕES DE UTILIDADE
-- =====================================================

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar logs de auditoria antigos
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
DECLARE
  retention_days INTEGER;
BEGIN
  -- Obter período de retenção das configurações
  SELECT (setting_value->>'days')::INTEGER INTO retention_days
  FROM security_settings 
  WHERE setting_key = 'audit_retention';
  
  -- Usar 365 dias como padrão se não configurado
  IF retention_days IS NULL THEN
    retention_days := 365;
  END IF;
  
  -- Deletar logs antigos
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PARTE 14: TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- =====================================================

-- Função para trigger de auditoria
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir log de auditoria
  INSERT INTO audit_logs (
    user_id,
    user_email,
    user_cargo,
    event_type,
    severity,
    description,
    details,
    resource_id,
    resource_type,
    old_values,
    new_values
  ) VALUES (
    COALESCE(auth.uid()::text, 'system'),
    COALESCE((SELECT email FROM profiles WHERE id = auth.uid()::text), 'system'),
    COALESCE((SELECT role FROM user_roles WHERE user_id = auth.uid()::text), 'system'),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'user_created'
      WHEN TG_OP = 'UPDATE' THEN 'user_updated'
      WHEN TG_OP = 'DELETE' THEN 'user_deleted'
    END,
    'medium',
    'Operação ' || TG_OP || ' na tabela ' || TG_TABLE_NAME,
    '{"table": "' || TG_TABLE_NAME || '", "operation": "' || TG_OP || '"}',
    COALESCE(NEW.id::text, OLD.id::text),
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE '{}' END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE '{}' END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger nas tabelas principais
DROP TRIGGER IF EXISTS profiles_audit_trigger ON profiles;
CREATE TRIGGER profiles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS user_roles_audit_trigger ON user_roles;
CREATE TRIGGER user_roles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- PARTE 15: COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Logs de auditoria para rastrear ações críticas do sistema';
COMMENT ON TABLE user_sessions IS 'Sessões ativas de usuários para controle de acesso';
COMMENT ON TABLE security_settings IS 'Configurações de segurança do sistema';

COMMENT ON COLUMN profiles.login_nome IS 'Nome de login único para corretores';
COMMENT ON COLUMN profiles.senha IS 'Hash da senha do usuário';
COMMENT ON COLUMN profiles.last_login IS 'Timestamp do último login';
COMMENT ON COLUMN profiles.login_attempts IS 'Contador de tentativas de login falhadas';
COMMENT ON COLUMN profiles.locked_until IS 'Timestamp até quando o usuário está bloqueado';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
  'Tabelas criadas:' as status,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('audit_logs', 'user_sessions', 'security_settings')
ORDER BY tablename;

-- Verificar se RLS está ativo
SELECT 
  'RLS Status:' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'user_roles', 'leads', 'audit_logs', 'user_sessions')
ORDER BY tablename;
