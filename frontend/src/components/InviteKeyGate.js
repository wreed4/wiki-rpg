import React, { useState } from 'react';
import { useInviteKey } from '../contexts/InviteKeyContext';
import './InviteKeyGate.css';

const InviteKeyGate = ({ children }) => {
  const { isValidated, isValidating, submitKey } = useInviteKey();
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!inputKey.trim()) {
      setError('Please enter an invite key');
      return;
    }

    const isValid = await submitKey(inputKey.trim());
    if (!isValid) {
      setError('Invalid invite key. Please check your key and try again.');
      setInputKey('');
    }
  };

  if (isValidated) {
    return children;
  }

  return (
    <div className="invite-gate-container">
      <div className="invite-gate-card">
        <div className="invite-gate-header">
          <h1>🧙‍♂️ Wiki RPG</h1>
          <h2>Early Access</h2>
          <p>This application is currently in early access. Please enter your invite key to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="invite-gate-form">
          <div className="input-group">
            <label htmlFor="inviteKey">Invite Key</label>
            <input
              id="inviteKey"
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Enter your 50-character invite key"
              disabled={isValidating}
              className={error ? 'error' : ''}
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isValidating}
            className="submit-button"
          >
            {isValidating ? '🔄 Validating...' : '🚀 Access Application'}
          </button>
        </form>

        <div className="invite-gate-footer">
          <p>Don't have an invite key? This is a limited early access preview.</p>
        </div>
      </div>
    </div>
  );
};

export default InviteKeyGate;