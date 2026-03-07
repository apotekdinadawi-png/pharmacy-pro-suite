
-- Enable realtime on profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Fix RLS policies: change 'admin' to 'apj' since APJ is the super admin
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

-- Profiles: APJ can delete
CREATE POLICY "APJ can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'apj'::app_role));

-- Profiles: APJ or self can insert
CREATE POLICY "APJ or self can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR has_role(auth.uid(), 'apj'::app_role));

-- Profiles: APJ can update any profile
CREATE POLICY "APJ can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'apj'::app_role));

-- user_roles: APJ can manage
CREATE POLICY "APJ can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'apj'::app_role));

CREATE POLICY "APJ can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'apj'::app_role));

CREATE POLICY "APJ can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'apj'::app_role));
