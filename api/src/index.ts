import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { pool } from "./db";
import { randomUUID } from "crypto";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.WEB_ORIGIN || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "X-Actor-Id"],
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api" });
});

app.get("/api/requests", async (_req, res) => {
  try {
    const result = await pool.query(
  `SELECT r.id, r.title, r.description, r.status, r.priority, r.created_at, r.updated_at,
          r.assignee_id, u.name AS assignee_name
   FROM requests r
   LEFT JOIN users u ON u.id = r.assignee_id
   ORDER BY r.created_at DESC
   LIMIT 50`
);
    res.json({ items: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load requests" });
  }
});

function actorIdFromReq(req: any) {
  const h = req.headers?.["x-actor-id"];
  const raw = Array.isArray(h) ? h[0] : h;
  return String(raw ?? "u_demo");
}

async function isAdmin(userId: string) {
  try {
    const r = await pool.query(
      "SELECT role FROM memberships WHERE user_id = $1 AND workspace_id = 'ws_demo'",
      [userId]
    );
    const role = r?.rows?.[0]?.role ?? "";
    return (r?.rowCount ?? 0) > 0 && role === "ADMIN";
  } catch {
    return false;
  }
}

app.get("/api/audit", async (req, res) => {
  const limitParam = req.query.limit;
  const limitRaw = Array.isArray(limitParam) ? limitParam[0] : limitParam;
  const limit = Math.max(1, Math.min(200, Number(limitRaw ?? 50) || 50));
  const offsetParam = req.query.offset;
  const offsetRaw = Array.isArray(offsetParam) ? offsetParam[0] : offsetParam;
  const offset = Math.max(0, Number(offsetRaw ?? 0) || 0);

  try {
    // enforce admin-only access to audit logs
    const actorId = actorIdFromReq(req);
    const mem = await pool.query(
      "SELECT role FROM memberships WHERE user_id = $1 AND workspace_id = 'ws_demo'",
      [actorId]
    );
    if (mem.rowCount === 0 || (mem.rows[0].role ?? "") !== "ADMIN") {
      return res.status(403).json({ error: "forbidden" });
    }

    // optional filters
    const actorFilter = req.query.actor_id ? String(Array.isArray(req.query.actor_id) ? req.query.actor_id[0] : req.query.actor_id) : null;
    const actionFilter = req.query.action ? String(Array.isArray(req.query.action) ? req.query.action[0] : req.query.action) : null;
    const q = req.query.q ? String(Array.isArray(req.query.q) ? req.query.q[0] : req.query.q) : null;

    const where: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (actorFilter) {
      where.push(`actor_id = $${idx++}`);
      params.push(actorFilter);
    }
    if (actionFilter) {
      where.push(`action = $${idx++}`);
      params.push(actionFilter);
    }
    if (q) {
      where.push(`(entity_label ILIKE $${idx} OR entity_type ILIKE $${idx})`);
      params.push(`%${q}%`);
      idx += 1;
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `SELECT id, created_at, action, entity_type, entity_id, entity_label, actor_id, before_json, after_json
       FROM audit_logs
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);
    res.json({ items: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load audit logs" });
  }
});

app.post("/api/requests", async (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  const description = req.body?.description ? String(req.body.description) : null;
  const priority = String(req.body?.priority ?? "MEDIUM").toUpperCase();
  const actorId = actorIdFromReq(req);
  const assigneeId = req.body?.assignee_id ? String(req.body.assignee_id) : actorId;


  const allowedPriorities = new Set(["LOW", "MEDIUM", "HIGH"]);
  if (!title) return res.status(400).json({ error: "title is required" });
  if (!allowedPriorities.has(priority))
    return res.status(400).json({ error: "priority must be LOW|MEDIUM|HIGH" });

  try {
    // Only admins may create requests at all
    const actorIsAdmin = await isAdmin(actorId);
    if (!actorIsAdmin) return res.status(403).json({ error: "forbidden" });
    // Only allow assigning to someone else when the actor is an admin
    if (assigneeId !== actorId) {
      const ok = await isAdmin(actorId);
      if (!ok) return res.status(403).json({ error: "forbidden" });
    }
    const id = randomUUID();

    await pool.query(
      `INSERT INTO requests
        (id, workspace_id, title, description, status, priority, created_by_id, assignee_id)
       VALUES
        ($1, 'ws_demo', $2, $3, 'OPEN', $4, $5, $6)`,
      [id, title, description, priority, actorId, assigneeId]
    );

    await pool.query(
  `INSERT INTO audit_logs
    (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, after_json)
   VALUES
    ($1, 'ws_demo', $2, 'CREATE', 'request', $3, $4, $5::jsonb)`,
  [
    randomUUID(),
    actorId,
    id,
    title, // <-- entity_label
    JSON.stringify({ title, description, priority, status: "OPEN", assignee_id: assigneeId }),
  ]
);

    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create request" });
  }
});

app.patch("/api/requests/:id/status", async (req, res) => {
  const id = String(req.params.id);
  const status = String(req.body?.status ?? "").toUpperCase();

  const allowed = new Set(["OPEN", "IN_REVIEW", "APPROVED", "REJECTED"]);
  if (!allowed.has(status)) {
    return res.status(400).json({ error: "status must be OPEN|IN_REVIEW|APPROVED|REJECTED" });
  }

  try {
    // 1) read current status (before)
    const beforeRes = await pool.query(
      "SELECT title, status FROM requests WHERE id = $1",
      [id]
    );
    if (beforeRes.rowCount === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    const beforeStatus = beforeRes.rows[0].status;
    const beforeTitle = beforeRes.rows[0].title;


    // 2) update
    await pool.query(
      "UPDATE requests SET status = $1, updated_at = now() WHERE id = $2",
      [status, id]
    );

    // 3) audit diff (before/after)
    const actorId = actorIdFromReq(req);
await pool.query(
  `INSERT INTO audit_logs
    (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, before_json, after_json)
   VALUES
    ($1, 'ws_demo', $2, 'STATUS_CHANGE', 'request', $3, $4, $5::jsonb, $6::jsonb)`,
  [
    randomUUID(),                 // $1
    actorId,                      // $2
    id,                           // $3
    beforeTitle,                  // $4
    JSON.stringify({ status: beforeStatus }), // $5
    JSON.stringify({ status }),               // $6
  ]
);



    res.json({ ok: true, before: beforeStatus, after: status });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.get("/api/requests/:id", async (req, res) => {
  const id = String(req.params.id);

  try {
    const result = await pool.query(
      `SELECT id, title, description, status, priority, created_at, updated_at
       FROM requests
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({ item: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load request" });
  }
});

app.get("/api/requests/:id/comments", async (req, res) => {
  const requestId = String(req.params.id);

  try {
    const result = await pool.query(
      `SELECT id, request_id, author_id, message, created_at
       FROM comments
       WHERE request_id = $1
       ORDER BY created_at ASC`,
      [requestId]
    );

    res.json({ items: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load comments" });
  }
});

app.post("/api/requests/:id/comments", async (req, res) => {
  const requestId = String(req.params.id);
  const message = String(req.body?.message ?? "").trim();

  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    // make sure request exists and get title for entity_label
    const reqRes = await pool.query(
      "SELECT title FROM requests WHERE id = $1",
      [requestId]
    );
    if (reqRes.rowCount === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    const requestTitle = reqRes.rows[0].title;

    const commentId = randomUUID();

    await pool.query(
      `INSERT INTO comments (id, request_id, author_id, message)
       VALUES ($1, $2, $3, $4)`,
      [commentId, requestId, actorIdFromReq(req), message]
    );

    // audit entry (user-readable)
    await pool.query(
      `INSERT INTO audit_logs
        (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, after_json)
       VALUES
         ($1, 'ws_demo', $2, 'COMMENT_CREATE', 'request', $3, $4, $5::jsonb)`,
      [
        randomUUID(),
        actorIdFromReq(req),
        requestId,
        requestTitle,
        JSON.stringify({ message }),
      ]
    );

    res.status(201).json({ id: commentId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    // optional query `q` for partial matching against id or name
    const q = _req.query.q ? String(Array.isArray(_req.query.q) ? _req.query.q[0] : _req.query.q) : null;
    let result;
    if (q) {
      const like = `%${q}%`;
      result = await pool.query(`SELECT id, name FROM users WHERE id ILIKE $1 OR name ILIKE $1 ORDER BY name ASC`, [like]);
    } else {
      result = await pool.query(`SELECT id, name FROM users ORDER BY name ASC`);
    }
    res.json({ items: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load users" });
  }
});


app.patch("/api/requests/:id/assignee", async (req, res) => {
  const id = String(req.params.id);
  const assigneeId = String(req.body?.assignee_id ?? "").trim();
  if (!assigneeId) return res.status(400).json({ error: "assignee_id is required" });

  try {
    const beforeRes = await pool.query(
      "SELECT title, assignee_id FROM requests WHERE id = $1",
      [id]
    );
    if (beforeRes.rowCount === 0) return res.status(404).json({ error: "Request not found" });

    const beforeTitle = beforeRes.rows[0].title;
    const beforeAssignee = beforeRes.rows[0].assignee_id;

    const actor = actorIdFromReq(req);
    // Only admins may reassign to someone else
    if (actor !== assigneeId) {
      const ok = await isAdmin(actor);
      if (!ok) return res.status(403).json({ error: "forbidden" });
    }

    await pool.query(
      "UPDATE requests SET assignee_id = $1, updated_at = now() WHERE id = $2",
      [assigneeId, id]
    );

    await pool.query(
      `INSERT INTO audit_logs
        (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, before_json, after_json)
       VALUES
        ($1, 'ws_demo', $2, 'ASSIGN_CHANGE', 'request', $3, $4, $5::jsonb, $6::jsonb)`,
      [
        randomUUID(),
        actorIdFromReq(req),
        id,
        beforeTitle,
        JSON.stringify({ assignee_id: beforeAssignee }),
        JSON.stringify({ assignee_id: assigneeId }),
      ]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update assignee" });
  }
});





const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API running on :${port}`));
