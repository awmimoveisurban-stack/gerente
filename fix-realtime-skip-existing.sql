-- CORRIGIR REALTIME - PULANDO ETAPAS JÁ CONFIGURADAS

-- 1. Verificar status atual da tabela leads na publicação
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'leads';

-- 2. Verificar políticas RLS existentes na tabela leads
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'leads';

-- 3. Criar políticas RLS apenas se não existirem (usando IF NOT EXISTS)
-- Política para SELECT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leads' 
        AND policyname = 'Users can view own leads'
    ) THEN
        CREATE POLICY "Users can view own leads" ON leads
        FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can view own leads" criada';
    ELSE
        RAISE NOTICE 'Política "Users can view own leads" já existe';
    END IF;
END $$;

-- Política para INSERT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leads' 
        AND policyname = 'Users can insert own leads'
    ) THEN
        CREATE POLICY "Users can insert own leads" ON leads
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can insert own leads" criada';
    ELSE
        RAISE NOTICE 'Política "Users can insert own leads" já existe';
    END IF;
END $$;

-- Política para UPDATE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leads' 
        AND policyname = 'Users can update own leads'
    ) THEN
        CREATE POLICY "Users can update own leads" ON leads
        FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can update own leads" criada';
    ELSE
        RAISE NOTICE 'Política "Users can update own leads" já existe';
    END IF;
END $$;

-- Política para DELETE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leads' 
        AND policyname = 'Users can delete own leads'
    ) THEN
        CREATE POLICY "Users can delete own leads" ON leads
        FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can delete own leads" criada';
    ELSE
        RAISE NOTICE 'Política "Users can delete own leads" já existe';
    END IF;
END $$;

-- 4. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

-- 5. Habilitar RLS apenas se não estiver habilitado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'leads' 
        AND schemaname = 'public' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela leads';
    ELSE
        RAISE NOTICE 'RLS já está habilitado na tabela leads';
    END IF;
END $$;

-- 6. Verificar permissões atuais
SELECT 
  grantee, 
  privilege_type, 
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'leads' 
  AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grantee, privilege_type;

-- 7. Conceder permissões (GRANT é idempotente, pode executar sem erro)
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO anon;

-- 8. Verificar se há trigger para updated_at
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'leads';

-- 9. Criar função de trigger se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Criar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'leads' 
        AND trigger_name = 'update_leads_updated_at'
    ) THEN
        CREATE TRIGGER update_leads_updated_at
            BEFORE UPDATE ON leads
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_leads_updated_at criado';
    ELSE
        RAISE NOTICE 'Trigger update_leads_updated_at já existe';
    END IF;
END $$;

-- 11. Verificar estrutura da tabela leads
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 12. Verificar se há dados na tabela
SELECT COUNT(*) as total_leads FROM leads;

-- 13. Verificar configurações da publicação
SELECT 
  pubname,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete,
  pubtruncate
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 14. Verificar slots de replicação
SELECT 
  slot_name,
  plugin,
  slot_type,
  database,
  active,
  xmin,
  catalog_xmin,
  restart_lsn
FROM pg_replication_slots 
WHERE slot_name LIKE '%supabase%';

-- 15. Teste final - verificar se tudo está configurado corretamente
SELECT 
  'Configuração Realtime' as categoria,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'leads'
    ) THEN '✅ Tabela leads está na publicação supabase_realtime'
    ELSE '❌ Tabela leads NÃO está na publicação supabase_realtime'
  END as status

UNION ALL

SELECT 
  'Políticas RLS',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'leads'
    ) THEN '✅ Políticas RLS configuradas para leads'
    ELSE '❌ Políticas RLS NÃO configuradas para leads'
  END

UNION ALL

SELECT 
  'RLS Habilitado',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'leads' 
      AND schemaname = 'public' 
      AND rowsecurity = true
    ) THEN '✅ RLS habilitado na tabela leads'
    ELSE '❌ RLS NÃO habilitado na tabela leads'
  END

UNION ALL

SELECT 
  'Permissões',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.role_table_grants 
      WHERE table_name = 'leads' 
      AND grantee = 'authenticated'
    ) THEN '✅ Permissões concedidas para authenticated'
    ELSE '❌ Permissões NÃO concedidas para authenticated'
  END;





