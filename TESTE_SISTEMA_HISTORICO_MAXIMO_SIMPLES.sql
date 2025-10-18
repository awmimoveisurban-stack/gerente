-- ============================================================================
-- SCRIPT DE TESTE MÁXIMO SIMPLES: Sistema de Histórico Completo
-- Data: 18 de Janeiro de 2025
-- Objetivo: Teste básico apenas das conversas (sem auditoria)
-- ============================================================================

-- 1. VERIFICAR ESTRUTURA BÁSICA
SELECT 'VERIFICANDO ESTRUTURA BÁSICA' as status;

-- Verificar se tabela leads existe e tem colunas necessárias
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND table_schema = 'public'
AND column_name IN ('id', 'nome', 'telefone', 'email', 'created_at')
ORDER BY column_name;

-- Verificar se tabela lead_conversations existe
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'lead_conversations' 
AND table_schema = 'public'
AND column_name IN ('id', 'lead_id', 'mensagem', 'canal', 'created_at')
ORDER BY ordinal_position;

-- 2. TESTE BÁSICO DE INSERÇÃO (SEM AUDITORIA)
SELECT 'TESTE BÁSICO DE INSERÇÃO' as status;

-- Limpar dados de teste anteriores (se existirem)
DELETE FROM public.lead_conversations WHERE lead_id IN (
    SELECT id FROM public.leads WHERE telefone = '11444444444'
);
DELETE FROM public.leads WHERE telefone = '11444444444';

-- Criar lead simples
INSERT INTO public.leads (
    nome, 
    telefone, 
    email,
    origem, 
    status,
    created_at,
    updated_at
) VALUES (
    'Cliente Teste Máximo Simples',
    '11444444444',
    'teste-maximo@exemplo.com',
    'teste',
    'novo',
    NOW(),
    NOW()
);

-- Verificar se foi criado
SELECT id, nome, telefone FROM public.leads WHERE telefone = '11444444444';

-- 3. INSERIR CONVERSAS SIMPLES
SELECT 'INSERINDO CONVERSAS SIMPLES' as status;

-- Primeira conversa
INSERT INTO public.lead_conversations (
    lead_id,
    canal,
    mensagem,
    tipo,
    origem,
    created_at
)
SELECT 
    id,
    'whatsapp',
    'Olá, preciso de ajuda com imóveis',
    'entrada',
    'whatsapp',
    NOW() - INTERVAL '2 days'
FROM public.leads 
WHERE telefone = '11444444444'
LIMIT 1;

-- Segunda conversa
INSERT INTO public.lead_conversations (
    lead_id,
    canal,
    mensagem,
    tipo,
    origem,
    created_at
)
SELECT 
    id,
    'whatsapp',
    'Meu orçamento é R$ 300.000',
    'entrada',
    'whatsapp',
    NOW() - INTERVAL '1 day'
FROM public.leads 
WHERE telefone = '11444444444'
LIMIT 1;

-- Terceira conversa
INSERT INTO public.lead_conversations (
    lead_id,
    canal,
    mensagem,
    tipo,
    origem,
    created_at
)
SELECT 
    id,
    'whatsapp',
    'Posso aumentar para R$ 500.000 se for um apartamento melhor',
    'entrada',
    'whatsapp',
    NOW()
FROM public.leads 
WHERE telefone = '11444444444'
LIMIT 1;

-- 4. VERIFICAR CONVERSAS INSERIDAS
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
WHERE l.telefone = '11444444444'
ORDER BY lc.created_at ASC;

-- 5. TESTE DE QUERY COM CONTEXTO
SELECT 'TESTE DE QUERY COM CONTEXTO' as status;

SELECT 
    l.id,
    l.nome,
    l.telefone,
    COUNT(lc.id) as total_conversas,
    MAX(lc.created_at) as ultima_conversa,
    MIN(lc.created_at) as primeira_conversa,
    STRING_AGG(lc.mensagem, ' | ') as todas_mensagens
FROM public.leads l
LEFT JOIN public.lead_conversations lc ON l.id = lc.lead_id
WHERE l.telefone = '11444444444'
GROUP BY l.id, l.nome, l.telefone;

-- 6. TESTE DE PERFORMANCE SIMPLES
SELECT 'TESTE DE PERFORMANCE SIMPLES' as status;

-- Query simples para verificar performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    l.nome,
    COUNT(lc.id) as conversas
FROM public.leads l
LEFT JOIN public.lead_conversations lc ON l.id = lc.lead_id
WHERE l.created_at >= NOW() - INTERVAL '30 days'
GROUP BY l.id, l.nome
LIMIT 10;

-- 7. VERIFICAR ÍNDICES BÁSICOS
SELECT 'VERIFICANDO ÍNDICES BÁSICOS' as status;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'leads' 
AND schemaname = 'public'
ORDER BY indexname;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'lead_conversations' 
AND schemaname = 'public'
ORDER BY indexname;

-- 8. LIMPEZA FINAL
SELECT 'LIMPEZA FINAL' as status;

-- Deletar conversas primeiro (devido à foreign key)
DELETE FROM public.lead_conversations 
WHERE lead_id IN (
    SELECT id FROM public.leads WHERE telefone = '11444444444'
);

-- Deletar lead
DELETE FROM public.leads 
WHERE telefone = '11444444444';

-- Verificar limpeza
SELECT COUNT(*) as leads_restantes FROM public.leads WHERE telefone = '11444444444';
SELECT COUNT(*) as conversas_restantes FROM public.lead_conversations lc
JOIN public.leads l ON l.id = lc.lead_id WHERE l.telefone = '11444444444';

-- 9. RELATÓRIO FINAL
SELECT 'TESTE MÁXIMO SIMPLES CONCLUÍDO!' as status;

SELECT 
    'Sistema de Histórico Completo' as sistema,
    'Teste básico executado com sucesso' as resultado,
    'Apenas conversas testadas (sem auditoria)' as observacao,
    NOW() as data_teste;
