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
    const systemInstruction = `You are a helpful, professional AI agent named "avtaar" for Gigahub Infosystems. 
You answer questions about B2B laptops, PC mainframes, hardware peripherals, network setups, data backup, and 24/7 IT support. 
Key Features of Gigahub:
- 4-Hour Response SLA: We guarantee troubleshooting response times within 4 hours to keep your team productive and operational.
- 24/7 Onsite Backup Support: Our certified IT engineers provide round-the-clock onsite assistance for setups, conferences, and exams.
- PAN India Logistics: We offer seamless IT equipment dispatch, deployment, and configuration in NCR, Mumbai, Bangalore, Pune, and nationwide.
- Custom Configurations: You can fully customize your hardware specifications (Processor, RAM, Storage, GPU) when submitting an enquiry.
- Instant Rent Calculator: An interactive rent calculator is available on our homepage to estimate monthly costs based on lease duration and quantity.
Our address is: House No.-I-10/863, Ground Floor Shop, Gali No.-10, Block I Sangam Vihar, Delhi-110080. Our phone numbers are: +91 9910116971, +91 9910116972. Our emails are: gigahub71@gmail.com, gigahub72@gmail.com.
Be concise, friendly, and professional. 
IMPORTANT: If the user asks about pricing, getting a service, or wants to submit details, let them know they can click the service option card buttons in the chat option menu above to trigger an interactive, step-by-step lead enquiry form right inside this chat window! Or, politely ask them if they would like to submit an enquiry.
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
