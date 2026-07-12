import express from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Enquiry from "../models/Enquiry.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    let { email, password } = req.body;
    email = email ? email.toLowerCase().trim() : "";
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
    let { email, password } = req.body;
    email = email ? email.toLowerCase().trim() : "";
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

// Respond to an enquiry (admin only)
router.put("/enquiries/:id/respond", verifyToken, async (req, res) => {
  try {
    const { response, status } = req.body;
    if (response === undefined && status === undefined) {
      return res.status(400).json({ error: "Either response or status is required" });
    }

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });

    if (response !== undefined) {
      enquiry.response = response;
      if (status === undefined && enquiry.status !== "resolved") {
        enquiry.status = "resolved";
      }
    }
    
    if (status !== undefined) {
      enquiry.status = status;
    }

    await enquiry.save();

    res.json({ success: true, message: "Enquiry updated successfully!", enquiry });
  } catch (err) {
    console.error("Error responding to enquiry:", err);
    res.status(500).json({ error: "Server error responding to enquiry" });
  }
});

// Generate AI-suggested response for an enquiry (admin only)
router.post("/enquiries/:id/suggest-reply", verifyToken, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ 
        error: "GEMINI_API_KEY is not set in backend/.env. Please configure it to use the AI reply assistant." 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a professional IT support agent from Gigahub IT Services. 
An enquiry has been received from a client with the following details:
Client Name: ${enquiry.name || "Client"}
Client Phone: ${enquiry.phone || "N/A"}
Client Email: ${enquiry.email || "N/A"}
Client Message:
"${enquiry.message}"

Please generate a professional, helpful, and concise response to this client. 
Acknowledge their concern/request, offer a helpful suggestion or step, and tell them that we are looking forward to assisting them.
Keep it strictly under 150 words. Do not include subject lines or greetings like "Dear Admin", generate ONLY the direct body of the email response that the admin can copy and paste to send to the client.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    res.json({ success: true, suggestion: text });
  } catch (err) {
    console.error("AI suggestion error:", err);
    res.status(500).json({ error: "Failed to generate AI suggestion." });
  }
});

export default router;
