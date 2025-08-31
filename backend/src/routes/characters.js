const express = require('express');
const router = express.Router();
const { query } = require('../utils/database');
const WikipediaService = require('../services/wikipedia');
const geminiService = require('../services/gemini');

// Get all characters
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, description, personality, image_url, level, experience, created_at FROM characters ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Get character by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM characters WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// Create character from Wikipedia URL
router.post('/create', async (req, res) => {
  try {
    const { wikipediaUrl } = req.body;

    if (!wikipediaUrl) {
      return res.status(400).json({ error: 'Wikipedia URL is required' });
    }

    if (!WikipediaService.validateWikipediaUrl(wikipediaUrl)) {
      return res.status(400).json({ error: 'Invalid Wikipedia URL format' });
    }

    // Check if character already exists for this URL
    const existingResult = await query(
      'SELECT id FROM characters WHERE wikipedia_url = $1',
      [wikipediaUrl]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Character already exists for this Wikipedia page',
        characterId: existingResult.rows[0].id
      });
    }

    // Scrape Wikipedia
    const wikipediaData = await WikipediaService.scrapeWikipediaPage(wikipediaUrl);

    // Generate character profile with Gemini
    const characterProfile = await geminiService.generateCharacterProfile(wikipediaData);

    // Generate character image
    const imageData = await geminiService.generateCharacterImage(characterProfile, wikipediaData);

    // Store character in database
    const insertResult = await query(`
      INSERT INTO characters (
        name, description, personality, background, wikipedia_url, wikipedia_title,
        image_url, stats
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      characterProfile.name,
      characterProfile.description,
      characterProfile.personality,
      characterProfile.background,
      wikipediaUrl,
      wikipediaData.title,
      typeof imageData === 'string' ? imageData : imageData.imageUrl,
      JSON.stringify({
        ...characterProfile.stats,
        specialAbilities: characterProfile.specialAbilities,
        catchphrase: characterProfile.catchphrase,
        imageDescription: typeof imageData === 'object' ? imageData.imageDescription : null
      })
    ]);

    const character = insertResult.rows[0];
    
    res.status(201).json({
      character,
      message: 'Character created successfully!'
    });

  } catch (error) {
    console.error('Error creating character:', error);
    
    if (error.message.includes('Wikipedia page not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Failed to create character',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Placeholder avatar endpoint
router.get('/placeholder-avatar/:name', (req, res) => {
  const name = req.params.name || 'Character';
  
  // Generate a simple SVG avatar with initials
  const initials = name.split(' ')
    .map(word => word[0] || '')
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  const bgColor = colors[name.length % colors.length];
  
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${bgColor}"/>
      <text x="100" y="125" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
            text-anchor="middle" fill="white">${initials}</text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

module.exports = router;