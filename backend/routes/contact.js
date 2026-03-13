// routes/contact.js
import express from "express";
import nodemailer from "nodemailer";
import Enquiry from "../models/Enquiry.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate all fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // 1️⃣ Save enquiry to MongoDB
    const enquiry = await Enquiry.create({ name, phone, email, message });

    // 2️⃣ Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "r16302606@gmail.com",
        pass: "umyo mbiz zpyn ivkf", // Use app password, not Gmail password
      },
    });

    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL,
      to: process.env.CONTACT_EMAIL,
      subject: `New Contact from ${name}`,
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    // 3️⃣ Respond with success
    res.json({ success: true, message: "Message sent successfully!" });

  } catch (err) {
    console.error("Contact POST error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

export default router;
