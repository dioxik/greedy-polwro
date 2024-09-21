// src/components/GreedyInteractiveSearch.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GreedyInteractiveSearch() {
  const [questions, setQuestions] = useState([
    { property: 'name', question: 'Enter a material name:' },
    // Add more properties and questions as needed
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch initial data or reset state when needed
    setResults([]);
    setSuggestions([]);
  }, []);

  const handleAnswer = async (answer) => {
    const updatedAnswers = [...answers, { property: questions[currentQuestion].property, value: answer }];
    setAnswers(updatedAnswers);

    try {
      // Call the API with updated filters
      const response = await axios.get('http://localhost:3001/api/filter', {
        params: { filters: JSON.stringify(updatedAnswers) },
      });

      setResults(response.data.filteredMaterials);
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch filtered materials', error);
    }

    // Move to the next question or finish the search
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  return (
    <div>
      <h2>Interactive Greedy Search</h2>
      {currentQuestion < questions.length ? (
        <div>
          <p>{questions[currentQuestion].question}</p>
          <input
            type="text"
            onBlur={(e) => handleAnswer(e.target.value)}
            placeholder="Your answer..."
          />
        </div>
      ) : (
        <p>No more questions. Here are the results:</p>
      )}

      <h3>Results:</h3>
      {results.length > 0 ? (
        <ul>
          {results.map((material) => (
            <li key={material.id}>{material.name}</li>
          ))}
        </ul>
      ) : (
        <p>No exact matches found.</p>
      )}

      {suggestions.length > 0 && (
        <>
          <h3>Suggestions:</h3>
          <ul>
            {suggestions.map((material) => (
              <li key={material.id}>{material.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default GreedyInteractiveSearch;
