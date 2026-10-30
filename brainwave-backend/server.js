
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { performance } from "node:perf_hooks";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const MAX_MESSAGE_LENGTH = 8000;
const GROQ_TIMEOUT_MS = 8000;
const GEMINI_TIMEOUT_MS = 10000;

const SYSTEM_INSTRUCTION =
  "You are BrainWave, a helpful AI assistant. Answer clearly, accurately, and in a friendly manner.";

if (!process.env.GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY. Check brainwave-backend/.env");
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: GROQ_TIMEOUT_MS,
  maxRetries: 0,
});

const geminiApiKey = process.env.GEMINI_API_KEY;

const gemini = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        timeout: GEMINI_TIMEOUT_MS,
      },
    })
  : null;

if (!gemini) {
  console.warn(
    "GEMINI_API_KEY is missing. Automatic Gemini fallback is disabled."
  );
}

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BrainWave backend is running!",
  });
});

function normalizeHistory(messages, currentMessage) {
  if (!Array.isArray(messages)) {
    return [{ role: "user", content: currentMessage }];
  }

  const history = messages
    .filter(
      (item) =>
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string" &&
        item.content.trim()
    )
    .slice(-20)
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }));

  // Ensure the current question is present exactly once at the end.
  if (
    history.length === 0 ||
    history[history.length - 1].role !== "user" ||
    history[history.length - 1].content !== currentMessage
  ) {
    history.push({
      role: "user",
      content: currentMessage,
    });
  }

  return history;
}

function isRetryableProviderError(error) {
  const status = Number(error?.status ?? error?.response?.status);

  // Do not retry invalid credentials, missing models, or invalid requests.
  if ([400, 401, 403, 404, 422].includes(status)) {
    return false;
  }

  // Rate limits, temporary server errors, and gateway failures.
  if (status === 408 || status === 409 || status === 429 || status >= 500) {
    return true;
  }

  // Connection failures and timeouts may not have an HTTP status.
  if (!status) {
    return true;
  }

  return false;
}

async function generateWithGroq(history) {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      ...history,
    ],
    max_tokens: 1024,
  });

  const reply = completion.choices[0]?.message?.content;

  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("Groq returned an empty response.");
  }

  return reply.trim();
}

async function generateWithGemini(history) {
  if (!gemini) {
    throw new Error("Gemini fallback is not configured.");
  }

  const response = await gemini.models.generateContent({
    model: "gemini-3.8-flash",
    contents: history.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    })),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      maxOutputTokens: 1024,
    },
  });

  const reply = response.text;

  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  return reply.trim();
}

app.post("/api/chat", async (req, res) => {
  const startedAt = performance.now();
  const { message, messages } = req.body ?? {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid message.",
    });
  }

  const prompt = message.trim();

  if (prompt.length > MAX_MESSAGE_LENGTH) {
    return res.status(413).json({
      success: false,
      message: "Your message is too long. Please shorten it and try again.",
    });
  }

  const history = normalizeHistory(messages, prompt);

  let provider = "Groq";

  try {
    let reply;

    try {
      reply = await generateWithGroq(history);
    } catch (groqError) {
      console.error("Groq request failed:", {
        status: groqError.status,
        code: groqError.code,
        message: groqError.message,
        durationMs: Math.round(performance.now() - startedAt),
      });

      if (!gemini || !isRetryableProviderError(groqError)) {
        throw groqError;
      }

      provider = "Gemini";
      console.warn("Switching to Gemini fallback.");
      reply = await generateWithGemini(history);
    }

    const durationMs = Math.round(performance.now() - startedAt);

    console.log("Chat performance:", {
      provider,
      durationMs,
      promptChars: prompt.length,
    });

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);

    console.error("AI request failed:", {
      provider,
      status: error.status,
      code: error.code,
      message: error.message,
      durationMs,
    });

    const status = Number(error?.status ?? error?.response?.status);

    if (status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "BrainWave's AI providers have reached a usage limit. Please try again shortly.",
      });
    }

    if (
      error.name === "APIConnectionTimeoutError" ||
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      return res.status(504).json({
        success: false,
        message:
          "BrainWave's AI providers took too long to respond. Please try again.",
      });
    }

    if (status === 401 || status === 403 || status === 404) {
      return res.status(502).json({
        success: false,
        message:
          "An AI provider could not process the request because of a configuration or access issue.",
      });
    }

    return res.status(503).json({
      success: false,
      message:
        "BrainWave couldn't get a response from its AI providers. Please try again shortly.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`BrainWave backend running on port ${PORT}`);
});
