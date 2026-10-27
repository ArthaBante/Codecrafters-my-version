import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const MODEL_NAME = "gemini-3.5-flash-lite";

// 1. Generate Questions Endpoint
app.post("/api/ai/questions", async (req, res) => {
  try {
    const { name, description, language, proficiency } = req.body;
    
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate 2 to 3 specific follow-up technical questions for a coding project named "${name}" in ${language} for a ${proficiency} level developer. Project description: "${description}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["single", "multi"] },
              options: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "text", "type", "options"]
          }
        },
        temperature: 0.3,
        maxOutputTokens: 500,
      }
    });

    const text = response.text || "[]";
    const json = JSON.parse(text);
    res.json(json);
  } catch (err: any) {
    console.error("AI Questions Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate questions" });
  }
});

// 2. Generate Brief Endpoint
app.post("/api/ai/brief", async (req, res) => {
  try {
    const { name, description, language, proficiency, answers } = req.body;
    
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a concise project brief for "${name}" (${language}, ${proficiency}). Description: "${description}". User questionnaire answers: ${JSON.stringify(answers)}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Max 80 words summary of the project architecture and core features." },
            language: { type: Type.STRING },
            proficiency: { type: Type.STRING },
            scope: { type: Type.STRING },
            fromScratch: { type: Type.BOOLEAN },
            suggestedStageCount: { type: Type.INTEGER }
          },
          required: ["summary", "language", "proficiency", "scope", "fromScratch", "suggestedStageCount"]
        },
        temperature: 0.3,
        maxOutputTokens: 600,
      }
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);
    res.json(json);
  } catch (err: any) {
    console.error("AI Brief Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate brief" });
  }
});

// 3. Generate Stages Endpoint
app.post("/api/ai/stages", async (req, res) => {
  try {
    const { name, description, language, proficiency, brief } = req.body;
    
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate step-by-step building stages for project "${name}" in ${language} (${proficiency}). Brief: "${brief?.summary || description}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              order: { type: Type.INTEGER },
              title: { type: Type.STRING },
              goal: { type: Type.STRING },
              concept: { type: Type.STRING },
              doneWhen: { type: Type.ARRAY, items: { type: Type.STRING } },
              testType: { type: Type.STRING, enum: ["io"] },
              testCases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    input: { type: Type.STRING },
                    expectedOutput: { type: Type.STRING }
                  },
                  required: ["input", "expectedOutput"]
                }
              },
              hints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "order", "title", "goal", "concept", "doneWhen", "testType", "testCases", "hints"]
          }
        },
        temperature: 0.3,
        maxOutputTokens: 1500,
      }
    });

    const text = response.text || "[]";
    const json = JSON.parse(text);
    res.json(json);
  } catch (err: any) {
    console.error("AI Stages Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate stages" });
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
