import { GoogleGenAI, Type } from "@google/genai";
import { AuditItem, Verdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const runAudit = async (inputText: string): Promise<AuditItem[]> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze the following list of government contract titles and dates.
    
    YOUR AGENCY SPECIALIZES IN:
    - Artificial Intelligence & Machine Learning (LLMs, NLP, Computer Vision)
    - Data Modernization (ETL, Cleaning, Migration)
    - Automation (Workflow optimization, RPA)
    - Software Development (Cloud, Dashboards, Web Apps)

    YOU DO NOT DO:
    - Construction (Paving, Roofing, HVAC, Electrical)
    - Physical Hardware (Missiles, Vehicles, Ammo, Fiber Optic Cabling)
    - Staffing/Guards (Security guards, Janitorial)

    INSTRUCTIONS:
    1. THE SLOE FILTER (Pass/Fail):
       - If the title implies physical work (e.g., "Duct Bank", "Interceptor", "Paving", "Sustainment", "Fiber Optics"), verdict is "TRASH".
       - If the title implies software, data, or analysis (e.g., "Modernization", "Transcription", "Computational", "System Support", "FADGI"), verdict is "FOCUS".
    
    2. THE SLOE STRATEGY (The "AI Angle"):
       - For "FOCUS" items, invent a specific, high-tech angle.
       - "Transcription/Audio" -> "Automated ASR pipeline with Human-in-the-Loop QA."
       - "Modernization/Data" -> "LLM-driven unstructured data processing and automated schema mapping."
       - "Digitization/FADGI" -> "Computer Vision and Multimodal AI for automated metadata tagging."
       - "Simulation/Computational" -> "Predictive modeling and digital twin simulations."
       - For others, generate a relevant AI-driven pitch.

    INPUT DATA:
    ${inputText}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              opportunityName: { type: Type.STRING },
              verdict: { type: Type.STRING, enum: [Verdict.FOCUS, Verdict.TRASH] },
              reason: { type: Type.STRING },
              aiPitch: { type: Type.STRING, nullable: true },
            },
            required: ["opportunityName", "verdict", "reason"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as AuditItem[];
    return data;
  } catch (error) {
    console.error("Audit failed:", error);
    throw error;
  }
};
