import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MaterialEditPopup = ({ material, onClose }) => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // Fetch properties for the selected material
    axios.get(`/api/material/${material.id}/properties`)
      .then(response => {
        setProperties(response.data);
      })
      .catch(error => {
        console.error('Error fetching material properties:', error);
      });
  }, [material.id]);

  const handleSave = () => {
    // Save the updated material properties
    axios.post(`/api/material/${material.id}/update`, { properties })
      .then(response => {
        console.log('Material updated successfully');
        onClose();
      })
      .catch(error => {
        console.error('Error updating material:', error);
      });
  };

  return (
    <div className="popup">
      <h2>Edit Material: {material.name}</h2>
      <div>
        {properties.map((property) => (
          <div key={property.id}>
            <label>{property.property_name}</label>
            <input
              type="text"
              value={property.property_value}
              onChange={(e) => {
                const updatedProperties = properties.map(p =>
                  p.id === property.id ? { ...p, property_value: e.target.value } : p
                );
                setProperties(updatedProperties);
              }}
            />
          </div>
        ))}
      </div>
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default MaterialEditPopup;
