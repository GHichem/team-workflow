import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { pool } from "./db";


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


const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API running on :${port}`));
