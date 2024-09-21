import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertyPriorityAdmin = () => {
  const [properties, setProperties] = useState([]);
  const [priorities, setPriorities] = useState({});

  // Fetch properties and their priorities
  useEffect(() => {
    axios.get('http://localhost:3001/api/properties').then((response) => {
      setProperties(response.data);

      // Initialize priorities with the current values (assuming backend returns them)
      const initialPriorities = {};
      response.data.forEach((property) => {
        initialPriorities[property.id] = property.priority || 0; // Default priority is 0 if not set
      });
      setPriorities(initialPriorities);
    });
  }, []);

  const handlePriorityChange = (propertyId, value) => {
    setPriorities({
      ...priorities,
      [propertyId]: value,
    });
  };

  const handleSave = () => {
    // Send updated priorities to the backend
    axios
      .post('http://localhost:3001/api/properties/priorities', priorities)
      .then(() => {
        alert('Priorities updated successfully');
      })
      .catch((error) => {
        console.error('Error saving priorities:', error);
      });
  };

  return (
    <div>
      <h2>Property Priority Management</h2>
      <div>
        {properties.map((property) => (
          <div key={property.id}>
            <label>
              {property.property_name}: {priorities[property.id]}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={priorities[property.id]}
              onChange={(e) => handlePriorityChange(property.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button onClick={handleSave}>Save Priorities</button>
    </div>
  );
};

export default PropertyPriorityAdmin;
