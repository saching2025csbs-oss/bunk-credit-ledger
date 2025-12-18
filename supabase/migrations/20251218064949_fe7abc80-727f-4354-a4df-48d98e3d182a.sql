-- Fix the handle_new_user function to properly cast role to app_role enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  
  -- Default role is 'staff', first user gets 'admin' - properly cast to app_role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, (CASE WHEN (SELECT COUNT(*) FROM public.user_roles) = 0 THEN 'admin'::app_role ELSE 'staff'::app_role END));
  
  RETURN NEW;
END;
$$;