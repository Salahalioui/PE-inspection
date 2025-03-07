-- Create a foreign key relationship between field_visit_reports and teacher_profiles
ALTER TABLE field_visit_reports
DROP CONSTRAINT IF EXISTS field_visit_reports_teacher_profile_id_fkey,
ADD CONSTRAINT field_visit_reports_teacher_profile_id_fkey 
FOREIGN KEY (teacher_profile_id) 
REFERENCES teacher_profiles(id) 
ON DELETE CASCADE;

-- Verify that RLS policies are properly set up for field visit reports
CREATE POLICY "Inspectors can create field visit reports"
ON field_visit_reports
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
);

CREATE POLICY "Inspectors can read field visit reports"
ON field_visit_reports
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
);

CREATE POLICY "Inspectors can update their own field visit reports"
ON field_visit_reports
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
  AND inspector_id = auth.uid()
);

CREATE POLICY "Inspectors can delete their own field visit reports"
ON field_visit_reports
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
  AND inspector_id = auth.uid()
);

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_field_visit_reports_teacher_profile 
ON field_visit_reports(teacher_profile_id);
