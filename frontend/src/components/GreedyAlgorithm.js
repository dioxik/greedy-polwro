// GreedyAlgorithm.js
import React, { useState, useEffect } from 'react';

function GreedyAlgorithm() {
  const [materials, setMaterials] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    // Initial fetch of all materials
    fetch('/api/filter?filters=' + JSON.stringify(filters))
      .then((response) => response.json())
      .then((data) => {
        setMaterials(data.filteredMaterials);
        setSuggestions(data.suggestions);
      })
      .catch((error) => console.error('Error fetching materials:', error));
  }, [filters]);

  const handleAddFilter = (property, value, type) => {
    // Add a new filter based on user input
    setFilters([...filters, { property, value, type }]);
  };

  const askQuestion = () => {
    // Example question: Customize according to your material properties
    const question = prompt(
      'Please specify the minimum temperature resistance required:'
    );
    if (question) {
      handleAddFilter('temperatureResistance', parseFloat(question), 'min');
    }
  };

  return (
    <div>
      <h2>Greedy Search Algorithm</h2>
      <button onClick={askQuestion}>Ask Question</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            {/* Add headers for other material properties here */}
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr key={material.id}>
              <td>{material.id}</td>
              <td>{material.name}</td>
              {/* Display other properties here */}
            </tr>
          ))}
        </tbody>
      </table>

      {suggestions.length > 0 && (
        <div>
          <h3>Suggested Materials</h3>
          <ul>
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>{suggestion.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GreedyAlgorithm;
