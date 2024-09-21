import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InteractiveFilter = () => {
  const [filters, setFilters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [propertyValues, setPropertyValues] = useState({});
  const [remainingProperties, setRemainingProperties] = useState([]);

  // Fetch properties sorted by priority when component mounts
  useEffect(() => {
    axios.get('http://localhost:3001/api/properties')
      .then((response) => {
        setAvailableProperties(response.data);
        setRemainingProperties(response.data);

        response.data.forEach((property) => {
          fetchPropertyValues(property.property_name);
        });
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
      });
  }, []);

  const fetchPropertyValues = (propertyName) => {
    axios.get('http://localhost:3001/api/property-values', { params: { property_name: propertyName } })
      .then((response) => {
        setPropertyValues((prevValues) => ({
          ...prevValues,
          [propertyName]: response.data,
        }));
      })
      .catch((error) => {
        console.error('Error fetching property values:', error);
      });
  };

  const handleFilterChange = (property, value) => {
    const newFilters = [...filters, { property, value }];
    setFilters(newFilters);

    // Filter out the selected property from available options
    const updatedRemainingProperties = remainingProperties.filter((p) => p.property_name !== property);
    setRemainingProperties(updatedRemainingProperties);

    // Fetch filtered materials based on selected filters
    axios.get('http://localhost:3001/api/filter', { params: { filters: JSON.stringify(newFilters) } })
      .then((response) => {
        setMaterials(response.data.filteredMaterials);
      })
      .catch((error) => {
        console.error('Error fetching filtered materials:', error);
      });
  };

  return (
    <div>
      <h3>Select properties to filter materials:</h3>
      {remainingProperties.slice(0, 3).map((property) => (
        <div key={property.property_name}>
          <h4>{property.property_name}</h4>
          {propertyValues[property.property_name] ? (
            <div>
              {propertyValues[property.property_name].map((value, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterChange(property.property_name, value.property_value)}
                >
                  {value.property_value}
                </button>
              ))}
            </div>
          ) : (
            <p>Loading values...</p>
          )}
        </div>
      ))}

      <h3>Filtered Materials:</h3>
      <ul>
        {materials.map((material) => (
          <li key={material.id}>
            {material.name} - {material.category_name} - {material.type_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InteractiveFilter;
