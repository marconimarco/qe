import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldRouteStr = `  app.post("/api/test-chat", async (req, res) => {`;
const endIndex = code.indexOf(`  // --- VITE MIDDLEWARE ---`, code.indexOf(oldRouteStr));

if (endIndex === -1) {
  console.log("Could not find end of test-chat route.");
  process.exit(1);
}

const beforeRoute = code.substring(0, code.indexOf(oldRouteStr));
const afterRoute = code.substring(endIndex);

const newRoute = `  app.post("/api/test-chat", async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messaggi non validi" });
      }

      const validMessages = messages.filter(m => m.text && m.text.trim() !== "");
      let firstUserIndex = validMessages.findIndex(m => m.role === "user");
      
      const contents = [];
      if (firstUserIndex !== -1) {
        validMessages.slice(firstUserIndex).forEach(m => {
          contents.push({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          });
        });
      } else {
        // Fallback if somehow there's no user message (shouldn't happen here)
        contents.push({ role: "user", parts: [{ text: "Hello" }] });
      }

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
  });\n\n`;

fs.writeFileSync('server.ts', beforeRoute + newRoute + afterRoute);
console.log("Patched test-chat route!");
