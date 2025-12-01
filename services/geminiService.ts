import { GoogleGenAI, Type } from "@google/genai";
import { PuzzleResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePuzzle = async (topic: string): Promise<PuzzleResponse> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `Create a "Connections" style word puzzle based on the topic: "${topic}".
  
  Rules:
  1. Generate exactly 4 distinct categories.
  2. Each category must have exactly 4 words/items that belong to it.
  3. The words should be tricky; they might seem to belong to multiple categories, but there is only one correct solution where all 4x4 groups are perfect.
  4. Ensure words are short and concise (max 2-3 words per item).
  
  Output JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The hidden category title" },
                  description: { type: Type.STRING, description: "Short explanation of the connection" },
                  items: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Exactly 4 items in this category"
                  }
                },
                required: ["name", "description", "items"]
              }
            }
          },
          required: ["categories"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as PuzzleResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
