require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const charactersRouter = require('./routes/characters');
const chatRouter = require('./routes/chat');
const validateInviteKey = require('./middleware/inviteAuth');
const { runMigrations } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || true) // Allow Railway's dynamic URLs or any origin in production
    : ['http://localhost:3000']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (before auth middleware)
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Apply invite key validation to all other API routes
app.use('/api', validateInviteKey);

// Invite key validation endpoint (after auth middleware)
app.get('/api/validate-invite', (req, res) => {
  res.json({ valid: true, timestamp: new Date().toISOString() });
});

app.use('/api/characters', charactersRouter);
app.use('/api/chat', chatRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const startServer = async () => {
  try {
    // Run database migrations before starting the server
    await runMigrations();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Wiki RPG Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();