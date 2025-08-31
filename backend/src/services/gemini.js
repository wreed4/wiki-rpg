const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateCharacterProfile(wikipediaData) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `
You are a creative RPG character designer. Based on this Wikipedia article, create a detailed RPG character profile.

WIKIPEDIA DATA:
Title: ${wikipediaData.title}
Extract: ${wikipediaData.extract}
Content: ${(wikipediaData.fullContent || wikipediaData.content || '').substring(0, 2000)}

Create a character profile in JSON format. Return ONLY the JSON object, no other text:

{
  "name": "Character name based on the Wikipedia subject",
  "description": "2-3 sentence physical and general description",
  "personality": "Key personality traits and quirks (2-3 sentences)",
  "background": "Brief backstory connecting to the Wikipedia subject (2-3 sentences)",
  "specialAbilities": "3-5 unique abilities or skills related to the subject",
  "stats": {
    "strength": 15,
    "intelligence": 18, 
    "charisma": 12,
    "wisdom": 16,
    "dexterity": 10,
    "constitution": 14
  },
  "catchphrase": "A memorable quote or saying for this character"
}

Return ONLY valid JSON with no markdown formatting, no explanations, just the JSON object.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();
      
      // Clean up common JSON formatting issues
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      const characterData = JSON.parse(responseText);

      return characterData;

    } catch (error) {
      console.error('Character generation error:', error);
      console.error('Error details:', error.message);
      throw new Error('Failed to generate character profile: ' + error.message);
    }
  }

  async generateCharacterImage(characterProfile) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `
Based on this character profile, create a detailed visual description for an AI image generator:

Character Name: ${characterProfile.name}
Description: ${characterProfile.description}
Personality: ${characterProfile.personality}
Background: ${characterProfile.background}

Generate a detailed, specific image prompt that could be used with an AI image generator. Include:
- Physical appearance details
- Clothing/attire appropriate to the character
- Pose or expression
- Background/setting hints
- Art style (fantasy portrait, realistic, etc.)

Keep it under 200 words and make it vivid and specific.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const imageDescription = response.text();

      // For MVP, we'll store this description and use a placeholder image
      return {
        imageUrl: '/api/characters/placeholder-avatar/' + encodeURIComponent(characterProfile.name),
        imageDescription: imageDescription
      };

    } catch (error) {
      console.error('Image generation error:', error);
      return {
        imageUrl: '/api/characters/placeholder-avatar/default',
        imageDescription: 'Default character avatar'
      };
    }
  }

  async generateChatResponse(character, chatHistory, userMessage) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
You are roleplaying as this character. Stay in character and respond naturally to the user's message.

CHARACTER PROFILE:
Name: ${character.name}
Description: ${character.description}
Personality: ${character.personality}
Background: ${character.background}
Special Abilities: ${character.specialAbilities || 'None specified'}
Catchphrase: ${character.catchphrase || 'None'}

CHAT HISTORY:
${chatHistory.map(msg => `${msg.sender_type === 'user' ? 'User' : character.name}: ${msg.message}`).join('\n')}

USER'S MESSAGE: ${userMessage}

Respond as ${character.name}. Keep responses engaging, in-character, and conversational. Don't break character or mention that you're an AI. Limit response to 2-3 sentences unless the user asks for something longer.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();

    } catch (error) {
      console.error('Chat response generation error:', error);
      throw new Error('Failed to generate character response');
    }
  }
}

module.exports = new GeminiService();