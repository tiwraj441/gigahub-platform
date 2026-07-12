import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Fallback if API key is not yet set
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ 
        reply: "Hello! I am the Gigahub AI Agent. (Note to admin: Please set GEMINI_API_KEY in backend/.env to activate my brain!). Would you like to fill out a formal enquiry instead?",
        showEnquiryPrompt: true
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format previous conversation history for Gemini
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    // The core instructions defining how the AI should behave
    const systemInstruction = `You are a helpful, professional AI agent for Gigahub Infosystems. 
You answer questions about B2B laptops, PC mainframes, hardware peripherals, network setups, data backup, and 24/7 IT support. Our address is: House No.-I-10/863, Ground Floor Shop, Gali No.-10, Block I Sangam Vihar, Delhi-110080. Our phone numbers are: +91 9910116971, +91 9910116972. Our emails are: gigahub71@gmail.com, gigahub72@gmail.com.
Be concise, friendly, and professional. 
IMPORTANT: When the user asks about pricing, buying a product, getting a service, or if they agree to proceed after you answer their questions, politely ask them if they would like to submit an enquiry. 
CRITICAL: If the user explicitly agrees to fill out a form or make an enquiry, you MUST include the exact text "[OPEN_ENQUIRY]" anywhere in your response. This trigger word will automatically open the UI form for them.`;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "Understood. I will act as the professional Gigahub AI Agent." }] },
        ...formattedHistory
      ],
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();
    
    // Detect trigger phrase from the LLM
    const showEnquiryPrompt = text.includes("[OPEN_ENQUIRY]");
    const cleanText = text.replace("[OPEN_ENQUIRY]", "").trim();

    res.json({ reply: cleanText, showEnquiryPrompt });

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI failed to respond. Please check your API key." });
  }
});

export default router;
