import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CharacterListPage from './pages/CharacterListPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import ChatPage from './pages/ChatPage';
import { InviteKeyProvider } from './contexts/InviteKeyContext';
import InviteKeyGate from './components/InviteKeyGate';
import './App.css';

function App() {
  return (
    <InviteKeyProvider>
      <InviteKeyGate>
        <Router>
          <div className="App">
            <nav className="navbar">
              <div className="nav-container">
                <Link to="/" className="nav-logo">
                  🧙‍♂️ Wiki RPG
                </Link>
                <div className="nav-links">
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/characters" className="nav-link">Characters</Link>
                </div>
              </div>
            </nav>

            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/characters" element={<CharacterListPage />} />
                <Route path="/character/:id" element={<CharacterDetailPage />} />
                <Route path="/chat/:sessionId" element={<ChatPage />} />
              </Routes>
            </main>

            <footer className="footer">
              <p>Wiki RPG - Bring Wikipedia to life! 🌟</p>
            </footer>
          </div>
        </Router>
      </InviteKeyGate>
    </InviteKeyProvider>
  );
}

export default App;