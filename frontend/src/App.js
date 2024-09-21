// src/App.js
//import React from 'react';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';


import GreedyInteractiveSearch from './components/GreedyInteractiveSearch';
import GreedyAlgorithm from './components/GreedyAlgorithm';//InteractiveFilter
import InteractiveSearch from './components/InteractiveSearch';
import InteractiveFilter from './components/InteractiveFilter';



import AdminPanel from './components/AdminPanel';
import PropertyPriorityAdmin from './components/PropertyPriorityAdmin';
import Login from './components/Login';


function App() {
  const [authToken, setAuthToken] = useState(null);
  const [token, setToken] = useState(null);
  const handleLogin = (token) => {
    setToken(token);
  };
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="navbar">
            <div className="logo">Greedy Search App</div>
            <nav className="menu">
              <ul>
                <li>
                  <Link to="/settings">
                    <i className="fas fa-cogs"></i> Settings
                  </Link>
                </li>
                <li>
                  <a href="#about">
                    <i className="fas fa-info-circle"></i> About
                  </a>
                </li>
                <li>
                  <a href="#logout">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main>
          <Routes>
          
          <Route path="/" element={<InteractiveFilter />} />
            <Route path="/settings" element={<Login onLogin={handleLogin} />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/properties-priority" element={<PropertyPriorityAdmin />} /> {/* Nowa trasa */}

          </Routes>
        </main>
        <footer>
          <p>&copy; 2024 Greedy Search App. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;