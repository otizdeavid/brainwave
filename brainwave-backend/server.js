
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY. Check your backend .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BrainWave backend is running!",
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body ?? {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid message.",
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message.trim(),
      config: {
        systemInstruction:
          "You are BrainWave, a helpful AI assistant. Answer clearly, accurately, and in a friendly manner.",
      },
    });

    return res.json({
      success: true,
      reply: response.text || "I couldn't generate a response. Please try again.",
    });
  } catch (error) {
    const status = error.status;
    const causeCode = error.cause?.code;

    console.error("Gemini API error:", {
      status,
      code: error.code,
      causeCode,
      message: error.message,
    });

    if (status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "Gemini's usage limit has been reached. Please try again later or check your API quota.",
      });
    }

    if (status === 503) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini is temporarily busy. Please try again in a moment.",
      });
    }

    if (!status) {
      return res.status(502).json({
        success: false,
        message:
          "BrainWave couldn't connect to Gemini. Check your internet connection and try again.",
      });
    }

    return res.status(502).json({
      success: false,
      message:
        "BrainWave couldn't complete your request. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`BrainWave backend running at http://localhost:${PORT}`);
});
