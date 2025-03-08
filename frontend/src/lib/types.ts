export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface WeeklySchedule {
  id: string;
  teacher_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  subject_class: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfileType {
  id?: string;
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
  created_at?: string;
  updated_at?: string;
}
