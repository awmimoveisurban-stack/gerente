-- Atualizar função handle_new_user para criar role em user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_cargo text;
BEGIN
  -- Inserir perfil
  INSERT INTO public.profiles (user_id, nome, email, cargo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'cargo', 'corretor')
  );
  
  -- Inserir role na tabela user_roles
  user_cargo := COALESCE(NEW.raw_user_meta_data ->> 'cargo', 'corretor');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_cargo::app_role);
  
  RETURN NEW;
END;
$$;