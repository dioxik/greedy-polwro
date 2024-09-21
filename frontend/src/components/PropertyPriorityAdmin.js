import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertyPriorityAdmin = () => {
  const [properties, setProperties] = useState([]);

  // Pobierz właściwości z backendu przy załadowaniu komponentu
  useEffect(() => {
    axios.get('http://localhost:3001/api/properties')
      .then((response) => {
        setProperties(response.data);
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
      });
  }, []);

  // Funkcja do aktualizacji priorytetu dla danej właściwości
  const updatePriority = (propertyId, priority) => {
    axios.post('http://localhost:3001/api/update-property-priority', { property_id: propertyId, priority })
      .then(() => {
        setProperties((prevProperties) =>
          prevProperties.map((property) =>
            property.id === propertyId ? { ...property, priority } : property
          )
        );
      })
      .catch((error) => {
        console.error('Error updating property priority:', error);
      });
  };

  return (
    <div>
      <h3>Zarządzaj Priorytetami Właściwości</h3>
      <table>
        <thead>
          <tr>
            <th>Nazwa Właściwości</th>
            <th>Priorytet</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.id}>
              <td>{property.property_name}</td>
              <td>
                <input
                  type="number"
                  value={property.priority}
                  onChange={(e) => updatePriority(property.id, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyPriorityAdmin;
