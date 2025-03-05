import { createClient } from '@supabase/supabase-js';

// These values should be replaced with environment variables in a production environment
const supabaseUrl = 'https://hdophmxlwlvxzdzltdoz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkb3BobXhsd2x2eHpkemx0ZG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTcxMTYsImV4cCI6MjA1NjY5MzExNn0.em7oKHZrKSXWNBwy5osEO1laknjIjB7ga8RCjoZpfMI';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export type User = {
  id: string;
  email: string;
  role: 'teacher' | 'inspector';
  created_at: string;
  updated_at: string;
};

export type TeacherProfile = {
  id: string;
  user_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  job_title: string;
  level?: string;
  work_institution: string;
  position?: string;
  grade?: string;
  appointment_date?: string;
  confirmation_date?: string;
  marital_status?: string;
  certificate_obtained?: string;
  created_at: string;
  updated_at: string;
};

export type WeeklySchedule = {
  id: string;
  teacher_id: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  subject_class: string;
  created_at: string;
  updated_at: string;
};

export type LessonPlan = {
  id: string;
  teacher_id: string;
  lesson_number: number;
  objectives: string;
  completion_status: boolean;
  remarks?: string;
  created_at: string;
  updated_at: string;
};

export type AbsenceMotif = {
  id: string;
  motif_label_ar: string;
  motif_label_fr: string;
  created_at: string;
  updated_at: string;
};

export type Absence = {
  id: string;
  teacher_id: string;
  absence_date: string;
  absence_motif_id: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
};

export type FieldVisitReport = {
  id: string;
  teacher_id: string;
  inspector_id: string;
  visit_date: string;
  report_content: string;
  additional_comments?: string;
  created_at: string;
  updated_at: string;
};