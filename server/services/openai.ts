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
    recentCheckIn?: {
      feeling?: string;
      bodyCare?: string;
      feelingSupported?: string;
      date?: Date;
    };
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
- Format responses with clear paragraph breaks using newlines (\n) between different thoughts or topics
- Use shorter paragraphs for better readability
- Personalize responses based on their daily check-in data:
  * If feeling is "anxious", provide calming techniques and reassurance
  * If feeling is "tired", validate their feelings and offer comfort
  * If feeling is "overwhelmed", offer gentle support and coping strategies
  * If feeling is "grateful", share in their positive energy
  * If feeling is "peaceful", acknowledge their positive state
  * If body care is "not-yet", gently encourage small self-care steps
  * If feeling unsupported, offer validation and connection resources

${userContext ? `User context: 
- Pregnancy week: ${userContext.pregnancyWeek || 'Unknown'}
- Pregnancy stage: ${userContext.pregnancyStage || 'Unknown'}
- Postpartum: ${userContext.isPostpartum ? 'Yes' : 'No'}
- Recent symptoms: ${userContext.recentSymptoms?.join(', ') || 'None reported'}
- Today's check-in: ${userContext.recentCheckIn ? `Feeling ${userContext.recentCheckIn.feeling}, body care: ${userContext.recentCheckIn.bodyCare}, feeling supported: ${userContext.recentCheckIn.feelingSupported}` : 'Not completed yet'}` : ''}

Respond as Nia would - caring, knowledgeable, and supportive. Format your response with clear paragraph breaks using newlines to separate different thoughts or topics for better readability.`;

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
  // Use predefined prompts that are guaranteed to be grammatically correct
  const firstTrimesterPrompts = [
    "How are you feeling about the changes in your body this week?",
    "What emotions are you experiencing as you begin this journey?",
    "What's bringing you comfort during these early weeks?",
    "How are you taking care of yourself today?",
    "What are you most looking forward to in your pregnancy?"
  ];

  const secondTrimesterPrompts = [
    "What has surprised you most about your pregnancy so far?",
    "How do you feel when you think about your growing baby?",
    "What's one thing you're grateful for this week?",
    "How has your energy been lately?",
    "What hopes do you have for your baby today?"
  ];

  const thirdTrimesterPrompts = [
    "How are you feeling about meeting your baby soon?",
    "What's helping you prepare for labor and delivery?",
    "What are you most excited about becoming a mother?",
    "How has your body amazed you during this pregnancy?",
    "What do you want to remember about this time?"
  ];

  const postpartumPrompts = [
    "How are you adjusting to life with your baby?",
    "What's been the most surprising part of motherhood so far?",
    "How are you taking care of yourself today?",
    "What moments with your baby bring you the most joy?",
    "What would you tell your pre-baby self about this journey?"
  ];

  let promptArray;
  if (isPostpartum) {
    promptArray = postpartumPrompts;
  } else if (pregnancyStage === "third") {
    promptArray = thirdTrimesterPrompts;
  } else if (pregnancyStage === "second") {
    promptArray = secondTrimesterPrompts;
  } else {
    promptArray = firstTrimesterPrompts;
  }

  // Return a random prompt from the appropriate array
  const randomIndex = Math.floor(Math.random() * promptArray.length);
  return promptArray[randomIndex];
}
