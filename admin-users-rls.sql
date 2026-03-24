-- Migration to allow Admins to read all users (bypassing RLS)

-- 1. Create a SECURITY DEFINER function to check if the current user is an admin
-- This function skips RLS and queries the users table directly to check the role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
  RETURN v_role = 'ADMIN';
END;
$$;

-- 2. Drop the existing single "Allow individual read for users" policy
DROP POLICY IF EXISTS "Allow individual read for users" ON public.users;

-- 3. Create the new comprehensive SELECT policy
CREATE POLICY "Allow individuals to read themselves and admins to read all" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() = id OR public.is_admin()
);
