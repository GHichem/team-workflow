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

app.get("/api/audit", async (req, res) => {
  const limitParam = req.query.limit;
  const limitRaw = Array.isArray(limitParam) ? limitParam[0] : limitParam;
  const limit = Math.max(1, Math.min(200, Number(limitRaw ?? 50) || 50));

  try {
    const result = await pool.query(
      `SELECT id, created_at, action, entity_type, entity_id, entity_label, actor_id, before_json, after_json
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
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
  const assigneeId = req.body?.assignee_id ? String(req.body.assignee_id) : "u_demo";


  const allowedPriorities = new Set(["LOW", "MEDIUM", "HIGH"]);
  if (!title) return res.status(400).json({ error: "title is required" });
  if (!allowedPriorities.has(priority))
    return res.status(400).json({ error: "priority must be LOW|MEDIUM|HIGH" });

  try {
    const id = randomUUID();

    await pool.query(
      `INSERT INTO requests
        (id, workspace_id, title, description, status, priority, created_by_id, assignee_id)
       VALUES
        ($1, 'ws_demo', $2, $3, 'OPEN', $4, 'u_demo', $5)`,
      [id, title, description, priority, assigneeId]
    );

    await pool.query(
  `INSERT INTO audit_logs
    (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, after_json)
   VALUES
    ($1, 'ws_demo', 'u_demo', 'CREATE', 'request', $2, $3, $4::jsonb)`,
  [
    randomUUID(),
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
await pool.query(
  `INSERT INTO audit_logs
    (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, before_json, after_json)
   VALUES
    ($1, 'ws_demo', 'u_demo', 'STATUS_CHANGE', 'request', $2, $3, $4::jsonb, $5::jsonb)`,
  [
    randomUUID(),                 // $1
    id,                           // $2
    beforeTitle,                  // $3
    JSON.stringify({ status: beforeStatus }), // $4
    JSON.stringify({ status }),               // $5
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
       VALUES ($1, $2, 'u_demo', $3)`,
      [commentId, requestId, message]
    );

    // audit entry (user-readable)
    await pool.query(
      `INSERT INTO audit_logs
        (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, after_json)
       VALUES
        ($1, 'ws_demo', 'u_demo', 'COMMENT_CREATE', 'request', $2, $3, $4::jsonb)`,
      [
        randomUUID(),
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
    const result = await pool.query(`SELECT id, name FROM users ORDER BY name ASC`);
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

    await pool.query(
      "UPDATE requests SET assignee_id = $1, updated_at = now() WHERE id = $2",
      [assigneeId, id]
    );

    await pool.query(
      `INSERT INTO audit_logs
        (id, workspace_id, actor_id, action, entity_type, entity_id, entity_label, before_json, after_json)
       VALUES
        ($1, 'ws_demo', 'u_demo', 'ASSIGN_CHANGE', 'request', $2, $3, $4::jsonb, $5::jsonb)`,
      [
        randomUUID(),
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
