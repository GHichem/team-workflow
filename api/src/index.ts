import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

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

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API running on :${port}`));
