-- Add coluna telefone na tabela profiles (texto, opcional)
-- Executável de forma idempotente

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'telefone'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN telefone text;
  END IF;
END $$;

-- Índice opcional para buscas por telefone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname  = 'idx_profiles_telefone'
  ) THEN
    CREATE INDEX idx_profiles_telefone ON public.profiles ((telefone));
  END IF;
END $$;

