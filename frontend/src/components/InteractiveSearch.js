import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InteractiveSearch = () => {
  const [step, setStep] = useState(0); // Track current question step
  const [filters, setFilters] = useState({}); // Store user's choices
  const [materials, setMaterials] = useState([]); // Filtered materials
  const [suggestions, setSuggestions] = useState([]); // Suggestions when no match

  // Questions to be asked
  const questions = [
    { property: 'strength', question: 'What material strength are you looking for?', options: ['Low', 'Medium', 'High'] },
    { property: 'flexibility', question: 'What flexibility level do you need?', options: ['Rigid', 'Flexible'] },
    { property: 'temperature_resistance', question: 'What temperature resistance are you looking for?', options: ['Low', 'Medium', 'High'] },
  ];

  // Handle user choice for each question
  const handleChoice = (property, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [property]: value }));
    setStep(step + 1); // Go to the next question
  };

  // Fetch filtered materials from the server
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      axios.get(`/api/filter`, { params: { filters: JSON.stringify(filters) } })
        .then(res => {
          setMaterials(res.data.filteredMaterials);
          setSuggestions(res.data.suggestions);
        })
        .catch(error => {
          console.error('Error fetching filtered materials:', error);
        });
    }
  }, [filters]);

  return (
    <div>
      <h2>Interactive Material Search</h2>
      {step < questions.length ? (
        <div>
          <p>{questions[step].question}</p>
          {questions[step].options.map(option => (
            <button key={option} onClick={() => handleChoice(questions[step].property, option)}>
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <h3>Results</h3>
          {materials.length > 0 ? (
            <ul>
              {materials.map(material => (
                <li key={material.id}>{material.name}</li>
              ))}
            </ul>
          ) : (
            <div>
              <p>No exact matches. Here are some suggestions:</p>
              <ul>
                {suggestions.map(suggestion => (
                  <li key={suggestion.id}>{suggestion.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveSearch;
