-- Demo seed: creates demo workspace, users, memberships and sample requests.
-- Safe to run multiple times.

-- Workspace
INSERT INTO workspaces (id, name)
VALUES ('ws_demo', 'Demo Workspace')
ON CONFLICT (id) DO NOTHING;

-- Users
INSERT INTO users (id, email, name) VALUES
  ('u_demo', 'demo@demo.com', 'Demo User'),
  ('u_alice', 'alice@demo.com', 'Alice'),
  ('u_bob', 'bob@demo.com', 'Bob')
ON CONFLICT (id) DO NOTHING;

-- Memberships
INSERT INTO memberships (id, user_id, workspace_id, role) VALUES
  ('m_demo', 'u_demo', 'ws_demo', 'ADMIN'),
  ('m_alice', 'u_alice', 'ws_demo', 'MEMBER'),
  ('m_bob', 'u_bob', 'ws_demo', 'MEMBER')
ON CONFLICT (id) DO NOTHING;

-- Sample requests
INSERT INTO requests (id, workspace_id, title, description, status, priority, created_by_id, assignee_id)
VALUES
  ('r1', 'ws_demo', 'Demo Request #1', 'Seeded demo data', 'OPEN', 'MEDIUM', 'u_demo', 'u_demo'),
  ('r2', 'ws_demo', 'Demo Request #2', 'Seeded demo data', 'IN_REVIEW', 'HIGH', 'u_demo', 'u_demo'),
  ('r3', 'ws_demo', 'Demo Request #3', 'Seeded demo data', 'APPROVED', 'LOW', 'u_demo', 'u_demo')
ON CONFLICT (id) DO NOTHING;

-- Comments (optional examples)
INSERT INTO comments (id, request_id, author_id, message)
VALUES
  ('c1', 'r1', 'u_alice', 'Looks good to me'),
  ('c2', 'r2', 'u_bob', 'Please add tests')
ON CONFLICT (id) DO NOTHING;

-- Ensure entity_label exists for audit backfill
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_label TEXT;

-- Backfill audit logs from existing data (requests + comments)
-- Safe to run multiple times.

-- 1) CREATE entries for all requests (if missing)
INSERT INTO audit_logs (
  id, workspace_id, actor_id, action, entity_type, entity_id, entity_label,
  before_json, after_json, created_at
)
SELECT
  'auto_create_' || r.id AS id,
  r.workspace_id,
  COALESCE(r.created_by_id, 'u_demo') AS actor_id,
  'CREATE' AS action,
  'request' AS entity_type,
  r.id AS entity_id,
  r.title AS entity_label,
  NULL::jsonb AS before_json,
  jsonb_build_object(
    'title', r.title,
    'description', r.description,
    'priority', r.priority,
    'status', r.status,
    'assignee_id', r.assignee_id
  ) AS after_json,
  r.created_at AS created_at
FROM requests r
WHERE NOT EXISTS (
  SELECT 1 FROM audit_logs a
  WHERE a.action = 'CREATE'
    AND a.entity_type = 'request'
    AND a.entity_id = r.id
);

-- 2) STATUS_CHANGE entries for requests with status != OPEN (if missing)
INSERT INTO audit_logs (
  id, workspace_id, actor_id, action, entity_type, entity_id, entity_label,
  before_json, after_json, created_at
)
SELECT
  'auto_status_' || r.id AS id,
  r.workspace_id,
  COALESCE(r.assignee_id, r.created_by_id, 'u_demo') AS actor_id,
  'STATUS_CHANGE' AS action,
  'request' AS entity_type,
  r.id AS entity_id,
  r.title AS entity_label,
  jsonb_build_object('status', 'OPEN') AS before_json,
  jsonb_build_object('status', r.status) AS after_json,
  r.updated_at AS created_at
FROM requests r
WHERE r.status IS NOT NULL
  AND r.status <> 'OPEN'
  AND NOT EXISTS (
    SELECT 1 FROM audit_logs a
    WHERE a.action = 'STATUS_CHANGE'
      AND a.entity_type = 'request'
      AND a.entity_id = r.id
  );

-- 3) COMMENT_CREATE entries for all comments (if missing)
INSERT INTO audit_logs (
  id, workspace_id, actor_id, action, entity_type, entity_id, entity_label,
  before_json, after_json, created_at
)
SELECT
  'auto_comment_' || c.id AS id,
  r.workspace_id,
  COALESCE(c.author_id, 'u_demo') AS actor_id,
  'COMMENT_CREATE' AS action,
  'request' AS entity_type,
  r.id AS entity_id,
  r.title AS entity_label,
  NULL::jsonb AS before_json,
  jsonb_build_object('message', c.message, 'comment_id', c.id) AS after_json,
  c.created_at AS created_at
FROM comments c
JOIN requests r ON r.id = c.request_id
WHERE NOT EXISTS (
  SELECT 1 FROM audit_logs a
  WHERE a.action = 'COMMENT_CREATE'
    AND a.entity_type = 'request'
    AND a.after_json->>'comment_id' = c.id
);

-- 4) Fill missing entity_label (fallback)
UPDATE audit_logs a
SET entity_label = r.title
FROM requests r
WHERE a.entity_type = 'request'
  AND a.entity_id = r.id
  AND a.entity_label IS NULL;
