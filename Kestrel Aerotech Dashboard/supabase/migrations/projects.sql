-- Allow admins to view all project logs
CREATE POLICY "Admins can view all project logs"
ON project_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN admin_emails a ON p.email = a.email
    WHERE p.id = auth.uid()
  )
);

-- Allow admins to update all project logs
CREATE POLICY "Admins can update all project logs"
ON project_logs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN admin_emails a ON p.email = a.email
    WHERE p.id = auth.uid()
  )
);

-- Allow admins to delete all project logs
CREATE POLICY "Admins can delete all project logs"
ON project_logs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN admin_emails a ON p.email = a.email
    WHERE p.id = auth.uid()
  )
);