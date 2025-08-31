import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { charactersAPI } from '../services/api';

const HomePage = () => {
  const [wikipediaUrl, setWikipediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!wikipediaUrl.trim()) {
      setError('Please enter a Wikipedia URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await charactersAPI.create(wikipediaUrl.trim());
      const characterId = response.data.character.id;
      navigate(`/character/${characterId}`);
    } catch (err) {
      console.error('Character creation error:', err);
      
      if (err.response?.status === 409) {
        setError('A character already exists for this Wikipedia page!');
      } else if (err.response?.status === 404) {
        setError('Wikipedia page not found. Please check the URL.');
      } else if (err.response?.status === 400) {
        setError('Invalid Wikipedia URL format. Please use a valid Wikipedia page URL.');
      } else {
        setError('Failed to create character. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const exampleUrls = [
    'https://en.wikipedia.org/wiki/Albert_Einstein',
    'https://en.wikipedia.org/wiki/Marie_Curie',
    'https://en.wikipedia.org/wiki/Leonardo_da_Vinci',
    'https://en.wikipedia.org/wiki/Cleopatra',
    'https://en.wikipedia.org/wiki/Nikola_Tesla'
  ];

  return (
    <div className="homepage">
      <div className="hero-section card">
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🧙‍♂️ Wiki RPG
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          textAlign: 'center', 
          marginBottom: '2rem', 
          color: '#666',
          lineHeight: '1.6'
        }}>
          Transform any Wikipedia page into a living, breathing RPG character!
          <br />
          Create characters based on historical figures, fictional characters, or anything on Wikipedia.
        </p>

        <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="form-group">
            <label className="form-label">
              Enter a Wikipedia URL to create a character:
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://en.wikipedia.org/wiki/..."
              value={wikipediaUrl}
              onChange={(e) => setWikipediaUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', fontSize: '1.1rem' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }}></div>
                Creating Character...
              </>
            ) : (
              '✨ Create Character'
            )}
          </button>
        </form>
      </div>

      <div className="examples-section card">
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Try these examples:
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          {exampleUrls.map((url, index) => {
            const name = url.split('/wiki/')[1].replace(/_/g, ' ');
            return (
              <button
                key={index}
                className="btn btn-secondary"
                onClick={() => setWikipediaUrl(url)}
                disabled={loading}
                style={{ 
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="features-section">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>🤖 AI-Generated</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Each character is uniquely generated using advanced AI, creating personalities 
              and backgrounds based on Wikipedia content.
            </p>
          </div>
          
          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>💬 Interactive Chat</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Have conversations with your characters! They remember your discussions 
              and respond in character based on their Wikipedia origins.
            </p>
          </div>
          
          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>🎮 RPG Elements</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Characters have stats, levels, and unique abilities derived from their 
              Wikipedia source material. More features coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;