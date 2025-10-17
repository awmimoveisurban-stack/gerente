-- ============================================================================
-- MIGRATION: Campos para Evolution API Auto-Instância
-- Data: 12 de Outubro de 2025
-- Objetivo: Suportar criação/deleção automática de instâncias Evolution API
-- ============================================================================

-- Adicionar campos para Evolution API
ALTER TABLE public.whatsapp_config
ADD COLUMN IF NOT EXISTS evolution_instance_name TEXT,
ADD COLUMN IF NOT EXISTS evolution_instance_token TEXT,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_evolution_instance 
ON public.whatsapp_config(evolution_instance_name)
WHERE evolution_instance_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_whatsapp_config_auto_created 
ON public.whatsapp_config(auto_created)
WHERE auto_created = TRUE;

-- Comentários
COMMENT ON COLUMN public.whatsapp_config.evolution_instance_name IS 'Nome único da instância no Evolution API (ex: gerente_123abc)';
COMMENT ON COLUMN public.whatsapp_config.evolution_instance_token IS 'Token de autenticação da instância (apikey)';
COMMENT ON COLUMN public.whatsapp_config.qr_code IS 'QR Code em base64 (temporário, até conectar)';
COMMENT ON COLUMN public.whatsapp_config.auto_created IS 'TRUE se foi criada automaticamente pelo sistema';
COMMENT ON COLUMN public.whatsapp_config.deleted_at IS 'Data de exclusão (soft delete para auditoria)';

-- Constraint: Apenas uma instância ativa por gerente
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_config_one_active_per_manager
ON public.whatsapp_config(manager_id, provider)
WHERE status = 'authorized' AND deleted_at IS NULL;

-- Verificação
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration executada com sucesso!';
  RAISE NOTICE '✅ Campos adicionados: evolution_instance_name, evolution_instance_token, qr_code, auto_created, deleted_at';
  RAISE NOTICE '✅ Índices criados para performance';
  RAISE NOTICE '✅ Constraint: 1 instância ativa por gerente';
END $$;








