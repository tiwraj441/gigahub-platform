// routes/protected.js
import express from "express";
import requireAuth from "../middleware/auth.js"; // note .js extension for ES modules

const router = express.Router();

router.get("/protected", requireAuth, (req, res) => {
   res.json({ success: true, message: `Welcome ${req.user.name}!` });
})

export default router;
