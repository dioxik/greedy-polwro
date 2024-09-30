// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import GreedyAlgorithm from './components/InteractiveFilter';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import PropertyPriorityAdmin from './components/PropertyPriorityAdmin';
import axios from 'axios';
import InteractiveFilter from './components/InteractiveFilter';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);

  const handleLogin = (authToken) => {
    setToken(authToken);
    localStorage.setItem('authToken', authToken);
  };

  const handleLogout = () => {
    axios
      .post(
        '/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setToken(null);
        localStorage.removeItem('authToken');
        alert('Logged out successfully');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="navbar">
            <div className="logo">Material Search App</div>
            <nav className="menu">
              <ul>
                {token != null ? (
                  <>
                    <li>
                      <Link to="/admin">
                        <i className="fas fa-cogs"></i> Admin Panel
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login">
                        <i className="fas fa-sign-in-alt"></i> Login
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <a href="#about">
                    <i className="fas fa-info-circle"></i> About
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<InteractiveFilter />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            {token && (
              <Route path="/admin" element={<AdminPanel token={token} />} />
            )}
            {/* Add other protected routes here */}
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
