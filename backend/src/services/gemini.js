const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const mime = require("mime");
const fs = require("fs");
const path = require("path");

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.imageGenAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Create directory for storing generated images
    this.imagesDir = path.join(process.cwd(), "generated_images");
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
  }

  async generateCharacterProfile(wikipediaData) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = `
You are a creative RPG character designer. Based on this Wikipedia article, create a detailed RPG character profile.

WIKIPEDIA DATA:
Title: ${wikipediaData.title}
Extract: ${wikipediaData.extract}
Content: ${(wikipediaData.fullContent || wikipediaData.content || "").substring(0, 2000)}

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
      responseText = responseText
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
      responseText = responseText.replace(/^```\s*/, "").replace(/\s*```$/, "");

      const characterData = JSON.parse(responseText);

      return characterData;
    } catch (error) {
      console.error("Character generation error:", error);
      console.error("Error details:", error.message);
      throw new Error("Failed to generate character profile: " + error.message);
    }
  }

  async generateCharacterImage(characterProfile, wikipediaData) {
    try {
      console.log("Generating character image for:", characterProfile.name);

      // Create a detailed prompt for image generation
      const imagePrompt = `Generate a high-quality fantasy character portrait for "${characterProfile.name}".

Character Details:
- Description: ${characterProfile.description}
- Personality: ${characterProfile.personality}
- Background: ${characterProfile.background}

Style: Digital art portrait, fantasy RPG character, detailed, professional quality, centered composition, neutral background. Focus on the character's face and upper body. Make it suitable for a character profile picture.`;

      console.log("Image prompt:", imagePrompt);

      // Use the correct generateImages method
      const response = await this.imageGenAI.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const generatedImage = response.generatedImages[0];
        const imgBytes = generatedImage.image.imageBytes;
        
        // Generate unique filename
        const timestamp = Date.now();
        const safeName = characterProfile.name.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `character_${safeName}_${timestamp}.png`;
        const filePath = path.join(this.imagesDir, fileName);

        // Save image to file
        const buffer = Buffer.from(imgBytes, "base64");
        fs.writeFileSync(filePath, buffer);

        console.log(`Generated image saved: ${fileName}`);

        return {
          imageUrl: `/api/characters/images/${fileName}`,
          imageDescription: imagePrompt,
          filePath: filePath,
          fileName: fileName,
        };
      } else {
        console.log("No images generated in response");
        return {
          imageUrl:
            "/api/characters/placeholder-avatar/" +
            encodeURIComponent(characterProfile.name),
          imageDescription: imagePrompt,
        };
      }
    } catch (error) {
      console.error("Image generation error:", error);
      console.error("Error details:", error.message);
      return {
        imageUrl:
          "/api/characters/placeholder-avatar/" +
          encodeURIComponent(characterProfile.name),
        imageDescription: "Default character avatar",
      };
    }
  }

  async generateWithImagen(characterProfile) {
    try {
      // Generate a detailed prompt using Gemini first
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const promptGenerationPrompt = `
Based on this RPG character profile, create a detailed visual description for Google Imagen:

Character Name: ${characterProfile.name}
Description: ${characterProfile.description}
Personality: ${characterProfile.personality}
Background: ${characterProfile.background}

Create a single paragraph image prompt (under 150 words) that includes:
- Physical appearance details (age, build, facial features, hair)
- Clothing/attire appropriate to the character
- Pose or expression that reflects their personality
- Art style: "fantasy RPG character portrait, digital art, detailed"

Make it vivid but concise for optimal image generation.
      `;

      const promptResult = await model.generateContent(promptGenerationPrompt);
      const promptResponse = await promptResult.response;
      const imagePrompt = promptResponse.text().trim();

      console.log(
        "Generated Imagen prompt for",
        characterProfile.name + ":",
        imagePrompt,
      );

      // Use Vertex AI Imagen model to generate the image
      const imagenModel = this.vertexAI.getGenerativeModel({
        model: "imagen-3.0-generate-002",
      });

      const request = {
        prompt: imagePrompt,
        sampleCount: 1,
        imageSize: "1024",
        safetySetting: "block_most",
        includeRaiReason: false,
      };

      const [response] = await imagenModel.generateImages(request);

      if (response && response.images && response.images[0]) {
        // The response contains base64-encoded image data
        const base64Image = response.images[0].bytesBase64Encoded;

        // Store as data URL for now (in production, you'd save to cloud storage)
        return {
          imageUrl: `data:image/png;base64,${base64Image}`,
          imageDescription: imagePrompt,
        };
      } else {
        throw new Error("No image generated by Imagen");
      }
    } catch (error) {
      console.error("Imagen generation error:", error);
      // Fallback to placeholder
      return {
        imageUrl:
          "/api/characters/placeholder-avatar/" +
          encodeURIComponent(characterProfile.name),
        imageDescription: "Generated character avatar (fallback)",
      };
    }
  }

  async generateChatResponse(character, chatHistory, userMessage) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = `
You are roleplaying as this character. Stay in character and respond naturally to the user's message.

CHARACTER PROFILE:
Name: ${character.name}
Description: ${character.description}
Personality: ${character.personality}
Background: ${character.background}
Special Abilities: ${character.specialAbilities || "None specified"}
Catchphrase: ${character.catchphrase || "None"}

CHAT HISTORY:
${chatHistory.map((msg) => `${msg.sender_type === "user" ? "User" : character.name}: ${msg.message}`).join("\n")}

USER'S MESSAGE: ${userMessage}

Respond as ${character.name}. Keep responses engaging, in-character, and conversational. Don't break character or mention that you're an AI. Limit response to 2-3 sentences unless the user asks for something longer.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Chat response generation error:", error);
      throw new Error("Failed to generate character response");
    }
  }
}

module.exports = new GeminiService();
