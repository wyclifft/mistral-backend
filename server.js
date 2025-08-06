const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";

app.post("/api/chat", async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Format your replies clearly with punctuation and spacing."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    // Log full response for debugging
    console.log("OpenRouter response:", JSON.stringify(data, null, 2));

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: "No response from AI." });
    }

    res.json({ response: reply });
  } catch (err) {
    console.error("Backend error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(3000, () => console.log("✅ Server is running on port 3000"));
