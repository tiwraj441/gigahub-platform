// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP || "15m"; // short-lived
const REFRESH_TOKEN_EXP_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || "30", 10);
const REFRESH_TOKEN_EXP = `${REFRESH_TOKEN_EXP_DAYS}d`;



const transporter = nodemailer.createTransport({
  service: "gmail", // or another email service
  auth: {
    user: "r16302606@gmail.com", // your Gmail
    pass:"umyo mbiz zpyn ivkf",  // app password if 2FA enabled
  },
});


// --- JWT helpers ---
function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXP }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXP }
  );
}

// ---------------- REGISTER ----------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password are required." });

    if (!validator.isEmail(email))
      return res.status(400).json({ error: "Invalid email." });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters." });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered." });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash });
    await user.save();

    // create tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({ token: refreshToken, expiresAt });
    await user.save();

    // set refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000,
    });
    

    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials." });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Invalid credentials." });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000);

    // rotate tokens
    user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > new Date());
    user.refreshTokens.push({ token: refreshToken, expiresAt });
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000,
    });
    //new program
    res.json({
  success: true,
  accessToken,
  role: user.role,
  user: { id: user._id, name: user.name, email: user.email }
});


//     res.json({
//       success: true,
//       accessToken,
//       user: { id: user._id, name: user.name, email: user.email },
//     });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//-----------------forget and new pssword ------------------------//

// ---------------- FORGOT PASSWORD ----------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email not found" });

    // Generate a short-lived reset token (15 mins)
    const resetToken = jwt.sign(
      { sub: user._id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: "15m" }
    );

    // Save token in user for verification
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Create reset link (frontend page should handle token)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;

    // Send reset email (example with nodemailer)
    // You need to configure nodemailer with your email service
    
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: "Password Reset Request",
    //   html: `<p>Click this link to reset your password:</p><a href="${resetLink}">Reset Password</a>`
    // });

    await transporter.sendMail({
  from: `"Gigahub Support" <${process.env.CONTACT_EMAIL}>`,
  to: user.email,
  subject: "Password Reset Request",
  html: `
    <p>Hello ${user.name || ""},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>This link will expire in 15 minutes.</p>
  `,
});

    

    res.json({ success: true, message: "Password reset link sent to email", resetLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- RESET PASSWORD ----------------
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: "Token and new password required" });
  if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    const payload = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const user = await User.findById(payload.sub);

    if (!user || user.resetPasswordToken !== token || Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ---------------- REFRESH TOKEN ----------------
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token provided." });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid refresh token." });

    const found = user.refreshTokens.find(rt => rt.token === token && rt.expiresAt > new Date());
    if (!found) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > new Date());
      await user.save();
      return res.status(401).json({ error: "Refresh token revoked." });
    }

    // rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token && rt.expiresAt > new Date());
    const newRefreshToken = signRefreshToken(user);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({ token: newRefreshToken, expiresAt });
    await user.save();

    const newAccessToken = signAccessToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------- LOGOUT ----------------
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(payload.sub);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
          await user.save();
        }
      } catch (e) {
        // ignore invalid token
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "true",
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
