import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const newRoute = `
  app.post("/api/test-chat", async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messaggi non validi" });
      }

      const contents = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const aiClient = getAIClient();
      if (!aiClient) {
        return res.status(401).json({ error: "Chiave API Gemini non configurata." });
      }

      const result = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt || "",
          temperature: 0.7,
        },
      });

      res.json({ text: result.text });
    } catch (error) {
      console.error("Test chat error:", error);
      res.status(500).json({ error: "Errore durante la conversazione con l'IA." });
    }
  });
`;

code = code.replace('  // --- VITE MIDDLEWARE ---', newRoute + '\n  // --- VITE MIDDLEWARE ---');
fs.writeFileSync('server.ts', code);
