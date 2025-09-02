import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { charactersAPI, API_URL } from '../services/api';

const CharacterListPage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await charactersAPI.getAll();
      setCharacters(response.data);
    } catch (err) {
      console.error('Error fetching characters:', err);
      setError('Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading characters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    );
  }

  return (
    <div className="character-list-page">
      <div className="page-header card">
        <h1 style={{ marginBottom: '1rem' }}>All Characters</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Browse all the characters that have been created from Wikipedia pages.
          Click on any character to view details and start chatting!
        </p>
        <Link to="/" className="btn btn-primary">
          ➕ Create New Character
        </Link>
      </div>

      {characters.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#666' }}>No characters yet!</h3>
          <p style={{ marginBottom: '2rem', color: '#888' }}>
            Be the first to create a character from a Wikipedia page.
          </p>
          <Link to="/" className="btn btn-primary">
            Create Your First Character
          </Link>
        </div>
      ) : (
        <div className="characters-grid">
          {characters.map((character) => (
            <Link
              key={character.id}
              to={`/character/${character.id}`}
              className="character-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <img
                src={character.image_url || `/api/characters/placeholder-avatar/${encodeURIComponent(character.name)}`}
                alt={character.name}
                className="character-avatar"
                onError={(e) => {
                  e.target.src = `${API_URL}/api/characters/placeholder-avatar/${encodeURIComponent(character.name)}`;
                }}
              />
              
              <h3 className="character-name">{character.name}</h3>
              
              <p className="character-description">
                {character.description.length > 100 
                  ? character.description.substring(0, 100) + '...'
                  : character.description
                }
              </p>
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.5rem 0',
                borderTop: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                color: '#888'
              }}>
                <span>Level {character.level}</span>
                <span>{formatDate(character.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterListPage;