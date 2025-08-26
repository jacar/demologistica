/*
  # [MIGRATION] Add Email to Profiles Table
  This script adds the missing 'email' column to the 'profiles' table.
  This is necessary to display passenger emails and for other app functions.
  It also updates the user creation trigger to automatically populate this new field.

  ## Query Description:
  - This is a safe, non-destructive operation.
  - It adds a new column and updates a function. No existing data will be lost.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true (by dropping the column and reverting the function)
*/

-- 1. Add the 'email' column to the 'profiles' table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Create a temporary function to populate the new email column for existing users
CREATE OR REPLACE FUNCTION public.backfill_profile_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Required to access auth.users
AS $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;
END;
$$;

-- 3. Run the backfill function once to update existing profiles
SELECT public.backfill_profile_emails();

-- 4. Drop the temporary backfill function as it's no longer needed
DROP FUNCTION public.backfill_profile_emails();

-- 5. Update the user creation function to include email for all new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone, role, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.phone,
    new.raw_user_meta_data->>'role',
    new.email
  );
  RETURN new;
END;
$$;
