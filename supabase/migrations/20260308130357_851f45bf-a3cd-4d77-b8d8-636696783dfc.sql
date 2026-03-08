
-- Update handle_new_user to insert role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, username, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    CASE WHEN NEW.email = 'apotekdinadawi@gmail.com' THEN 'approved' ELSE 'pending' END
  );

  -- Determine role from metadata or default
  IF NEW.email = 'apotekdinadawi@gmail.com' THEN
    _role := 'apj';
  ELSIF NEW.raw_user_meta_data->>'role' = 'apj' THEN
    _role := 'apj';
  ELSIF NEW.raw_user_meta_data->>'role' = 'aping' THEN
    _role := 'aping';
  ELSE
    _role := 'kasir';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;
