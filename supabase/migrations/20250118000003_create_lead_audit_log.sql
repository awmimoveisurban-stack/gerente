-- ============================================================================
-- MIGRATION: Criar tabela lead_audit_log para auditoria completa
-- Data: 18 de Janeiro de 2025
-- Objetivo: Registrar todas as ações realizadas nos leads para auditoria
-- ESTRATÉGIA: Sistema de auditoria completo e rastreável
-- ============================================================================

-- Criar tabela lead_audit_log
CREATE TABLE IF NOT EXISTS public.lead_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN (
        'create', 'update', 'delete', 'assign', 'status_change', 
        'conversation_add', 'conversation_update', 'conversation_delete',
        'import', 'export', 'merge', 'duplicate_found'
    )),
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários das colunas
COMMENT ON TABLE public.lead_audit_log IS 'Log de auditoria completo para todas as ações em leads';
COMMENT ON COLUMN public.lead_audit_log.lead_id IS 'ID do lead que foi modificado';
COMMENT ON COLUMN public.lead_audit_log.action IS 'Tipo de ação realizada';
COMMENT ON COLUMN public.lead_audit_log.old_values IS 'Valores anteriores (JSON)';
COMMENT ON COLUMN public.lead_audit_log.new_values IS 'Valores novos (JSON)';
COMMENT ON COLUMN public.lead_audit_log.user_id IS 'ID do usuário que fez a ação';
COMMENT ON COLUMN public.lead_audit_log.user_email IS 'Email do usuário (backup)';
COMMENT ON COLUMN public.lead_audit_log.ip_address IS 'IP de origem da ação';
COMMENT ON COLUMN public.lead_audit_log.user_agent IS 'User agent do navegador';
COMMENT ON COLUMN public.lead_audit_log.session_id IS 'ID da sessão';
COMMENT ON COLUMN public.lead_audit_log.metadata IS 'Dados adicionais da ação';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_lead_audit_log_lead_id ON public.lead_audit_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_audit_log_action ON public.lead_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_lead_audit_log_user_id ON public.lead_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_audit_log_created_at ON public.lead_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_audit_log_user_email ON public.lead_audit_log(user_email);

-- Criar índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_lead_audit_log_lead_action_date ON public.lead_audit_log(lead_id, action, created_at DESC);

-- Política RLS (Row Level Security) para controle de acesso
ALTER TABLE public.lead_audit_log ENABLE ROW LEVEL SECURITY;

-- Política para gerentes: podem ver todos os logs
CREATE POLICY "Gerentes podem ver todos os logs" ON public.lead_audit_log
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.cargo = 'gerente'
            AND profiles.ativo = true
        )
    );

-- Política para corretores: podem ver apenas logs de seus leads
CREATE POLICY "Corretores podem ver logs de seus leads" ON public.lead_audit_log
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.leads l ON (
                l.user_id = p.id OR 
                l.atribuido_a = p.id OR 
                l.corretor = p.email
            )
            WHERE p.id = auth.uid() 
            AND p.cargo = 'corretor'
            AND p.ativo = true
            AND l.id = lead_audit_log.lead_id
        )
    );

-- Política para sistema: pode inserir logs
CREATE POLICY "Sistema pode inserir logs" ON public.lead_audit_log
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Função para registrar auditoria automaticamente
CREATE OR REPLACE FUNCTION log_lead_audit(
    p_lead_id UUID,
    p_action TEXT,
    p_old_values JSONB DEFAULT '{}',
    p_new_values JSONB DEFAULT '{}',
    p_user_id UUID DEFAULT NULL,
    p_user_email TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO public.lead_audit_log (
        lead_id, action, old_values, new_values, user_id, user_email,
        ip_address, user_agent, session_id, metadata
    ) VALUES (
        p_lead_id, p_action, p_old_values, p_new_values, p_user_id, p_user_email,
        p_ip_address, p_user_agent, p_session_id, p_metadata
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION log_lead_audit IS 'Função para registrar auditoria de ações em leads';

-- Trigger para auditoria automática na tabela leads
CREATE OR REPLACE FUNCTION trigger_lead_audit()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    user_email TEXT;
BEGIN
    -- Obter email do usuário atual
    SELECT email INTO user_email 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Converter dados para JSON
    IF TG_OP = 'INSERT' THEN
        new_data := to_jsonb(NEW);
        PERFORM log_lead_audit(
            NEW.id,
            'create',
            '{}',
            new_data,
            auth.uid(),
            user_email,
            NULL, -- IP será preenchido pela aplicação
            NULL, -- User agent será preenchido pela aplicação
            NULL, -- Session ID será preenchido pela aplicação
            jsonb_build_object('trigger', 'automatic')
        );
        RETURN NEW;
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
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        PERFORM log_lead_audit(
            OLD.id,
            'delete',
            old_data,
            '{}',
            auth.uid(),
            user_email,
            NULL,
            NULL,
            NULL,
            jsonb_build_object('trigger', 'automatic')
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger na tabela leads
DROP TRIGGER IF EXISTS trigger_lead_audit_log ON public.leads;
CREATE TRIGGER trigger_lead_audit_log
    AFTER INSERT OR UPDATE OR DELETE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION trigger_lead_audit();

-- Trigger para auditoria na tabela lead_conversations
CREATE OR REPLACE FUNCTION trigger_conversation_audit()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    user_email TEXT;
BEGIN
    -- Obter email do usuário atual
    SELECT email INTO user_email 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        new_data := to_jsonb(NEW);
        PERFORM log_lead_audit(
            NEW.lead_id,
            'conversation_add',
            '{}',
            new_data,
            auth.uid(),
            user_email,
            NULL,
            NULL,
            NULL,
            jsonb_build_object('conversation_id', NEW.id, 'trigger', 'automatic')
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        PERFORM log_lead_audit(
            NEW.lead_id,
            'conversation_update',
            old_data,
            new_data,
            auth.uid(),
            user_email,
            NULL,
            NULL,
            NULL,
            jsonb_build_object('conversation_id', NEW.id, 'trigger', 'automatic')
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        PERFORM log_lead_audit(
            OLD.lead_id,
            'conversation_delete',
            old_data,
            '{}',
            auth.uid(),
            user_email,
            NULL,
            NULL,
            NULL,
            jsonb_build_object('conversation_id', OLD.id, 'trigger', 'automatic')
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger na tabela lead_conversations
DROP TRIGGER IF EXISTS trigger_conversation_audit_log ON public.lead_conversations;
CREATE TRIGGER trigger_conversation_audit_log
    AFTER INSERT OR UPDATE OR DELETE ON public.lead_conversations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_conversation_audit();

-- Mensagem de sucesso
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ TABELA lead_audit_log CRIADA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 ESTRUTURA CRIADA:';
    RAISE NOTICE '   ✅ Tabela: lead_audit_log';
    RAISE NOTICE '   ✅ Índices: lead_id, action, user_id, created_at';
    RAISE NOTICE '   ✅ Função: log_lead_audit()';
    RAISE NOTICE '   ✅ Triggers: Automáticos em leads e conversations';
    RAISE NOTICE '   ✅ RLS: Políticas de acesso por cargo';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 FUNCIONALIDADES:';
    RAISE NOTICE '   - Auditoria automática de todas as ações';
    RAISE NOTICE '   - Rastreamento de IP e User Agent';
    RAISE NOTICE '   - Histórico completo de mudanças';
    RAISE NOTICE '   - Controle de acesso por role';
    RAISE NOTICE '';
END $$;
