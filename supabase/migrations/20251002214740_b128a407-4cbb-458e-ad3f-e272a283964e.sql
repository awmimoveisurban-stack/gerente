-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('corretor', 'gerente');

-- Criar tabela user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Migrar dados existentes de profiles.cargo para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, cargo::app_role
FROM public.profiles
WHERE cargo IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- RLS policies para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'gerente'));

-- Atualizar RLS policy do whatsapp_config para usar has_role
DROP POLICY IF EXISTS "Only managers can manage whatsapp config" ON public.whatsapp_config;

CREATE POLICY "Only managers can manage whatsapp config"
  ON public.whatsapp_config
  FOR ALL
  USING (public.has_role(auth.uid(), 'gerente'));