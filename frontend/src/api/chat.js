app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Gigahub AI Assistant.

If user provides contact details like:
Name, Company, Phone, Email, Requirement

Respond in this JSON format:
{
  "reply": "normal message",
  "lead": {
     "name": "",
     "company": "",
     "phone": "",
     "email": "",
     "requirement": ""
  }
}

If no lead info, return:
{
  "reply": "normal message"
}
`
        },
        { role: "user", content: message }
      ]
    });

    const aiResponse = completion.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      return res.json({ reply: aiResponse });
    }

    if (parsed.lead) {

      // Save to MongoDB
      const newLead = new Lead(parsed.lead);
      await newLead.save();

      // Send Email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "New Gigahub Chat Lead 🚀",
        html: `
          <h3>New Lead Details</h3>
          <p><b>Name:</b> ${parsed.lead.name}</p>
          <p><b>Company:</b> ${parsed.lead.company}</p>
          <p><b>Phone:</b> ${parsed.lead.phone}</p>
          <p><b>Email:</b> ${parsed.lead.email}</p>
          <p><b>Requirement:</b> ${parsed.lead.requirement}</p>
        `
      });
    }

    res.json({ reply: parsed.reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Error" });
  }
});