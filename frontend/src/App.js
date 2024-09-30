// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import InteractiveFilter from './components/InteractiveFilter';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import axios from 'axios';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [isLoading, setIsLoading] = useState(true); // Dodaj stan ładowania

  useEffect(() => {
    // Sprawdź token przy uruchomieniu
    const validateToken = async () => {
      if (token) {
        try {
          await axios.get('/api/validate_token', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error('Invalid token:', error);
          handleLogout(); // Wyloguj, jeśli token jest nieprawidłowy
        }
      }
      setIsLoading(false); // Zakończ ładowanie po sprawdzeniu tokenu
    };

    validateToken();
  }, []);

  const handleLogin = (authToken) => {
    setToken(authToken);
    localStorage.setItem('authToken', authToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
    alert('Logged out successfully');
  };

  if (isLoading) {
    return <div>Loading...</div>; // Wyświetl komunikat ładowania
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="navbar">
            <div className="logo">
              <Link to="/">Material Search App</Link>
            </div>
            <ul className="menu">
              {token ? (
                <>
                  <li>
                    <Link to="/admin">Admin Panel</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login">Login</Link>
                </li>
              )}
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<InteractiveFilter />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/admin"
              element={token ? <AdminPanel token={token} /> : <Login onLogin={handleLogin} />}
            />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2024 Material Search App. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
