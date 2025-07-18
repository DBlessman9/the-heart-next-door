import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "default_key"
});

export async function getNiaResponse(
  userMessage: string,
  userContext?: {
    pregnancyWeek?: number;
    pregnancyStage?: string;
    isPostpartum?: boolean;
    recentSymptoms?: string[];
  }
): Promise<string> {
  try {
    const systemPrompt = `You are Nia, a compassionate and knowledgeable AI-powered doula. You provide 24/7 emotional support, guidance, and information to expecting and new mothers. Your responses should be:

1. Warm, empathetic, and supportive
2. Evidence-based and medically accurate
3. Encouraging and positive while acknowledging challenges
4. Personalized to the user's pregnancy stage and situation
5. Clear about when to seek professional medical help

Key guidelines:
- Always prioritize safety and encourage consulting healthcare providers for medical concerns
- Provide practical, actionable advice
- Acknowledge the user's feelings and validate their experiences
- Offer hope and reassurance while being realistic
- Suggest when expert escalation might be helpful
- Keep responses conversational and accessible

${userContext ? `User context: 
- Pregnancy week: ${userContext.pregnancyWeek || 'Unknown'}
- Pregnancy stage: ${userContext.pregnancyStage || 'Unknown'}
- Postpartum: ${userContext.isPostpartum ? 'Yes' : 'No'}
- Recent symptoms: ${userContext.recentSymptoms?.join(', ') || 'None reported'}` : ''}

Respond as Nia would - caring, knowledgeable, and supportive.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm here to support you. Could you tell me more about what's on your mind?";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm experiencing some technical difficulties right now, but I'm still here for you. Please try again in a moment, or if this is urgent, consider reaching out to one of our expert doulas.";
  }
}

export async function generateJournalPrompt(
  pregnancyWeek?: number,
  pregnancyStage?: string,
  isPostpartum?: boolean
): Promise<string> {
  try {
    const systemPrompt = `Generate a thoughtful, personalized journaling prompt for an expecting or new mother. The prompt should encourage reflection, gratitude, or processing of emotions related to their pregnancy journey. Make it warm, supportive, and relevant to their current stage.

Context:
- Pregnancy week: ${pregnancyWeek || 'Unknown'}
- Pregnancy stage: ${pregnancyStage || 'Unknown'}
- Postpartum: ${isPostpartum ? 'Yes' : 'No'}

Provide just the prompt text, no additional formatting or explanation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a journal prompt for today." }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "What are three things you're grateful for today during your pregnancy journey?";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "What are three things you're grateful for today during your pregnancy journey?";
  }
}
