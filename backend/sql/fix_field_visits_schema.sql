-- Add reference to teacher_profiles in field_visit_reports
ALTER TABLE field_visit_reports
DROP CONSTRAINT field_visit_reports_teacher_id_fkey,
ADD COLUMN teacher_profile_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE;

-- Update existing records to use teacher_profile_id
UPDATE field_visit_reports fvr
SET teacher_profile_id = tp.id
FROM teacher_profiles tp
WHERE fvr.teacher_id = tp.user_id;

-- Now modify the field_visit_reports table structure
ALTER TABLE field_visit_reports
DROP COLUMN teacher_id,
ALTER COLUMN teacher_profile_id SET NOT NULL;

-- Add policies for the new structure
CREATE POLICY "Inspectors can select field visit reports"
ON field_visit_reports
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'inspector'
  )
);
