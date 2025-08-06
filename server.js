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
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        stream: true, // 👈 enable streaming
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ]
      })
    });

    // Set headers to stream
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    response.body.on("data", (chunk) => {
      const lines = chunk.toString().split("\n").filter(line => line.trim());
      for (const line of lines) {
        if (line === "[DONE]") {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }

        try {
          const json = JSON.parse(line.replace(/^data: /, ""));
          const token = json.choices?.[0]?.delta?.content;
          if (token) {
            res.write(`data: ${token}\n\n`);
          }
        } catch (err) {
          console.error("Stream parse error:", err);
        }
      }
    });

    response.body.on("end", () => {
      res.write("data: [DONE]\n\n");
      res.end();
    });

    response.body.on("error", (err) => {
      console.error("Streaming error:", err);
      res.status(500).end();
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(3000, () => console.log("✅ Server is running on port 3000"));
