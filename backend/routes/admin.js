import express from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Enquiry from "../models/Enquiry.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";

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

      // Send response email to the customer
      if (enquiry.email) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "r16302606@gmail.com",
              pass: "umyo mbiz zpyn ivkf",
            },
          });

          await transporter.sendMail({
            from: `"Gigahub Support" <r16302606@gmail.com>`,
            to: enquiry.email,
            subject: `Update regarding your Gigahub Enquiry`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
                <div style="border-bottom: 2px solid #06B6D4; padding-bottom: 15px; margin-bottom: 20px;">
                  <h3 style="color: #0F172A; margin: 0;">Response to Your Enquiry</h3>
                  <p style="color: #06B6D4; font-weight: bold; margin: 5px 0 0 0;">Gigahub Support Team</p>
                </div>
                <p>Hello <strong>${enquiry.name || "Customer"}</strong>,</p>
                <p>An administrator has responded to your enquiry regarding:</p>
                <blockquote style="background: #f8fafc; border-left: 4px solid #cbd5e1; padding: 10px 15px; margin: 15px 0; color: #475569; font-style: italic;">
                  "${enquiry.message}"
                </blockquote>
                
                <div style="background-color: #ecfeff; padding: 18px; border-radius: 8px; border: 1px solid #a5f3fc; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #0891b2; font-size: 1rem;">Admin Response:</h4>
                  <p style="margin: 0; white-space: pre-line; line-height: 1.6; color: #0f172a; font-weight: 500;">${response}</p>
                </div>
                
                <p>You can check the real-time status of your enquiry by logging into your profile dashboard.</p>
                
                <div style="text-align: center; color: #64748b; font-size: 0.8rem; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                  © ${new Date().getFullYear()} Gigahub. All rights reserved.<br>
                  House No.-I-10/863, Ground Floor Shop, Gali No.-10, Block I Sangam Vihar, Delhi-110080
                </div>
              </div>
            `
          });
        } catch (emailErr) {
          console.error("Failed to send reply email:", emailErr);
        }
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

// Delete an enquiry (admin only)
router.delete("/enquiries/:id", verifyToken, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });
    res.json({ success: true, message: "Enquiry deleted successfully!" });
  } catch (err) {
    console.error("Error deleting enquiry:", err);
    res.status(500).json({ error: "Server error deleting enquiry" });
  }
});

export default router;
