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

/*-- Allow admins to view all project logs
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

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

  -- Drop policies that allow users to edit their own logs
DROP POLICY IF EXISTS "Users can delete their own logs" ON public.project_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON public.project_logs;

-- Update the member view policy to allow all authenticated users to view logs
DROP POLICY IF EXISTS "Members can view logs for their projects" ON public.project_logs;

CREATE POLICY "All users can view project logs"
ON public.project_logs
FOR SELECT
TO authenticated
USING (true);

*/