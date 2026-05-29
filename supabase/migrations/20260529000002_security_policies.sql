-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Base Policy: Workspace membership isolation
-- (Note: Simplified for initial setup, will be refined with roles)
CREATE POLICY "Users can see their own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = id
  ));

CREATE POLICY "Workspace members can see patient data"
  ON patients FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ));
