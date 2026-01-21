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
      `SELECT id, title, status, priority, created_at, updated_at
       FROM requests
       ORDER BY created_at DESC
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
      `SELECT id, created_at, action, entity_type, entity_id, actor_id
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
        ($1, 'ws_demo', $2, $3, 'OPEN', $4, 'u_demo', 'u_demo')`,
      [id, title, description, priority]
    );

    await pool.query(
      `INSERT INTO audit_logs
        (id, workspace_id, actor_id, action, entity_type, entity_id, after_json)
       VALUES
        ($1, 'ws_demo', 'u_demo', 'CREATE', 'request', $2, $3::jsonb)`,
      [
        randomUUID(),
        id,
        JSON.stringify({ title, description, priority, status: "OPEN" }),
      ]
    );

    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create request" });
  }
});


const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API running on :${port}`));
