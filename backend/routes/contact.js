// routes/contact.js
import express from "express";
import nodemailer from "nodemailer";
import Enquiry from "../models/Enquiry.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate all fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const userId = req.user._id;

    // 1️⃣ Save enquiry to MongoDB
    const enquiry = await Enquiry.create({ 
      name, 
      phone, 
      email: email.toLowerCase().trim(), 
      message, 
      userId 
    });

    // 2️⃣ Send email notifications
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "r16302606@gmail.com",
        pass: "umyo mbiz zpyn ivkf",
      },
    });

    // Email to customer
    const userMailOptions = {
      from: `"Gigahub Support" <r16302606@gmail.com>`,
      to: email.toLowerCase().trim(),
      subject: `Enquiry Confirmation - Gigahub IT Services`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
          <div style="text-align: center; border-bottom: 2px solid #06B6D4; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="color: #0F172A; margin: 0;">Enquiry Received</h2>
            <p style="color: #06B6D4; font-weight: bold; margin: 5px 0 0 0;">Gigahub IT Services & Rentals</p>
          </div>
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to Gigahub. We have successfully received your enquiry. Our customer support representative (<strong>avtaar</strong>) or a human expert will contact you shortly.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin-top: 15px;">
            <h4 style="margin-top: 0; color: #0F172A; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Your Enquiry Details:</h4>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0; white-space: pre-line;"><strong>Message:</strong>\n${message}</p>
          </div>
          
          <p style="margin-top: 20px;">If you have any urgent queries, feel free to reply directly to this email or contact us at <strong>+91 9910116971, +91 9910116972</strong>.</p>
          
          <div style="text-align: center; color: #64748b; font-size: 0.8rem; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            © ${new Date().getFullYear()} Gigahub. All rights reserved.<br>
            House No.-I-10/863, Ground Floor Shop, Gali No.-10, Block I Sangam Vihar, Delhi-110080
          </div>
        </div>
      `
    };

    // Email to Admin
    const adminMailOptions = {
      from: `"Gigahub Enquiry" <r16302606@gmail.com>`,
      to: process.env.CONTACT_EMAIL || "gigahub71@gmail.com",
      subject: `New Enquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #06B6D4; border-bottom: 2px solid #06B6D4; padding-bottom: 10px; margin-top: 0;">New Client Enquiry Alert</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin-top: 15px;">
            <strong>Message / Requirements:</strong><br>
            <span style="white-space: pre-line;">${message}</span>
          </div>
          <p style="margin-top: 20px;"><a href="http://localhost:5000/admin.html" style="background: #06B6D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Open Admin Panel</a></p>
        </div>
      `
    };

    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);

    // 3️⃣ Respond with success
    res.json({ success: true, message: "Message sent successfully!", enquiry });

  } catch (err) {
    console.error("Contact POST error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

export default router;
