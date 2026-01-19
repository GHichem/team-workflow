-- Workspace
INSERT INTO workspaces (id, name)
VALUES ('ws_demo', 'Demo Workspace')
ON CONFLICT (id) DO NOTHING;

-- User
INSERT INTO users (id, email, name)
VALUES ('u_demo', 'demo@demo.com', 'Demo User')
ON CONFLICT (id) DO NOTHING;

-- Membership
INSERT INTO memberships (id, user_id, workspace_id, role)
VALUES ('m_demo', 'u_demo', 'ws_demo', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

-- Requests
INSERT INTO requests (id, workspace_id, title, description, status, priority, created_by_id, assignee_id)
VALUES
  ('r1', 'ws_demo', 'Demo Request #1', 'Seeded demo data', 'OPEN', 'MEDIUM', 'u_demo', 'u_demo'),
  ('r2', 'ws_demo', 'Demo Request #2', 'Seeded demo data', 'IN_REVIEW', 'HIGH', 'u_demo', 'u_demo'),
  ('r3', 'ws_demo', 'Demo Request #3', 'Seeded demo data', 'APPROVED', 'LOW', 'u_demo', 'u_demo')
ON CONFLICT (id) DO NOTHING;
