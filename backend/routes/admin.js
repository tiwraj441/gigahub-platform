import express from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Enquiry from "../models/Enquiry.js";

const router = express.Router();

// Middleware to verify admin token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};
// Get all enquiries (admin only)
router.get("/enquiries", verifyToken, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch enquiries" });
  }
});

// Admin registration
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const admin = new Admin({ email, password: hash });
    await admin.save();

    res.json({ success: true, admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
