import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatAPI } from '../services/api';

const ChatPage = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatSession();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSession = async () => {
    try {
      setLoading(true);
      const messagesResponse = await chatAPI.getMessages(sessionId);
      setMessages(messagesResponse.data);
      
      // Get character info from first message if available
      if (messagesResponse.data.length > 0) {
        // For now, we'll need to make an additional call to get character info
        // In a real app, you might include this in the session data
      }
    } catch (err) {
      console.error('Error fetching chat session:', err);
      setError('Failed to load chat session');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistically add user message
    const userMessage = {
      id: Date.now(),
      sender_type: 'user',
      message: messageText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatAPI.sendMessage(sessionId, messageText);
      
      // Add character response
      const characterMessage = {
        id: Date.now() + 1,
        sender_type: 'character',
        message: response.data.characterResponse,
        created_at: response.data.timestamp
      };
      
      setMessages(prev => [...prev, characterMessage]);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      
      // Remove the optimistic user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setNewMessage(messageText); // Restore the message text
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <br />
        <Link to="/characters" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Characters
        </Link>
      </div>
    );
  }

  const characterName = messages.length > 0 && messages[0].sender_type === 'character' 
    ? 'Character' 
    : 'Character';

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-avatar">
            👤
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{characterName}</h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
              Online • Chat Session
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Link to="/characters" className="btn" style={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              Back to Characters
            </Link>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id || Math.random()} className={`message ${message.sender_type}`}>
              <div>{message.message}</div>
              <div style={{ 
                fontSize: '0.75rem', 
                opacity: 0.7, 
                marginTop: '0.25rem' 
              }}>
                {formatTime(message.created_at)}
              </div>
            </div>
          ))}
          
          {sending && (
            <div className="message character" style={{ opacity: 0.7 }}>
              <div>
                <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>
                  ⌨️ Typing...
                </span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            maxLength={1000}
          />
          <button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? '...' : 'Send'}
          </button>
        </form>
      </div>

      {messages.length === 0 && (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>Welcome to your chat session!</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Start a conversation with your character. They'll respond based on their Wikipedia background and personality.
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            💡 Try asking about their background, interests, or opinions on various topics!
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;