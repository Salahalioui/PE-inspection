-- Supabase SQL Schema for Teacher Management System

-- Users Table (for additional user data, passwords handled by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'inspector')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher Profiles Table
CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  job_title VARCHAR(100) NOT NULL,
  level VARCHAR(100),
  work_institution VARCHAR(255) NOT NULL,
  position VARCHAR(100),
  grade VARCHAR(100),
  appointment_date DATE,
  confirmation_date DATE,
  marital_status VARCHAR(50),
  certificate_obtained VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher Weekly Schedules Table
CREATE TABLE teacher_weekly_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  subject_class VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson Plans Table
CREATE TABLE lesson_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  objectives TEXT NOT NULL,
  completion_status BOOLEAN DEFAULT FALSE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Absence Motifs Table
CREATE TABLE absence_motifs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  motif_label_ar VARCHAR(255) NOT NULL,
  motif_label_fr VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Absences Table
CREATE TABLE absences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  absence_date DATE NOT NULL,
  absence_motif_id UUID NOT NULL REFERENCES absence_motifs(id) ON DELETE RESTRICT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Visit Reports Table
CREATE TABLE field_visit_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inspector_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  report_content TEXT NOT NULL,
  additional_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_weekly_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_motifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_visit_reports ENABLE ROW LEVEL SECURITY;

-- Grant usage on auth schema to postgres role
GRANT USAGE ON SCHEMA auth TO postgres;

-- Create a trigger to automatically insert user data after auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for teacher_profiles table
CREATE POLICY "Teachers can view their own profile" ON teacher_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can create their own profile" ON teacher_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile" ON teacher_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for teacher_weekly_schedules table
CREATE POLICY "Teachers can view their schedules" ON teacher_weekly_schedules
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create their schedules" ON teacher_weekly_schedules
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their schedules" ON teacher_weekly_schedules
  FOR UPDATE USING (auth.uid() = teacher_id);

-- Policies for lesson_plans table
CREATE POLICY "Teachers can view their lesson plans" ON lesson_plans
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create lesson plans" ON lesson_plans
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update lesson plans" ON lesson_plans
  FOR UPDATE USING (auth.uid() = teacher_id);

-- Policies for absences table
CREATE POLICY "Teachers can view their absences" ON absences
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create absences" ON absences
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their absences" ON absences
  FOR UPDATE USING (auth.uid() = teacher_id);

-- Policies for field_visit_reports table
CREATE POLICY "Users can view their visit reports" ON field_visit_reports
  FOR SELECT USING (auth.uid() = teacher_id OR auth.uid() = inspector_id);

CREATE POLICY "Inspectors can create visit reports" ON field_visit_reports
  FOR INSERT WITH CHECK (auth.uid() = inspector_id);

CREATE POLICY "Inspectors can update their reports" ON field_visit_reports
  FOR UPDATE USING (auth.uid() = inspector_id);
