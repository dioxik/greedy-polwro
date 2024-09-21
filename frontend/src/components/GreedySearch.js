// src/components/GreedySearch.js
import React, { useState } from 'react';
import axios from 'axios';

function GreedySearch() {
  const [property, setProperty] = useState('');
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/search', {
        params: { property, value }
      });
      setResults(response.data.materials);
      setError('');
    } catch (err) {
      setError('Failed to fetch materials');
      setResults([]);
    }
  };

  return (
    <div>
      <h2>Greedy Search</h2>
      <input
        type="text"
        value={property}
        onChange={(e) => setProperty(e.target.value)}
        placeholder="Property"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Value"
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p>{error}</p>}
      {results.length > 0 && (
        <ul>
          {results.map((material) => (
            <li key={material.id}>{material.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GreedySearch;
