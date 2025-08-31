import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { charactersAPI, chatAPI } from '../services/api';

const CharacterDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCharacter();
  }, [id]);

  const fetchCharacter = async () => {
    try {
      setLoading(true);
      const response = await charactersAPI.getById(id);
      setCharacter(response.data);
    } catch (err) {
      console.error('Error fetching character:', err);
      setError('Failed to load character details');
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    try {
      setChatLoading(true);
      const response = await chatAPI.createSession(id);
      const sessionId = response.data.session.id;
      navigate(`/chat/${sessionId}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Failed to start chat session');
    } finally {
      setChatLoading(false);
    }
  };

  const StatBar = ({ label, value, maxValue = 100 }) => (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '0.25rem',
        fontSize: '0.9rem'
      }}>
        <span>{label}</span>
        <span>{value}/{maxValue}</span>
      </div>
      <div style={{
        background: '#e0e0e0',
        borderRadius: '10px',
        height: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: `${(value / maxValue) * 100}%`,
          height: '100%',
          borderRadius: '10px',
          transition: 'width 0.3s ease'
        }}></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading character...</p>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="error">
        {error || 'Character not found'}
      </div>
    );
  }

  const stats = character.stats ? 
    (typeof character.stats === 'string' ? JSON.parse(character.stats) : character.stats) 
    : {};

  return (
    <div className="character-detail-page">
      <div className="character-header card">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <img
            src={character.image_url || `http://localhost:3001/api/characters/placeholder-avatar/${encodeURIComponent(character.name)}`}
            alt={character.name}
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '12px',
              objectFit: 'cover',
              border: '4px solid #667eea'
            }}
            onError={(e) => {
              e.target.src = `http://localhost:3001/api/characters/placeholder-avatar/${encodeURIComponent(character.name)}`;
            }}
          />
          
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {character.name}
            </h1>
            
            <p style={{ 
              fontSize: '1.1rem', 
              marginBottom: '1rem',
              color: '#666',
              lineHeight: '1.6'
            }}>
              {character.description}
            </p>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div className="stat-badge">
                <strong>Level:</strong> {character.level}
              </div>
              <div className="stat-badge">
                <strong>XP:</strong> {character.experience}
              </div>
              {character.wikipedia_url && (
                <a 
                  href={character.wikipedia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  📖 View Wikipedia Source
                </a>
              )}
            </div>

            <button 
              onClick={startChat}
              className="btn btn-primary"
              disabled={chatLoading}
              style={{ fontSize: '1.1rem' }}
            >
              {chatLoading ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }}></div>
                  Starting Chat...
                </>
              ) : (
                '💬 Start Chatting'
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Character Stats */}
        {stats.strength !== undefined && (
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', color: '#667eea' }}>📊 Character Stats</h3>
            <StatBar label="Strength" value={stats.strength} />
            <StatBar label="Intelligence" value={stats.intelligence} />
            <StatBar label="Charisma" value={stats.charisma} />
            <StatBar label="Wisdom" value={stats.wisdom} />
            <StatBar label="Dexterity" value={stats.dexterity} />
          </div>
        )}

        {/* Personality */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#667eea' }}>🎭 Personality</h3>
          <p style={{ lineHeight: '1.6', color: '#666' }}>
            {character.personality}
          </p>
        </div>

        {/* Background */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#667eea' }}>📜 Background</h3>
          <p style={{ lineHeight: '1.6', color: '#666' }}>
            {character.background}
          </p>
        </div>

        {/* Special Abilities */}
        {stats.specialAbilities && (
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', color: '#667eea' }}>⭐ Special Abilities</h3>
            <p style={{ lineHeight: '1.6', color: '#666' }}>
              {stats.specialAbilities}
            </p>
          </div>
        )}

        {/* Catchphrase */}
        {stats.catchphrase && (
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', color: '#667eea' }}>💭 Catchphrase</h3>
            <p style={{ 
              lineHeight: '1.6', 
              color: '#667eea',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              "{stats.catchphrase}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterDetailPage;