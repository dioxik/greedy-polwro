// components/MaterialModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MaterialModal = ({ material, onClose, token, refreshMaterials }) => {
  const [properties, setProperties] = useState([]);
  const [propertyValues, setPropertyValues] = useState({});

  useEffect(() => {
    // Pobierz wszystkie właściwości dla materiału
    axios
      .get(`/api/materials/${material.id}/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setProperties(response.data);

        // Inicjalizuj wartości dla wszystkich właściwości
        const initialValues = {};
        response.data.forEach((prop) => {
          initialValues[prop.property_name] = prop.property_value || ''; // Jeśli brak wartości, ustaw pustą
        });
        setPropertyValues(initialValues);
      })
      .catch((error) => {
        console.error('Error fetching material properties:', error);
      });
  }, [material.id, token]);

  const handleSave = () => {
    // Zapisz zaktualizowane właściwości
    axios
      .post(
        `/api/materials/${material.id}/properties`,
        propertyValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        alert('Material properties updated successfully');
        onClose();
        refreshMaterials();
      })
      .catch((error) => {
        console.error('Error updating material properties:', error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit Material: {material.name}</h3>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div>
          {properties.map((prop) => (
            <div key={prop.property_id}>
              <label>{prop.property_name}:</label>
              <input
                type="text"
                value={propertyValues[prop.property_name]}
                onChange={(e) =>
                  setPropertyValues({
                    ...propertyValues,
                    [prop.property_name]: e.target.value,
                  })
                }
              />
            </div>
          ))}
        </div>
        <button onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
};

export default MaterialModal;
