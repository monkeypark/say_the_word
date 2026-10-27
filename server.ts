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
  res.json({ status: 'ok', name: 'Speak on the Beat' });
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

    const { prompt, language = 'zh-CN', roundsCount = 5, startBpm = 150, textOnly = true } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a rhythm game designer for the viral party game "Speak on the Beat".
Create a fun, rhythmic, catchy challenge with 5 progressive rounds based on the topic: "${prompt}".
Target language: ${language === 'zh-CN' ? 'Chinese (Simplified)' : 'English'}.
Rules:
1. There are EXACTLY 5 rounds with progressive card count: Round 1 has 2 cards, Round 2 has 3 cards, Round 3 has 4 cards, Round 4 has 5 cards, Round 5 has 6 cards.
2. ${textOnly ? 'PURE TEXT MODE: Do not include emojis or subtexts. Focus on bold, rhythmic single words or short phrases.' : 'Words can have an emoji.'}
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

    // Set the viral Bala Bala Beat music profile as default
    const challenge = {
      ...parsed,
      isCustom: true,
      soundPack: 'drill',
      customAudioUrl: '/assets/music/beat.mp3',
      audioFileName: 'beat.mp3',
      audioOffsetSec: 2.626,
      introDurationSec: 2.626,
      audioLoopEndSec: 5.251,
      baseBpm: 182.8,
      introStyle: 'quick_8',
    };

    return res.json({ success: true, challenge });
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
