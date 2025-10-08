-- CORRIGIR CONFIGURAÇÕES DO REALTIME - SUPABASE

-- 1. Verificar se a tabela leads existe e tem as colunas necessárias
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela leads está na publicação supabase_realtime
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'leads';

-- 3. Adicionar a tabela leads à publicação supabase_realtime (se não estiver)
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- 4. Verificar políticas RLS na tabela leads
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

-- 5. Criar política RLS para a tabela leads (se não existir)
-- Política para SELECT (ler leads do próprio usuário)
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT (criar leads)
DROP POLICY IF EXISTS "Users can insert own leads" ON leads;
CREATE POLICY "Users can insert own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (atualizar leads)
DROP POLICY IF EXISTS "Users can update own leads" ON leads;
CREATE POLICY "Users can update own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE (deletar leads)
DROP POLICY IF EXISTS "Users can delete own leads" ON leads;
CREATE POLICY "Users can delete own leads" ON leads
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Verificar se RLS está habilitado na tabela leads
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';

-- 7. Habilitar RLS na tabela leads (se não estiver habilitado)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 8. Verificar configurações de replicação
SELECT * FROM pg_replication_slots WHERE slot_name LIKE '%supabase%';

-- 9. Verificar se o usuário anônimo tem permissões adequadas
SELECT 
  grantee, 
  privilege_type, 
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'leads' 
  AND grantee IN ('anon', 'authenticated', 'service_role');

-- 10. Conceder permissões necessárias (se não existirem)
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO anon;

-- 11. Verificar se há triggers que podem estar interferindo
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'leads';

-- 12. Verificar configurações de timezone (importante para timestamps)
SHOW timezone;

-- 13. Verificar se a tabela leads tem coluna updated_at com trigger
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
  AND column_name = 'updated_at';

-- 14. Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 15. Verificar se há dados de teste na tabela leads
SELECT COUNT(*) as total_leads FROM leads;

-- 16. Inserir dados de teste se a tabela estiver vazia (opcional)
-- INSERT INTO leads (id, user_id, nome, status, data_entrada, created_at, updated_at)
-- SELECT 
--   gen_random_uuid(),
--   (SELECT id FROM auth.users LIMIT 1),
--   'Lead Teste ' || generate_series,
--   'novo',
--   NOW(),
--   NOW(),
--   NOW()
-- FROM generate_series(1, 3);

-- 17. Verificar se a publicação está funcionando
SELECT 
  pubname,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete,
  pubtruncate
FROM pg_publication 
WHERE pubname = 'supabase_realtime';





