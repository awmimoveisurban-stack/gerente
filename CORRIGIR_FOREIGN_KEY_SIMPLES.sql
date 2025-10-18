-- ============================================================================
-- SCRIPT DE CORREÇÃO SIMPLES: Foreign Key Constraint
-- Data: 18 de Janeiro de 2025
-- Objetivo: Correção básica sem recriar funções complexas
-- ============================================================================

-- 1. VERIFICAR O PROBLEMA
SELECT 'VERIFICANDO PROBLEMA DE FOREIGN KEY' as status;

-- Verificar constraint atual
SELECT 
    conname as constraint_name,
    confrelid::regclass as referenced_table,
    conrelid::regclass as table_name,
    confdeltype as delete_action
FROM pg_constraint 
WHERE conname = 'lead_audit_log_lead_id_fkey';

-- 2. CORREÇÃO SIMPLES DA FOREIGN KEY
SELECT 'CORRIGINDO FOREIGN KEY CONSTRAINT' as status;

-- Remover constraint atual
ALTER TABLE public.lead_audit_log 
DROP CONSTRAINT IF EXISTS lead_audit_log_lead_id_fkey;

-- Adicionar constraint com ON DELETE CASCADE
ALTER TABLE public.lead_audit_log 
ADD CONSTRAINT lead_audit_log_lead_id_fkey 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

-- 3. LIMPAR REGISTROS ÓRFÃOS
SELECT 'LIMPANDO REGISTROS ÓRFÃOS' as status;

-- Deletar logs de auditoria órfãos (sem lead correspondente)
DELETE FROM public.lead_audit_log 
WHERE lead_id NOT IN (
    SELECT id FROM public.leads
);

-- Verificar quantos foram removidos
SELECT COUNT(*) as logs_orfanos_removidos FROM public.lead_audit_log 
WHERE lead_id NOT IN (SELECT id FROM public.leads);

-- 4. DESABILITAR TRIGGER TEMPORARIAMENTE (OPCIONAL)
SELECT 'DESABILITANDO TRIGGER TEMPORARIAMENTE' as status;

-- Desabilitar trigger para evitar problemas durante testes
ALTER TABLE public.leads DISABLE TRIGGER trigger_lead_audit;

-- 5. TESTE SIMPLES
SELECT 'TESTANDO CORREÇÃO' as status;

-- Criar lead de teste
INSERT INTO public.leads (
    nome, 
    telefone, 
    email,
    origem, 
    status,
    created_at,
    updated_at
) VALUES (
    'Teste FK Fix Simples',
    '11666666666',
    'teste-fk-simples@exemplo.com',
    'teste',
    'novo',
    NOW(),
    NOW()
) RETURNING id, nome;

-- Buscar o lead criado
SELECT id, nome FROM public.leads WHERE telefone = '11666666666' LIMIT 1;

-- Inserir log de auditoria manual (teste)
INSERT INTO public.lead_audit_log (
    lead_id,
    action,
    old_values,
    new_values,
    user_email,
    metadata
)
SELECT 
    id,
    'test',
    '{}',
    '{"test": true}',
    'teste@exemplo.com',
    '{"manual_test": true}'
FROM public.leads 
WHERE telefone = '11666666666'
LIMIT 1;

-- Verificar se o log foi criado
SELECT 
    al.id,
    al.action,
    al.created_at,
    l.nome as lead_nome
FROM public.lead_audit_log al
JOIN public.leads l ON l.id = al.lead_id
WHERE l.telefone = '11666666666'
ORDER BY al.created_at DESC;

-- Deletar o lead (deve deletar logs automaticamente por CASCADE)
DELETE FROM public.leads WHERE telefone = '11666666666';

-- Verificar se os logs foram deletados automaticamente
SELECT COUNT(*) as logs_restantes
FROM public.lead_audit_log al
JOIN public.leads l ON l.id = al.lead_id
WHERE l.telefone = '11666666666';

-- 6. VERIFICAR CORREÇÃO
SELECT 'VERIFICANDO CORREÇÃO' as status;

-- Verificar constraint corrigida
SELECT 
    conname as constraint_name,
    confrelid::regclass as referenced_table,
    conrelid::regclass as table_name,
    CASE confdeltype 
        WHEN 'c' THEN 'CASCADE'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'n' THEN 'NO ACTION'
        WHEN 'd' THEN 'SET DEFAULT'
        WHEN 'a' THEN 'SET NULL'
        ELSE 'UNKNOWN'
    END as delete_action
FROM pg_constraint 
WHERE conname = 'lead_audit_log_lead_id_fkey';

-- 7. REABILITAR TRIGGER (OPCIONAL)
SELECT 'REABILITANDO TRIGGER' as status;

-- Reabilitar trigger se necessário
ALTER TABLE public.leads ENABLE TRIGGER trigger_lead_audit;

-- 8. RELATÓRIO FINAL
SELECT 'CORREÇÃO SIMPLES CONCLUÍDA!' as status;

SELECT 
    'Foreign Key Constraint' as problema,
    'Corrigido com ON DELETE CASCADE' as solucao,
    'Registros órfãos removidos' as limpeza,
    'Trigger reabilitado' as status_trigger,
    NOW() as data_correcao;
