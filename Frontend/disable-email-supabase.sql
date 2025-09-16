-- Run these SQL commands in your Supabase SQL Editor to disable email confirmation

-- 1. Disable email confirmation requirement
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- 2. Update Supabase auth settings (you need to do this in Supabase Dashboard)
-- Go to Authentication > Settings > Email Auth
-- Turn OFF "Enable email confirmations"
-- Turn OFF "Enable email change confirmations"

-- 3. Set default role for new users
ALTER TABLE auth.users ALTER COLUMN raw_user_meta_data SET DEFAULT '{"role": "student"}'::jsonb;

-- 4. Create a trigger to auto-confirm emails for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-confirm email
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  -- Create profile
  INSERT INTO public.profiles (id, display_name, role, locale, timezone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
    'en',
    'UTC'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();