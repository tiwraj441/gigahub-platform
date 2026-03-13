// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // note the .js extension

export default async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokens");
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
