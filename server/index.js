import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
// 👇 Add this route
app.get("/", (req, res) => {
  res.send("🚀 Hardware IT Server is running...");
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send({ error: "No token" });
  try {
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).send({ error: "Invalid token" });
  }
}

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = rows[0];
  if (!user) return res.status(401).send({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).send({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.send({ token });
});

app.get("/api/products", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, title, slug, short_desc, price FROM products ORDER BY created_at DESC"
  );
  res.send(rows);
});

app.post("/api/leads", async (req, res) => {
  const { name, email, phone, company, message, interested_in } = req.body;
  const q = `INSERT INTO leads (name, email, phone, company, message, interested_in)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const { rows } = await pool.query(q, [name, email, phone, company, message, interested_in]);
  res.status(201).send(rows[0]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
