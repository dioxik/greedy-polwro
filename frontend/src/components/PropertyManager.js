import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertyManager = () => {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/properties', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties', error);
    }
  };

  const handleAddProperty = async () => {
    try {
      await axios.post('/api/properties', { property_name: newProperty }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setNewProperty('');
      fetchProperties();
    } catch (error) {
      console.error('Error adding property', error);
    }
  };

  return (
    <div>
      <h2>Manage Properties</h2>
      <input 
        type="text" 
        value={newProperty} 
        onChange={(e) => setNewProperty(e.target.value)} 
        placeholder="New Property Name"
      />
      <button onClick={handleAddProperty}>Add Property</button>
      
      <ul>
        {properties.map((property) => (
          <li key={property.id}>{property.property_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PropertyManager;
