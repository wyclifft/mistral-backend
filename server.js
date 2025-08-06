const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/chat", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Format your replies using proper spacing and punctuation. Separate paragraphs with newlines (\\n) so the user can easily read your message.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    res.json({ response: reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
