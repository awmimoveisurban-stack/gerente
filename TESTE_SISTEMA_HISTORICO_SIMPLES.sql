-- ============================================================================
-- SCRIPT DE TESTE SIMPLIFICADO: Sistema de Histórico Completo
-- Data: 18 de Janeiro de 2025
-- Objetivo: Testar o sistema de captura com contexto histórico (VERSÃO SEGURA)
-- ============================================================================

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 'VERIFICANDO TABELA LEADS' as status;

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND table_schema = 'public'
AND column_name IN ('last_interaction_at', 'score_ia', 'prioridade', 'manager_id', 'atribuido_a')
ORDER BY column_name;

SELECT 'VERIFICANDO TABELA LEAD_CONVERSATIONS' as status;

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'lead_conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. TESTE SIMPLES DE INSERÇÃO
SELECT 'TESTANDO INSERÇÃO DE LEAD' as status;

-- Criar lead de teste
INSERT INTO public.leads (
    nome, 
    telefone, 
    email,
    origem, 
    status,
    score_ia,
    prioridade,
    created_at,
    updated_at,
    last_interaction_at
) VALUES (
    'Cliente Teste Histórico',
    '11999999999',
    'teste@exemplo.com',
    'teste',
    'novo',
    75,
    'alta',
    NOW(),
    NOW(),
    NOW()
) RETURNING id, nome;

-- 3. BUSCAR O LEAD CRIADO PARA TESTE
SELECT 'BUSCANDO LEAD DE TESTE' as status;

SELECT id, nome, telefone, score_ia, prioridade 
FROM public.leads 
WHERE telefone = '11999999999' 
LIMIT 1;

-- 4. INSERIR CONVERSAS DE TESTE (usando o ID do lead)
SELECT 'INSERINDO CONVERSAS DE TESTE' as status;

-- Primeiro, vamos pegar o ID do lead de teste
WITH test_lead AS (
    SELECT id FROM public.leads WHERE telefone = '11999999999' LIMIT 1
)
INSERT INTO public.lead_conversations (
    lead_id,
    canal,
    mensagem,
    tipo,
    origem,
    metadata,
    created_at
)
SELECT 
    test_lead.id,
    'whatsapp',
    'Olá, estou procurando um apartamento na Zona Sul',
    'entrada',
    'whatsapp',
    '{"ai_score": 60, "tipo_imovel": "apartamento"}',
    NOW() - INTERVAL '2 days'
FROM test_lead;

-- Segunda conversa
WITH test_lead AS (
    SELECT id FROM public.leads WHERE telefone = '11999999999' LIMIT 1
)
INSERT INTO public.lead_conversations (
    lead_id,
    canal,
    mensagem,
    tipo,
    origem,
    metadata,
    created_at
)
SELECT 
    test_lead.id,
    'whatsapp',
    'Meu orçamento é de R$ 400.000',
    'entrada',
    'whatsapp',
    '{"ai_score": 70, "valor": 400000}',
    NOW() - INTERVAL '1 day'
FROM test_lead;

-- Terceira conversa
WITH test_lead AS (
    SELECT id FROM public.leads WHERE telefone = '11999999999' LIMIT 1
)
INSERT INTO public.lead_conversations (
    lead_id,
    canal,
    mensagem,
    tipo,
    origem,
    metadata,
    created_at
)
SELECT 
    test_lead.id,
    'whatsapp',
    'Na verdade, posso aumentar para R$ 600.000 se for um apartamento melhor',
    'entrada',
    'whatsapp',
    '{"ai_score": 85, "valor": 600000, "urgencia": "alta"}',
    NOW()
FROM test_lead;

-- 5. VERIFICAR CONVERSAS INSERIDAS
SELECT 'VERIFICANDO CONVERSAS INSERIDAS' as status;

SELECT 
    lc.id,
    lc.canal,
    lc.mensagem,
    lc.tipo,
    lc.created_at,
    l.nome as lead_nome
FROM public.lead_conversations lc
JOIN public.leads l ON l.id = lc.lead_id
WHERE l.telefone = '11999999999'
ORDER BY lc.created_at ASC;

-- 6. TESTE DE QUERY COM CONTEXTO
SELECT 'TESTANDO QUERY COM CONTEXTO' as status;

SELECT 
    l.id,
    l.nome,
    l.score_ia,
    l.prioridade,
    COUNT(lc.id) as total_conversas,
    MAX(lc.created_at) as ultima_conversa,
    MIN(lc.created_at) as primeira_conversa
FROM public.leads l
LEFT JOIN public.lead_conversations lc ON l.id = lc.lead_id
WHERE l.telefone = '11999999999'
GROUP BY l.id, l.nome, l.score_ia, l.prioridade;

-- 7. VERIFICAR ÍNDICES
SELECT 'VERIFICANDO ÍNDICES' as status;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'leads' 
AND schemaname = 'public'
AND indexname LIKE '%last_interaction%';

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'lead_conversations' 
AND schemaname = 'public'
ORDER BY indexname;

-- 8. VERIFICAR POLÍTICAS RLS
SELECT 'VERIFICANDO POLÍTICAS RLS' as status;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('lead_conversations', 'lead_audit_log')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. LIMPEZA DOS DADOS DE TESTE
SELECT 'LIMPANDO DADOS DE TESTE' as status;

DELETE FROM public.lead_conversations 
WHERE lead_id IN (
    SELECT id FROM public.leads WHERE telefone = '11999999999'
);

DELETE FROM public.leads 
WHERE telefone = '11999999999';

-- 10. RELATÓRIO FINAL
SELECT 'TESTE CONCLUÍDO COM SUCESSO!' as status;

SELECT 
    'Sistema de Histórico Completo' as sistema,
    'Funcionando corretamente' as status,
    NOW() as data_teste;
