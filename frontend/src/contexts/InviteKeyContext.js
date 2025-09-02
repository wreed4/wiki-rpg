import React, { createContext, useContext, useState, useEffect } from 'react';

const InviteKeyContext = createContext();

export const useInviteKey = () => {
  const context = useContext(InviteKeyContext);
  if (!context) {
    throw new Error('useInviteKey must be used within an InviteKeyProvider');
  }
  return context;
};

export const InviteKeyProvider = ({ children }) => {
  const [inviteKey, setInviteKey] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('wiki-rpg-invite-key');
    if (storedKey) {
      setInviteKey(storedKey);
      validateKey(storedKey);
    }
  }, []);

  const validateKey = async (key) => {
    if (!key) return false;

    console.log('API_URL:', process.env.REACT_APP_API_URL);
    setIsValidating(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/validate-invite`, {
        headers: {
          'x-invite-key': key,
        },
      });

      if (response.ok) {
        setIsValidated(true);
        localStorage.setItem('wiki-rpg-invite-key', key);
        return true;
      } else {
        setIsValidated(false);
        localStorage.removeItem('wiki-rpg-invite-key');
        setInviteKey(null);
        return false;
      }
    } catch (error) {
      console.error('Key validation error:', error);
      setIsValidated(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const submitKey = async (key) => {
    setInviteKey(key);
    return await validateKey(key);
  };

  const clearKey = () => {
    setInviteKey(null);
    setIsValidated(false);
    localStorage.removeItem('wiki-rpg-invite-key');
  };

  return (
    <InviteKeyContext.Provider
      value={{
        inviteKey,
        isValidated,
        isValidating,
        submitKey,
        clearKey,
      }}
    >
      {children}
    </InviteKeyContext.Provider>
  );
};