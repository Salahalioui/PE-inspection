-- Enable the PostgreSQL extension for managing roles and authentication
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure authenticated users can access necessary schemas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant permissions on the users table
GRANT SELECT ON users TO authenticated;
GRANT UPDATE (email, role, updated_at) ON users TO authenticated;

-- Grant permissions on the teacher_profiles table
GRANT ALL ON teacher_profiles TO authenticated;

-- Grant permissions on the teacher_weekly_schedules table
GRANT ALL ON teacher_weekly_schedules TO authenticated;

-- Create policy to allow reading own profile
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_weekly_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own profile"
ON public.teacher_profiles
FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Allow users to insert own profile"
ON public.teacher_profiles
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Allow users to update own profile"
ON public.teacher_profiles
FOR UPDATE USING (
  auth.uid() = user_id
);

-- Policies for teacher weekly schedules
CREATE POLICY "Allow teachers to read own schedules"
ON public.teacher_weekly_schedules
FOR SELECT USING (
  auth.uid() = teacher_id
);

CREATE POLICY "Allow teachers to insert own schedules"
ON public.teacher_weekly_schedules
FOR INSERT WITH CHECK (
  auth.uid() = teacher_id
);

CREATE POLICY "Allow teachers to update own schedules"
ON public.teacher_weekly_schedules
FOR UPDATE USING (
  auth.uid() = teacher_id
);

CREATE POLICY "Allow teachers to delete own schedules"
ON public.teacher_weekly_schedules
FOR DELETE USING (
  auth.uid() = teacher_id
);

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Function to check if a user is a teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'teacher'
    FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is an inspector
CREATE OR REPLACE FUNCTION is_inspector()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'inspector'
    FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
