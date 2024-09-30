import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css'; // Include a CSS file for the improved styles

const PropertyPriority = () => {
  const [properties, setProperties] = useState([]);

  // Fetch properties from the backend
  useEffect(() => {
    axios.get('/api/properties', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Use the correct token name
      },
    })
    .then((response) => setProperties(response.data))
    .catch((error) => console.error('Error fetching properties:', error));
  }, []);

  // Handle slider change
  const handlePriorityChange = (id, priority) => {
    setProperties(properties.map(property =>
      property.id === id ? { ...property, priority } : property
    ));
  };

  // Save priorities to the backend
  const savePriorities = () => {
    const updatedPriorities = properties.reduce((acc, prop) => {
      acc[prop.id] = prop.priority;
      return acc;
    }, {});
    
    axios.post('/api/properties/priorities', updatedPriorities, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    .then(() => alert('Priorities saved successfully'))
    .catch((error) => console.error('Error saving priorities:', error));
  };

  return (
    <div className="priority-manager">
      <h2>Property Priority Manager</h2>
      <div className="property-list">
        {properties.map((property) => (
          <div key={property.id} className="property-item">
            <span className="property-name">{property.property_name}</span>
            <input
              type="range"
              min="1"
              max="10"
              value={property.priority}
              onChange={(e) => handlePriorityChange(property.id, e.target.value)}
              className="property-slider"
            />
            <span>{property.priority}</span>
          </div>
        ))}
      </div>
      <button onClick={savePriorities} className="save-button">Save Priorities</button>
    </div>
  );
};

export default PropertyPriority;
