import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Say The Word On Beat' });
});

// AI Generate Custom Challenge endpoint
app.post('/api/generate-challenge', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const { prompt, language = 'zh-CN', roundsCount = 4, startBpm = 110, cardsPerRound = 4, textOnly = false } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a rhythm game designer for the viral party game "Say The Word On Beat".
Create a fun, rhythmic, catchy challenge with ${roundsCount} rounds based on the topic: "${prompt}".
Target language: ${language === 'zh-CN' ? 'Chinese (Simplified)' : 'English'}.
Rules:
1. Each round has EXACTLY ${cardsPerRound} cards.
2. ${textOnly ? 'PURE TEXT MODE: Do not include emojis. Focus on bold, rhythmic phrases, idioms, or rhyming words.' : 'Words can have an emoji.'}
3. Words should be punchy, rhythmic, easy to shout on the beat (1-4 syllables/characters).
4. The tempo starts at ${startBpm} BPM and increases each round (e.g. +15 to +20 BPM per round).
5. Each card needs:
   - "word": the main word or phrase to shout
   - "subtext": short hint or pinyin or meaning (under 6 words)
   - "emoji": "${textOnly ? '' : '1 relevant emoji or empty string'}"
   - "color": hex color (like #ec4899, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444)
6. Return PURE JSON conforming to the schema below. No markdown backticks, no explanations.

JSON schema:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "soundPack": "trap" | "whistle" | "arcade" | "funk",
  "rounds": [
    {
      "roundNumber": number,
      "bpm": number,
      "name": "string",
      "cards": [
        { "word": "string", "subtext": "string", "emoji": "string", "color": "string" }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, challenge: parsed });
  } catch (err: any) {
    console.error('Error generating challenge:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate challenge',
    });
  }
});

// Mount Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
