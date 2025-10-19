-- ========================================
-- MIGRATION: REMOVER COLUNAS GREEN-API
-- ========================================
-- Remove colunas obsoletas do Green-API da tabela whatsapp_config
-- Mantém apenas colunas Evolution API
-- Data: 2024-10-13

-- 1. Remover colunas Green-API
ALTER TABLE public.whatsapp_config 
DROP COLUMN IF EXISTS green_api_id_instance,
DROP COLUMN IF EXISTS green_api_token;

-- 2. Comentário da tabela (opcional)
COMMENT ON TABLE public.whatsapp_config IS 'Configurações WhatsApp - Apenas Evolution API (Green-API removido)';

-- ✅ Migration concluída!









