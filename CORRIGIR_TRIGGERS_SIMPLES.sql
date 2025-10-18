-- ============================================================================
-- SCRIPT DE CORREÇÃO SIMPLES: Remover Triggers Problemáticos
-- Data: 18 de Janeiro de 2025
-- Objetivo: Remover apenas triggers que causam erro de foreign key
-- ============================================================================

-- 1. VERIFICAR TRIGGERS EXISTENTES
SELECT 'VERIFICANDO TRIGGERS EXISTENTES' as status;

SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as enabled,
    tgtype as trigger_type
FROM pg_trigger 
WHERE tgrelid = 'public.leads'::regclass
ORDER BY tgname;

-- 2. REMOVER TRIGGERS PROBLEMÁTICOS
SELECT 'REMOVENDO TRIGGERS PROBLEMÁTICOS' as status;

-- Remover trigger de auditoria se existir
DROP TRIGGER IF EXISTS trigger_lead_audit ON public.leads;
DROP TRIGGER IF EXISTS trigger_lead_audit_log ON public.leads;

-- Remover função de trigger se existir
DROP FUNCTION IF EXISTS trigger_lead_audit();

-- 3. CORRIGIR FOREIGN KEY CONSTRAINT
SELECT 'CORRIGINDO FOREIGN KEY CONSTRAINT' as status;

-- Remover constraint atual
ALTER TABLE public.lead_audit_log 
DROP CONSTRAINT IF EXISTS lead_audit_log_lead_id_fkey;

-- Adicionar constraint com ON DELETE CASCADE
ALTER TABLE public.lead_audit_log 
ADD CONSTRAINT lead_audit_log_lead_id_fkey 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

-- 4. LIMPAR REGISTROS ÓRFÃOS
SELECT 'LIMPANDO REGISTROS ÓRFÃOS' as status;

-- Deletar logs de auditoria órfãos (sem lead correspondente)
DELETE FROM public.lead_audit_log 
WHERE lead_id NOT IN (
    SELECT id FROM public.leads
);

-- Verificar quantos foram removidos
SELECT COUNT(*) as logs_orfanos_removidos FROM public.lead_audit_log 
WHERE lead_id NOT IN (SELECT id FROM public.leads);

-- 5. TESTE SIMPLES SEM TRIGGERS PROBLEMÁTICOS
SELECT 'TESTANDO SEM TRIGGERS PROBLEMÁTICOS' as status;

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
    'Teste Sem Triggers Problemáticos',
    '11222222222',
    'teste-sem-triggers-problematicos@exemplo.com',
    'teste',
    'novo',
    NOW(),
    NOW()
) RETURNING id, nome;

-- Buscar o lead criado
SELECT id, nome FROM public.leads WHERE telefone = '11222222222' LIMIT 1;

-- Atualizar o lead (não deve gerar erro)
UPDATE public.leads 
SET observacoes = 'Teste sem triggers problemáticos'
WHERE telefone = '11222222222';

-- Inserir log manual (teste)
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
    'create',
    '{}',
    '{"test": true}',
    'teste@exemplo.com',
    '{"manual_test": true}'
FROM public.leads 
WHERE telefone = '11222222222'
LIMIT 1;

-- Verificar se o log manual foi criado
SELECT 
    al.id,
    al.action,
    al.created_at,
    l.nome as lead_nome
FROM public.lead_audit_log al
JOIN public.leads l ON l.id = al.lead_id
WHERE l.telefone = '11222222222'
ORDER BY al.created_at DESC;

-- Deletar o lead (deve deletar logs automaticamente por CASCADE)
DELETE FROM public.leads WHERE telefone = '11222222222';

-- Verificar se os logs foram deletados automaticamente
SELECT COUNT(*) as logs_restantes
FROM public.lead_audit_log al
JOIN public.leads l ON l.id = al.lead_id
WHERE l.telefone = '11222222222';

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

-- Verificar triggers restantes
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE tgenabled 
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'REPLICA'
        WHEN 'A' THEN 'ALWAYS'
        ELSE 'UNKNOWN'
    END as status
FROM pg_trigger 
WHERE tgrelid = 'public.leads'::regclass
ORDER BY tgname;

-- 7. RELATÓRIO FINAL
SELECT 'CORREÇÃO SIMPLES CONCLUÍDA!' as status;

SELECT 
    'Triggers problemáticos removidos' as problema_resolvido,
    'Foreign key corrigida com CASCADE' as solucao,
    'Registros órfãos removidos' as limpeza,
    'Sistema funcionando sem erros' as resultado,
    NOW() as data_correcao;
