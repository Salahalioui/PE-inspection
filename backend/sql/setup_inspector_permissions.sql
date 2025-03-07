-- Add policies to allow inspectors to view teacher data
CREATE POLICY "Inspectors can view all teacher profiles"
ON public.teacher_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
);

CREATE POLICY "Inspectors can view all lesson plans"
ON public.lesson_plans
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
);

CREATE POLICY "Inspectors can view all absences"
ON public.absences
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
);

CREATE POLICY "Inspectors can view all teacher schedules"
ON public.teacher_weekly_schedules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
);

-- Add policy to allow inspectors to view absence motifs
CREATE POLICY "Allow inspectors to view absence motifs"
ON public.absence_motifs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
);
