const express = require('express');
const router = express.Router();
const { query } = require('../utils/database');
const geminiService = require('../services/gemini');

// Start a new chat session with a character
router.post('/session', async (req, res) => {
  try {
    const { characterId, userId = 'anonymous' } = req.body;

    if (!characterId) {
      return res.status(400).json({ error: 'Character ID is required' });
    }

    // Verify character exists
    const characterResult = await query(
      'SELECT * FROM characters WHERE id = $1',
      [characterId]
    );

    if (characterResult.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Create new chat session
    const sessionResult = await query(
      'INSERT INTO chat_sessions (character_id, user_id) VALUES ($1, $2) RETURNING *',
      [characterId, userId]
    );

    const session = sessionResult.rows[0];
    const character = characterResult.rows[0];

    // Send initial greeting from character
    const greeting = await geminiService.generateChatResponse(
      character,
      [],
      'Hello! This is the start of our conversation.'
    );

    // Store the greeting message
    await query(
      'INSERT INTO chat_messages (session_id, sender_type, message) VALUES ($1, $2, $3)',
      [session.id, 'character', greeting]
    );

    res.status(201).json({
      session,
      character: {
        id: character.id,
        name: character.name,
        description: character.description,
        image_url: character.image_url
      },
      greeting
    });

  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Get chat history for a session
router.get('/session/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Send message in chat session
router.post('/session/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Get session and character info
    const sessionResult = await query(`
      SELECT cs.*, c.* 
      FROM chat_sessions cs 
      JOIN characters c ON cs.character_id = c.id 
      WHERE cs.id = $1
    `, [sessionId]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const session = sessionResult.rows[0];

    // Get recent chat history (last 10 messages)
    const historyResult = await query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 10',
      [sessionId]
    );

    const chatHistory = historyResult.rows.reverse();

    // Store user message
    await query(
      'INSERT INTO chat_messages (session_id, sender_type, message) VALUES ($1, $2, $3)',
      [sessionId, 'user', message]
    );

    // Generate character response
    const characterResponse = await geminiService.generateChatResponse(
      session,
      chatHistory,
      message
    );

    // Store character response
    await query(
      'INSERT INTO chat_messages (session_id, sender_type, message) VALUES ($1, $2, $3)',
      [sessionId, 'character', characterResponse]
    );

    res.json({
      userMessage: message,
      characterResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get user's chat sessions
router.get('/sessions', async (req, res) => {
  try {
    const { userId = 'anonymous' } = req.query;

    const result = await query(`
      SELECT 
        cs.*,
        c.name as character_name,
        c.description as character_description,
        c.image_url as character_image_url,
        (
          SELECT message 
          FROM chat_messages 
          WHERE session_id = cs.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message
      FROM chat_sessions cs
      JOIN characters c ON cs.character_id = c.id
      WHERE cs.user_id = $1
      ORDER BY cs.created_at DESC
    `, [userId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

module.exports = router;