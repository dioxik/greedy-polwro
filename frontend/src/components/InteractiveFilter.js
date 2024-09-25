import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InteractiveFilter = () => {
  const [filters, setFilters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [propertyValues, setPropertyValues] = useState({});
  const [remainingProperties, setRemainingProperties] = useState([]);
  const [selectedOperators, setSelectedOperators] = useState({});
  const [showHistory, setShowHistory] = useState(false); // State to toggle history display

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
    const operator = selectedOperators[property] || 'equal'; // Default to 'equal' if no operator selected

    // Check if the property is already in the filters, if so, remove it
    const existingFilterIndex = filters.findIndex(f => f.property === property);
    let newFilters = [...filters];

    if (existingFilterIndex !== -1) {
      newFilters.splice(existingFilterIndex, 1); // Remove the previous filter
    } else {
      // Add the new filter with the selected operator
      newFilters.push({ property, value, operator });
    }

    setFilters(newFilters);

    axios
      .get('http://localhost:3001/api/filter', { params: { filters: JSON.stringify(newFilters) } })
      .then((response) => {
        setMaterials(response.data.filteredMaterials);
      })
      .catch((error) => {
        console.error('Error fetching filtered materials:', error);
      });
  };

  const handleOperatorChange = (property, operator) => {
    setSelectedOperators((prevOperators) => ({
      ...prevOperators,
      [property]: operator,
    }));
  };

  // Toggle the history section
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Function to remove or edit a filter from the history
  const removeFilter = (property) => {
    const newFilters = filters.filter(f => f.property !== property);
    setFilters(newFilters);

    // Refetch materials with the updated filters
    axios
      .get('http://localhost:3001/api/filter', { params: { filters: JSON.stringify(newFilters) } })
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

          {/* Operator buttons */}
          <div>
            <button
              onClick={() => handleOperatorChange(property.property_name, 'lessOrEqual')}
              style={{
                backgroundColor: selectedOperators[property.property_name] === 'lessOrEqual' ? '#ddd' : '#fff'
              }}
            >
              <span>&le;</span> {/* Less than or equal to icon */}
            </button>
            <button
              onClick={() => handleOperatorChange(property.property_name, 'equal')}
              style={{
                backgroundColor: selectedOperators[property.property_name] === 'equal' ? '#ddd' : '#fff'
              }}
            >
              <span>=</span> {/* Equal icon */}
            </button>
            <button
              onClick={() => handleOperatorChange(property.property_name, 'greaterOrEqual')}
              style={{
                backgroundColor: selectedOperators[property.property_name] === 'greaterOrEqual' ? '#ddd' : '#fff'
              }}
            >
              <span>&ge;</span> {/* Greater than or equal to icon */}
            </button>
          </div>

          {/* Property value buttons */}
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

      {/* History Section */}
      <div>
        <a href="#" onClick={toggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </a>

        {showHistory && (
          <div>
            <h3>Filter History:</h3>
            <ul>
              {filters.map((filter, index) => (
                <li key={index}>
                  {filter.property} {filter.operator} {filter.value}
                  <button onClick={() => removeFilter(filter.property)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveFilter;
