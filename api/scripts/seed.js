// Idempotent DB seeding script for demo data
// Loads environment variables from .env when run with `node -r dotenv/config`.
const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/team_workflow' });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // users
    const users = [
      ['u_demo', 'demo@example.com', 'Demo User'],
      ['u_alice', 'alice@example.com', 'Alice'],
      ['u_bob', 'bob@example.com', 'Bob'],
      ['u_charlie', 'charlie@example.com', 'Charlie'],
    ];
    for (const u of users) {
      await client.query('INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING', u);
    }

    // workspace
    await client.query("INSERT INTO workspaces (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", ['ws_demo', 'Demo Workspace']);

    // memberships (idempotent)
    const mems = [
      ['u_demo', 'ADMIN'],
      ['u_alice', 'MEMBER'],
      ['u_bob', 'MEMBER'],
      ['u_charlie', 'MEMBER'],
    ];
    for (const [userId, role] of mems) {
      const r = await client.query('SELECT id FROM memberships WHERE user_id = $1 AND workspace_id = $2', [userId, 'ws_demo']);
      if (r.rowCount === 0) {
        await client.query('INSERT INTO memberships (id, user_id, workspace_id, role) VALUES ($1, $2, $3, $4)', [randomUUID(), userId, 'ws_demo', role]);
      }
    }

    // sample requests and audit/comments (idempotent by title)
    const now = Date.now();
    const samples = [
      { title: 'Add reporting dashboard', creator: 'u_demo', assignee: 'u_alice', daysAgo: 10 },
      { title: 'Improve login UX', creator: 'u_alice', assignee: 'u_bob', daysAgo: 7 },
      { title: 'API rate limit', creator: 'u_bob', assignee: 'u_charlie', daysAgo: 3 },
      { title: 'Mobile layout fixes', creator: 'u_charlie', assignee: 'u_alice', daysAgo: 1 },
      { title: 'Data export feature', creator: 'u_demo', assignee: 'u_bob', daysAgo: 0 },
    ];

    const created = [];
    for (const s of samples) {
      const exists = await client.query('SELECT id FROM requests WHERE title = $1 LIMIT 1', [s.title]);
      if (exists.rowCount === 0) {
        const id = randomUUID();
        const createdAt = new Date(now - s.daysAgo * 24 * 60 * 60 * 1000).toISOString();
        await client.query(
          `INSERT INTO requests (id, workspace_id, title, description, status, priority, created_at, updated_at, created_by_id, assignee_id)
           VALUES ($1, 'ws_demo', $2, $3, 'OPEN', 'MEDIUM', $4, $4, $5, $6)`,
          [id, s.title, s.title + ' — details', createdAt, s.creator, s.assignee]
        );

        await client.query(
          `INSERT INTO audit_logs (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, after_json, created_at)
           VALUES ($1, 'ws_demo', $2, 'CREATE', 'request', $3, $4, $5::jsonb, $6)`,
          [randomUUID(), s.creator, id, s.title, JSON.stringify({ title: s.title, assignee_id: s.assignee }), createdAt]
        );
        created.push({ id, title: s.title });
      }
    }

    // comments
    const commentSamples = [
      { title: 'Add reporting dashboard', author: 'u_bob', message: 'Can we add weekly metrics?', daysAgo: 9 },
      { title: 'Add reporting dashboard', author: 'u_alice', message: 'I will draft an initial design.', daysAgo: 8 },
      { title: 'Improve login UX', author: 'u_demo', message: 'Good idea, add analytics.', daysAgo: 6 },
      { title: 'API rate limit', author: 'u_charlie', message: 'I can help implement rate limits.', daysAgo: 2 },
      { title: 'Data export feature', author: 'u_alice', message: 'Export formats: CSV, JSON.', daysAgo: 0 },
    ];

    for (const c of commentSamples) {
      const reqRes = await client.query('SELECT id, title FROM requests WHERE title = $1 LIMIT 1', [c.title]);
      if (reqRes.rowCount === 0) continue;
      const reqId = reqRes.rows[0].id;
      // avoid duplicating exact same comment by message + author
      const existComment = await client.query('SELECT id FROM comments WHERE request_id = $1 AND author_id = $2 AND message = $3 LIMIT 1', [reqId, c.author, c.message]);
      if (existComment.rowCount === 0) {
        const commentId = randomUUID();
        const createdAt = new Date(now - c.daysAgo * 24 * 60 * 60 * 1000).toISOString();
        await client.query('INSERT INTO comments (id, request_id, author_id, message, created_at) VALUES ($1, $2, $3, $4, $5)', [commentId, reqId, c.author, c.message, createdAt]);
        await client.query(
          `INSERT INTO audit_logs (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, after_json, created_at)
           VALUES ($1, 'ws_demo', $2, 'COMMENT_CREATE', 'request', $3, $4, $5::jsonb, $6)`,
          [randomUUID(), c.author, reqId, reqRes.rows[0].title, JSON.stringify({ message: c.message, comment_id: commentId }), createdAt]
        );
      }
    }

    // commit
    await client.query('COMMIT');
    console.log('Seed completed');
  } catch (err) {
    console.error('Seed failed:', err);
    try { await client.query('ROLLBACK'); } catch (_) {}
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
