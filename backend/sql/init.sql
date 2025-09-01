-- Initialize Wiki RPG Database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Characters table
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    personality TEXT,
    background TEXT,
    wikipedia_url TEXT NOT NULL,
    wikipedia_title VARCHAR(255) NOT NULL,
    image_url TEXT,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id),
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id),
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'character')),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Character interactions table (for character-to-character interactions)
CREATE TABLE character_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_1_id UUID REFERENCES characters(id),
    character_2_id UUID REFERENCES characters(id),
    interaction_type VARCHAR(50),
    description TEXT,
    outcome JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invite keys table (temporary access control)
CREATE TABLE invite_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_value VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_characters_wikipedia_url ON characters(wikipedia_url);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_sessions_character_id ON chat_sessions(character_id);
CREATE INDEX idx_invite_keys_key_value ON invite_keys(key_value);
CREATE INDEX idx_invite_keys_active ON invite_keys(is_active);