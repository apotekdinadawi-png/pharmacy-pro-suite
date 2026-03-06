
-- Create blacklisted_emails table
CREATE TABLE IF NOT EXISTS public.blacklisted_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  reason text DEFAULT 'rejected',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blacklisted_emails ENABLE ROW LEVEL SECURITY;

-- Only APJ (super admin) can manage blacklist
CREATE POLICY "APJ can manage blacklist" ON public.blacklisted_emails
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'apj'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'apj'::app_role));

-- Anyone can check blacklist during registration
CREATE POLICY "Anyone can read blacklist" ON public.blacklisted_emails
  FOR SELECT TO anon, authenticated
  USING (true);

-- Update handle_new_user trigger to assign 'apj' role (not 'admin') for master email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    CASE WHEN NEW.email = 'apotekdinadawi@gmail.com' THEN 'approved' ELSE 'pending' END
  );

  IF NEW.email = 'apotekdinadawi@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'apj')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
