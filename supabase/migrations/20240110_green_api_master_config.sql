-- Tabela para armazenar as credenciais MASTER do Green-API (do dono do sistema)
CREATE TABLE IF NOT EXISTS green_api_master_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_url TEXT NOT NULL DEFAULT 'https://api.green-api.com',
  id_instance TEXT NOT NULL, -- Sua conta master do Green-API
  api_token_instance TEXT NOT NULL, -- Seu token master do Green-API
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apenas um registro (configuração única do sistema)
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_master_config ON green_api_master_config ((id IS NOT NULL));

-- RLS: Apenas admins podem acessar
ALTER TABLE green_api_master_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins acessam master config"
  ON green_api_master_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'gerente'
    )
  );

-- Alterar whatsapp_config para adicionar campos do Green-API
ALTER TABLE whatsapp_config 
ADD COLUMN IF NOT EXISTS green_api_id_instance TEXT,
ADD COLUMN IF NOT EXISTS green_api_token TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'evolution-api';

-- Comentários
COMMENT ON TABLE green_api_master_config IS 'Configuração master do Green-API (credenciais do dono do sistema)';
COMMENT ON COLUMN whatsapp_config.green_api_id_instance IS 'ID da instância criada automaticamente no Green-API';
COMMENT ON COLUMN whatsapp_config.green_api_token IS 'Token da instância criada automaticamente no Green-API';
COMMENT ON COLUMN whatsapp_config.provider IS 'Provedor: evolution-api, twilio, green-api';









