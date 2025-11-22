import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Note: In a real production app, the API key should be handled via a proxy backend
// to avoid exposing it in the frontend bundle.
// For this demo, we assume process.env.API_KEY is available or prompt the user if missing.

const getClient = () => {
  const apiKey = process.env.API_KEY || localStorage.getItem('gemini_api_key') || '';
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  /**
   * Generates a novel summary based on title and genre.
   */
  generateSynopsis: async (title: string, genre: string, tags: string[]): Promise<string> => {
    const ai = getClient();
    if (!ai) return "API Key missing. Please set your API key to use AI features.";

    try {
      const prompt = `Write a compelling, short synopsis (approx 150 words) for a web novel titled "${title}".
      Genre: ${genre}.
      Tags: ${tags.join(', ')}.
      Make it exciting and suitable for a web novel audience. Do not include markdown formatting like **bold**.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Could not generate synopsis.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Error generating content. Please try again.";
    }
  },

  /**
   * Summarizes a chapter for the user.
   */
  summarizeChapter: async (content: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "API Key missing.";

    try {
      // Truncate content if it's too long to save tokens/latency, though 2.5 Flash handles large context well.
      const truncatedContent = content.slice(0, 10000); 

      const prompt = `Summarize the following chapter content in 3 bullet points. Keep it concise.
      
      Content:
      ${truncatedContent}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Could not generate summary.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Error generating summary.";
    }
  }
};