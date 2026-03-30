import { GoogleGenAI, Modality, ThinkingLevel, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const models = {
  flash: "gemini-3-flash-preview",
  pro: "gemini-3.1-pro-preview",
  lite: "gemini-3.1-flash-lite-preview",
  tts: "gemini-2.5-flash-preview-tts",
};

export async function generateIntel(prompt: string, model: string = models.flash, tools: any[] = []) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools,
      systemInstruction: `You are the Aegis OSINT Intelligence Module. 
      Your purpose is to cross-correlate data from multiple sources:
      - OSRS (Old School RuneScape) related sites
      - Runehall (Gambling platform)
      - Web Archives (Wayback Machine)
      - Underground sites / RSPS (RuneScape Private Servers)
      - Discord, Twitter, Twitch, Runehall
      - .onion sites (provide dorks and theoretical analysis)
      
      Context on Runehall: It is a gambling platform with identified vulnerabilities in its betting engine (Logic Flaws/Race Conditions).
      
      When analyzing, look for:
      1. Usernames/Aliases across platforms.
      2. Transaction patterns (OSRS GP, Crypto).
      3. Technical vulnerabilities.
      4. Social connections.
      
      Always provide structured, actionable intelligence.`,
    },
  });
  return response;
}

export async function analyzeImage(base64Data: string, prompt: string) {
  const response = await ai.models.generateContent({
    model: models.pro,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
        { text: prompt },
      ],
    },
  });
  return response.text;
}

export async function textToSpeech(text: string) {
  const response = await ai.models.generateContent({
    model: models.tts,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Zephyr" },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}

export async function complexReasoning(prompt: string) {
  const response = await ai.models.generateContent({
    model: models.pro,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  });
  return response.text;
}
