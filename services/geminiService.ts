import { GoogleGenAI, Type } from "@google/genai";
import { FireConfig, GeneratedFireStyle } from "../types";

const SYSTEM_INSTRUCTION = `
You are a Graphics Engineer specializing in GLSL shaders and procedural generation.
Your task is to translate a natural language description of a fire/plasma effect into a specific JSON configuration for a React Three Fiber shader.

The shader uses the following parameters:
- colorCore (hex string): The center/hottest part of the fire.
- colorOuter (hex string): The edges/cooler part of the fire.
- speed (number 0.1 - 5.0): How fast the time variable animates.
- turbulence (number 0.0 - 5.0): How chaotic the motion is.
- scale (number 0.5 - 3.0): Physical size of the mesh.
- displacementScale (number 0.0 - 1.0): How much the vertices are pushed by noise.
- noiseScale (number 0.1 - 10.0): The frequency of the noise texture.

Examples:
"Hellfire" -> { colorCore: "#ffaa00", colorOuter: "#ff0000", speed: 2.5, turbulence: 1.5, ... }
"Ghostly wisp" -> { colorCore: "#aaddff", colorOuter: "#0033aa", speed: 0.5, turbulence: 0.2, ... }
"Toxic sludge" -> { colorCore: "#00ff00", colorOuter: "#4b0082", speed: 0.8, turbulence: 2.0, ... }
`;

export const generateFireConfig = async (prompt: string): Promise<GeneratedFireStyle> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            config: {
              type: Type.OBJECT,
              properties: {
                colorCore: { type: Type.STRING },
                colorOuter: { type: Type.STRING },
                speed: { type: Type.NUMBER },
                turbulence: { type: Type.NUMBER },
                scale: { type: Type.NUMBER },
                displacementScale: { type: Type.NUMBER },
                noiseScale: { type: Type.NUMBER },
              },
              required: ["colorCore", "colorOuter", "speed", "turbulence", "scale", "displacementScale", "noiseScale"]
            },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GeneratedFireStyle;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback if AI fails
    return {
      config: {
        colorCore: "#ffbbaa",
        colorOuter: "#aa0000",
        speed: 1.0,
        turbulence: 1.0,
        scale: 1.5,
        displacementScale: 0.3,
        noiseScale: 2.0
      },
      reasoning: "Fallback configuration due to API error."
    };
  }
};