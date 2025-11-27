import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, CustomFormulaResult, ChatMessage } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// Schema for Image Analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    atmosphere: { type: Type.STRING, description: "A concise description of the mood/vibe of the person and scene (e.g., 'Warm & Energetic', 'Cool & Intellectual')." },
    facialFeatures: { type: Type.STRING, description: "Brief analysis of facial features relating to personality (e.g., 'Soft jawline indicating gentleness')." },
    suggestedOils: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Chinese name of the essential oil" },
          englishName: { type: Type.STRING, description: "English name of the essential oil" },
          benefit: { type: Type.STRING, description: "Therapeutic or emotional benefit" },
          note: { type: Type.STRING, description: "Fragrance note (Top, Middle, Base)" },
          category: { type: Type.STRING, description: "The olfactory category of the oil (e.g., Floral, Citrus, Woody, Herbaceous, Spicy, Earthy, Resin)" }
        },
        required: ["name", "englishName", "benefit", "note", "category"]
      }
    },
    posterPrompt: { type: Type.STRING, description: "A highly detailed English prompt for an image generation model to create a product photography background. It should feature a glass essential oil bottle in a setting that matches the 'atmosphere'. Do not include people." },
    quote: { type: Type.STRING, description: "A short, poetic sentence in Chinese matching the scent vibe." }
  },
  required: ["atmosphere", "facialFeatures", "suggestedOils", "posterPrompt", "quote"]
};

// Schema for Custom Formula
const formulaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Creative Chinese name for this blend" },
    description: { type: Type.STRING, description: "Why this blend works for the user's request" },
    oils: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          englishName: { type: Type.STRING },
          benefit: { type: Type.STRING },
          note: { type: Type.STRING },
          category: { type: Type.STRING, description: "Category: Floral, Citrus, Woody, Herbaceous, etc." }
        },
        required: ["name", "englishName", "benefit", "note", "category"]
      }
    },
    usage: { type: Type.STRING, description: "Recommended usage (e.g., Diffuser, Massage)" }
  },
  required: ["name", "description", "oils", "usage"]
};

export const getNextInterviewQuestion = async (tags: string[], history: ChatMessage[], questionCount: number): Promise<string> => {
  try {
    const historyText = history.map(m => `${m.role}: ${m.text}`).join('\n');
    const prompt = `
      You are Aura, an empathetic aromatherapist AI.
      User's selected concerns: ${tags.join(', ')}.
      Conversation History:
      ${historyText}

      Task: Generate the next short, gentle question (Question ${questionCount + 1}/5) to understand their lifestyle, scent preferences, or emotional state to recommend essential oils.
      If this is the first question, welcome them warmly based on their tags.
      Keep it brief and conversational in Chinese.
      Do not output 'Question X:', just the text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "请告诉我更多关于您的偏好。";
  } catch (error) {
    console.error("Chat generation failed", error);
    return "您平时喜欢什么样的气味呢？";
  }
};

export const analyzeUserContext = async (base64Image: string, tags: string[], chatHistory: ChatMessage[]): Promise<AnalysisResult> => {
  try {
    const chatSummary = chatHistory.map(m => `${m.role === 'user' ? 'User Answer' : 'Aura Question'}: ${m.text}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: `
            Role: Expert Aromatherapist & Visual Artist.
            Task: Analyze the user based on three inputs:
            1. Their Facial Features & Vibe (from image).
            2. Their Explicit Concerns (Tags): ${tags.join(', ')}.
            3. Their Interview Responses: 
            ${chatSummary}

            Create a cohesive "Atmosphere" and recommended essential oil blend that addresses their concerns while matching their visual vibe.
            Return result in JSON.
          ` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are Aura. You blend visual psychology with aromatherapy science."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generatePosterBackground = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          { text: prompt + " The image should be high resolution, aesthetic, minimalistic product photography, 4k, cinematic lighting, diffuse light, dreamy." }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4" 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation failed:", error);
    return "https://picsum.photos/600/800";
  }
};

export const generateCustomScent = async (request: string): Promise<CustomFormulaResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User Request: "${request}". Create a custom essential oil formula.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: formulaSchema,
        systemInstruction: "You are an expert perfumer and aromatherapist. Create a soothing, effective, and chemically balanced essential oil blend based on the user's specific request. Output JSON."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as CustomFormulaResult;
  } catch (error) {
    console.error("Custom formula failed:", error);
    throw error;
  }
};