
-- Rename enum values: apoteker → apj, asisten_apoteker → aping
ALTER TYPE public.app_role RENAME VALUE 'apoteker' TO 'apj';
ALTER TYPE public.app_role RENAME VALUE 'asisten_apoteker' TO 'aping';

-- Update handle_new_user to also handle the admin case properly
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
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
