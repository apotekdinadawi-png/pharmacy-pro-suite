-- Ensure a single active role per user and clean existing duplicates
WITH ranked AS (
  SELECT
    id,
    user_id,
    role,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE role
          WHEN 'apj' THEN 3
          WHEN 'aping' THEN 2
          WHEN 'kasir' THEN 1
          ELSE 0
        END DESC,
        id DESC
    ) AS rn
  FROM public.user_roles
)
DELETE FROM public.user_roles ur
USING ranked r
WHERE ur.id = r.id
  AND r.rn > 1;

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.user_roles'::regclass
      AND conname = 'user_roles_user_id_key'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END
$$;

-- Keep signup role assignment aligned with one-role-per-user model
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

  IF NEW.email = 'apotekdinadawi@gmail.com' THEN
    _role := 'apj';
  ELSIF NEW.raw_user_meta_data->>'role' = 'aping' THEN
    _role := 'aping';
  ELSE
    _role := 'kasir';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role;

  RETURN NEW;
END;
$function$;