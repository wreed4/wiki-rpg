# 🧙‍♂️ Wiki RPG

Transform any Wikipedia page into a living, breathing RPG character! Create characters based on historical figures, fictional characters, or anything on Wikipedia, then chat with them using AI.

## Features

- 🤖 **AI-Generated Characters**: Each character is uniquely generated using Google's Gemini AI
- 📖 **Wikipedia Integration**: Scrape any Wikipedia page to create character profiles
- 💬 **Interactive Chat**: Have conversations with your characters that remember context
- 📊 **RPG Stats**: Characters have stats, levels, and abilities based on their source material
- 🎨 **Dynamic Avatars**: Auto-generated character avatars with fallback to SVG placeholders
- 🚀 **Full-Stack Architecture**: React frontend, Node.js backend, PostgreSQL database

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd wiki-rpg
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## How It Works

1. **Enter a Wikipedia URL** on the homepage
2. **AI generates character** profile, stats, and personality
3. **Start chatting** with your newly created character
4. **Characters remember** conversation history and respond in-character

## Example Characters to Try

- [Albert Einstein](https://en.wikipedia.org/wiki/Albert_Einstein)
- [Marie Curie](https://en.wikipedia.org/wiki/Marie_Curie)
- [Leonardo da Vinci](https://en.wikipedia.org/wiki/Leonardo_da_Vinci)
- [Cleopatra](https://en.wikipedia.org/wiki/Cleopatra)
- [Nikola Tesla](https://en.wikipedia.org/wiki/Nikola_Tesla)

## Architecture

### Backend (`/backend`)
- **Express.js** REST API
- **PostgreSQL** for character and chat data
- **Redis** for session management (optional)
- **Google Gemini AI** for character generation and chat responses
- **Wikipedia API** for content scraping

### Frontend (`/frontend`)
- **React** with React Router
- **Responsive design** with CSS Grid/Flexbox
- **Real-time chat interface**
- **Character browsing** and management

### Database Schema

```sql
characters table:
- id (UUID, primary key)
- name, description, personality, background
- wikipedia_url, wikipedia_title
- image_url, level, experience, stats (JSONB)
- created_at, updated_at

chat_sessions table:
- id (UUID, primary key)  
- character_id (FK to characters)
- user_id (string, for future user management)
- created_at

chat_messages table:
- id (UUID, primary key)
- session_id (FK to chat_sessions)
- sender_type ('user' | 'character')
- message (text)
- created_at
```

## API Endpoints

### Characters
- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get character by ID
- `POST /api/characters/create` - Create character from Wikipedia URL

### Chat
- `POST /api/chat/session` - Start new chat session
- `GET /api/chat/session/:sessionId/messages` - Get chat history
- `POST /api/chat/session/:sessionId/message` - Send message
- `GET /api/chat/sessions` - Get user's chat sessions

## Development

### Running without Docker

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Database:**
```bash
# Start PostgreSQL and Redis with Docker
docker-compose up postgres redis
```

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (defaults provided)
NODE_ENV=development
DATABASE_URL=postgresql://wikirpg_user:wikirpg_pass@postgres:5432/wikirpg
REDIS_URL=redis://redis:6379
```

## Future Enhancements

- 🔐 **User Authentication**: Personal character collections
- ⚔️ **Character Interactions**: Characters can interact with each other
- 🎮 **Game Mechanics**: Quests, battles, and progression systems  
- 🏆 **Leaderboards**: Character rankings and achievements
- 🎨 **Better Images**: Integration with proper image generation APIs
- 🌐 **Multi-language**: Support for non-English Wikipedia pages
- 📱 **Mobile App**: React Native companion app

## Troubleshooting

**Character creation fails:**
- Check your Gemini API key is valid
- Ensure the Wikipedia URL is accessible
- Try a different Wikipedia page

**Chat not working:**
- Check backend logs: `docker-compose logs backend`
- Verify database connection
- Ensure Gemini API quota isn't exceeded

**Images not loading:**
- Placeholder SVG avatars should always work
- Wikipedia images may have CORS restrictions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your own creations!

---

**Have fun bringing Wikipedia to life!** 🎮✨