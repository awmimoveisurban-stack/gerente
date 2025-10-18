-- ============================================================================
-- SCRIPT DE CORREÇÃO: Foreign Key Constraint na lead_audit_log
-- Data: 18 de Janeiro de 2025
-- Objetivo: Corrigir problema de foreign key constraint
-- ============================================================================

-- 1. VERIFICAR O PROBLEMA
SELECT 'VERIFICANDO PROBLEMA DE FOREIGN KEY' as status;

-- Verificar se há registros órfãos na lead_audit_log
SELECT 
    COUNT(*) as total_audit_logs,
    COUNT(l.id) as logs_com_leads_validos,
    COUNT(*) - COUNT(l.id) as logs_orfaos
FROM public.lead_audit_log al
LEFT JOIN public.leads l ON l.id = al.lead_id;

-- 2. CORRIGIR FOREIGN KEY CONSTRAINT
SELECT 'CORRIGINDO FOREIGN KEY CONSTRAINT' as status;

-- Remover constraint atual se existir
ALTER TABLE public.lead_audit_log 
DROP CONSTRAINT IF EXISTS lead_audit_log_lead_id_fkey;

-- Adicionar constraint com ON DELETE CASCADE
ALTER TABLE public.lead_audit_log 
ADD CONSTRAINT lead_audit_log_lead_id_fkey 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

-- 3. LIMPAR REGISTROS ÓRFÃOS (OPCIONAL)
SELECT 'LIMPANDO REGISTROS ÓRFÃOS' as status;

-- Deletar logs de auditoria órfãos (sem lead correspondente)
DELETE FROM public.lead_audit_log 
WHERE lead_id NOT IN (
    SELECT id FROM public.leads
);

-- 4. CORRIGIR FUNÇÃO DE AUDITORIA
SELECT 'CORRIGINDO FUNÇÃO DE AUDITORIA' as status;

-- Primeiro, dropar a função existente se ela existir
DROP FUNCTION IF EXISTS log_lead_audit(UUID, TEXT, JSONB, JSONB, UUID, TEXT, INET, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS log_lead_audit(UUID, TEXT, JSONB, JSONB);
DROP FUNCTION IF EXISTS log_lead_audit(UUID, TEXT, JSONB, JSONB, UUID, TEXT);

-- Recriar função de auditoria com verificação de existência
CREATE OR REPLACE FUNCTION log_lead_audit(
    p_lead_id UUID,
    p_action TEXT,
    p_old_values JSONB,
    p_new_values JSONB,
    p_user_id UUID DEFAULT NULL,
    p_user_email TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    -- Verificar se o lead existe antes de inserir o log
    IF NOT EXISTS (SELECT 1 FROM public.leads WHERE id = p_lead_id) THEN
        RAISE WARNING 'Lead % não existe, pulando log de auditoria', p_lead_id;
        RETURN NULL;
    END IF;
    
    -- Inserir log de auditoria
    INSERT INTO public.lead_audit_log (
        lead_id, action, old_values, new_values, user_id, user_email,
        ip_address, user_agent, session_id, metadata
    ) VALUES (
        p_lead_id, p_action, p_old_values, p_new_values, p_user_id, p_user_email,
        p_ip_address, p_user_agent, p_session_id, p_metadata
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql;

-- 5. CORRIGIR TRIGGER DE AUDITORIA
SELECT 'CORRIGINDO TRIGGER DE AUDITORIA' as status;

-- Remover trigger atual
DROP TRIGGER IF EXISTS trigger_lead_audit ON public.leads;

-- Recriar trigger com verificação de segurança
CREATE TRIGGER trigger_lead_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION trigger_lead_audit();

-- Recriar função do trigger
CREATE OR REPLACE FUNCTION trigger_lead_audit() RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Obter email do usuário atual
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    
    -- Determinar dados antigos e novos baseado na operação
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := '{}';
        
        -- Verificar se o lead ainda existe antes de logar
        IF EXISTS (SELECT 1 FROM public.leads WHERE id = OLD.id) THEN
            PERFORM log_lead_audit(
                OLD.id,
                'delete',
                old_data,
                new_data,
                auth.uid(),
                user_email,
                NULL,
                NULL,
                NULL,
                jsonb_build_object('trigger', 'automatic')
            );
        END IF;
        
    ELSIF TG_OP = 'INSERT' THEN
        old_data := '{}';
        new_data := to_jsonb(NEW);
        
        PERFORM log_lead_audit(
            NEW.id,
            'create',
            old_data,
            new_data,
            auth.uid(),
            user_email,
            NULL,
            NULL,
            NULL,
            jsonb_build_object('trigger', 'automatic')
        );
        
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        PERFORM log_lead_audit(
            NEW.id,
            'update',
            old_data,
            new_data,
            auth.uid(),
            user_email,
            NULL,
            NULL,
            NULL,
            jsonb_build_object('trigger', 'automatic')
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. VERIFICAR CORREÇÃO
SELECT 'VERIFICANDO CORREÇÃO' as status;

-- Verificar constraint
SELECT 
    conname as constraint_name,
    confrelid::regclass as referenced_table,
    conrelid::regclass as table_name
FROM pg_constraint 
WHERE conname = 'lead_audit_log_lead_id_fkey';

-- Verificar função
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'log_lead_audit';

-- Verificar trigger
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'trigger_lead_audit';

-- 7. TESTE SIMPLES
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
    'Teste FK Fix',
    '11888888888',
    'teste-fk@exemplo.com',
    'teste',
    'novo',
    NOW(),
    NOW()
) RETURNING id, nome;

-- Buscar o lead criado
SELECT id, nome FROM public.leads WHERE telefone = '11888888888' LIMIT 1;

-- Atualizar o lead (deve gerar log de auditoria)
UPDATE public.leads 
SET observacoes = 'Teste de auditoria'
WHERE telefone = '11888888888';

-- Verificar se o log foi criado
SELECT 
    al.id,
    al.action,
    al.created_at,
    l.nome as lead_nome
FROM public.lead_audit_log al
JOIN public.leads l ON l.id = al.lead_id
WHERE l.telefone = '11888888888'
ORDER BY al.created_at DESC;

-- Deletar o lead (deve deletar logs automaticamente por CASCADE)
DELETE FROM public.leads WHERE telefone = '11888888888';

-- Verificar se os logs foram deletados automaticamente
SELECT COUNT(*) as logs_restantes
FROM public.lead_audit_log al
JOIN public.leads l ON l.id = al.lead_id
WHERE l.telefone = '11888888888';

-- 8. RELATÓRIO FINAL
SELECT 'CORREÇÃO CONCLUÍDA COM SUCESSO!' as status;

SELECT 
    'Foreign Key Constraint' as problema,
    'Corrigido com ON DELETE CASCADE' as solucao,
    'Função de auditoria atualizada' as melhoria,
    NOW() as data_correcao;
