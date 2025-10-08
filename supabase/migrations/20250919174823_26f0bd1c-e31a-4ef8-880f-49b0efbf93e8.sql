-- Enable Row Level Security for auth operations
-- No additional tables needed for basic auth

-- Create a simple function to get current user role (for future use)
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT auth.email()
$$;