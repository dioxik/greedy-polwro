import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InteractiveFilter = () => {
  const [filters, setFilters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [propertyValues, setPropertyValues] = useState({});
  const [operators, setOperators] = useState({});
  const [remainingProperties, setRemainingProperties] = useState([]);

  // Fetch properties sorted by priority when component mounts
  useEffect(() => {
    axios.get('/api/properties')
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
    axios.get('/api/property-values', { params: { property_name: propertyName } })
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

  const handleOperatorChange = (property, operator) => {
    setOperators((prevOperators) => ({
      ...prevOperators,
      [property]: operator,
    }));
  };

  const handleFilterChange = (property, value) => {
    const operator = operators[property] || 'equal'; // Default operator is 'equal'

    // Check if the property filter already exists
    const existingFilterIndex = filters.findIndex((filter) => filter.property === property);

    let newFilters;

    if (existingFilterIndex !== -1) {
      // If it exists, replace the old filter with the new one
      newFilters = [...filters];
      newFilters.splice(existingFilterIndex, 1, { property, value, operator });
    } else {
      // Otherwise, add a new filter
      newFilters = [...filters, { property, value, operator }];
    }

    setFilters(newFilters);

    // Send the updated filters to the backend
    axios
      .get('/api/filter', { params: { filters: JSON.stringify(newFilters) } })
      .then((response) => {
        setMaterials(response.data.filteredMaterials);
      })
      .catch((error) => {
        console.error('Error fetching filtered materials:', error);
      });
  };

  const handleSliderChange = (property, event) => {
    const value = parseFloat(event.target.value);
    handleFilterChange(property, value);
  };

  return (
    <div>
      <h3>Select properties to filter materials:</h3>
      {remainingProperties.slice(0, 3).map((property) => (
        <div key={property.property_name}>
          <h4>{property.property_name}</h4>

          {/* Display operator buttons with pictograms */}
          <div>
            <button
              onClick={() => handleOperatorChange(property.property_name, 'lessThanOrEqual')}
              style={{ backgroundColor: operators[property.property_name] === 'lessThanOrEqual' ? 'lightblue' : '' }}
            >
              &#x2264; {/* Less than or equal to symbol */}
            </button>
            <button
              onClick={() => handleOperatorChange(property.property_name, 'equal')}
              style={{ backgroundColor: operators[property.property_name] === 'equal' ? 'lightblue' : '' }}
            >
              &#x3D; {/* Equal symbol */}
            </button>
            <button
              onClick={() => handleOperatorChange(property.property_name, 'greaterThanOrEqual')}
              style={{ backgroundColor: operators[property.property_name] === 'greaterThanOrEqual' ? 'lightblue' : '' }}
            >
              &#x2265; {/* Greater than or equal to symbol */}
            </button>
          </div>

          {propertyValues[property.property_name] ? (
            <div>
              {/* Display slider if property has more than 10 values */}
              {propertyValues[property.property_name].length > 10 ? (
                <div>
                  <input
                    type="range"
                    min={Math.min(...propertyValues[property.property_name].map((value) => parseFloat(value.property_value)))}
                    max={Math.max(...propertyValues[property.property_name].map((value) => parseFloat(value.property_value)))}
                    step={0.01}
                    onChange={(e) => handleSliderChange(property.property_name, e)}
                  />
                </div>
              ) : (
                propertyValues[property.property_name].map((value, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterChange(property.property_name, value.property_value)}
                  >
                    {value.property_value}
                  </button>
                ))
              )}
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
