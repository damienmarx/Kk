import { GoogleGenAI } from "@google/genai";
import { getLocalIntelligence, isQuotaExhaustedError } from "./heuristics";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function analyzeGithubRepo(repoUrl: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the content of this GitHub repository: ${repoUrl}. 
      Extract key technical details, modules, and logic that can be integrated into the Aegis OSINT framework. 
      Focus on offensive security capabilities, data scraping logic, and any identified vulnerabilities or exploit vectors mentioned in the code or documentation.`,
      config: {
        tools: [{ urlContext: {} }]
      },
    });
    return response.text;
  } catch (error) {
    if (isQuotaExhaustedError(error)) {
      console.warn("Gemini API Quota Exhausted during GitHub analysis. Falling back to Aegis Offline Heuristics.");
      const fallbackFinding = getLocalIntelligence(repoUrl);
      return `[OFFLINE HEURISTICS ACTIVE] ${fallbackFinding}`;
    }
    console.error("Failed to analyze GitHub repository:", error);
    return "Error: Could not retrieve GitHub context.";
  }
}
