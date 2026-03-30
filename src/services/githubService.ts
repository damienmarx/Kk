import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function fetchGithubContext(url: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the content of this GitHub repository: ${url}. 
      Extract key technical details, modules, and logic that can be integrated into the Aegis OSINT framework. 
      Focus on offensive security capabilities, data scraping logic, and any identified vulnerabilities or exploit vectors mentioned in the code or documentation.`,
      config: {
        tools: [{ urlContext: {} }]
      },
    });
    return response.text;
  } catch (error) {
    console.error("Failed to fetch GitHub context:", error);
    return "Error: Could not retrieve GitHub context.";
  }
}
