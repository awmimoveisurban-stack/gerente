-- ============================================================================
-- MIGRATION: Criar tabela lead_conversations para histórico de conversas
-- Data: 18 de Janeiro de 2025
-- Objetivo: Armazenar histórico completo de todas as interações com leads
-- ESTRATÉGIA: Preservar dados existentes + adicionar funcionalidade
-- ============================================================================

-- Criar tabela lead_conversations
CREATE TABLE IF NOT EXISTS public.lead_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    canal TEXT NOT NULL CHECK (canal IN ('whatsapp', 'email', 'telefone', 'site', 'sistema', 'indicacao')),
    mensagem TEXT,
    autor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL DEFAULT 'entrada' CHECK (tipo IN ('entrada', 'saida', 'sistema', 'atualizacao')),
    origem TEXT DEFAULT 'manual',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários das colunas
COMMENT ON TABLE public.lead_conversations IS 'Histórico completo de todas as interações com leads';
COMMENT ON COLUMN public.lead_conversations.lead_id IS 'ID do lead relacionado';
COMMENT ON COLUMN public.lead_conversations.canal IS 'Canal de comunicação (whatsapp, email, telefone, site, sistema, indicacao)';
COMMENT ON COLUMN public.lead_conversations.mensagem IS 'Conteúdo da mensagem ou interação';
COMMENT ON COLUMN public.lead_conversations.autor_id IS 'ID do usuário que fez a interação (NULL para sistema)';
COMMENT ON COLUMN public.lead_conversations.tipo IS 'Tipo de interação (entrada, saida, sistema, atualizacao)';
COMMENT ON COLUMN public.lead_conversations.origem IS 'Origem da interação';
COMMENT ON COLUMN public.lead_conversations.metadata IS 'Dados adicionais em formato JSON';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_lead_conversations_lead_id ON public.lead_conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_conversations_canal ON public.lead_conversations(canal);
CREATE INDEX IF NOT EXISTS idx_lead_conversations_autor_id ON public.lead_conversations(autor_id);
CREATE INDEX IF NOT EXISTS idx_lead_conversations_created_at ON public.lead_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_conversations_tipo ON public.lead_conversations(tipo);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_lead_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_lead_conversations_updated_at ON public.lead_conversations;
CREATE TRIGGER trigger_update_lead_conversations_updated_at
    BEFORE UPDATE ON public.lead_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_conversations_updated_at();

-- Política RLS (Row Level Security) para controle de acesso
ALTER TABLE public.lead_conversations ENABLE ROW LEVEL SECURITY;

-- Política para gerentes: podem ver todas as conversas
DROP POLICY IF EXISTS "Gerentes podem ver todas as conversas" ON public.lead_conversations;
CREATE POLICY "Gerentes podem ver todas as conversas" ON public.lead_conversations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.cargo = 'gerente'
            AND profiles.ativo = true
        )
    );

-- Política para corretores: podem ver apenas conversas de seus leads
DROP POLICY IF EXISTS "Corretores podem ver conversas de seus leads" ON public.lead_conversations;
CREATE POLICY "Corretores podem ver conversas de seus leads" ON public.lead_conversations
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
            AND l.id = lead_conversations.lead_id
        )
    );

-- Política para sistema: pode inserir conversas
DROP POLICY IF EXISTS "Sistema pode inserir conversas" ON public.lead_conversations;
CREATE POLICY "Sistema pode inserir conversas" ON public.lead_conversations
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Mensagem de sucesso
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ TABELA lead_conversations CRIADA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 ESTRUTURA CRIADA:';
    RAISE NOTICE '   ✅ Tabela: lead_conversations';
    RAISE NOTICE '   ✅ Índices: lead_id, canal, autor_id, created_at, tipo';
    RAISE NOTICE '   ✅ Triggers: updated_at automático';
    RAISE NOTICE '   ✅ RLS: Políticas de acesso por cargo';
    RAISE NOTICE '   ✅ Constraints: Foreign keys com CASCADE';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 FUNCIONALIDADES:';
    RAISE NOTICE '   - Histórico completo de conversas';
    RAISE NOTICE '   - Controle de acesso por role';
    RAISE NOTICE '   - Metadados flexíveis em JSON';
    RAISE NOTICE '   - Auditoria temporal';
    RAISE NOTICE '';
END $$;

