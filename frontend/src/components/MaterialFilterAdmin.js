import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MaterialFilterAdmin = () => {
  const [properties, setProperties] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [propertyValues, setPropertyValues] = useState({});
  const [filterHistoryVisible, setFilterHistoryVisible] = useState(false);

  // Fetch properties on mount
  useEffect(() => {
    axios.get('/api/properties')
      .then((response) => setProperties(response.data))
      .catch((error) => console.error('Error fetching properties:', error));
  }, []);

  // Fetch available materials on mount
  useEffect(() => {
    axios.get('/api/materials')
      .then((response) => setMaterials(response.data))
      .catch((error) => console.error('Error fetching materials:', error));
  }, []);

  const handleFilterChange = (property, value, operator = 'equal') => {
    const existingFilterIndex = filters.findIndex(f => f.property === property);

    // Remove existing filter for the same property
    const newFilters = [...filters];
    if (existingFilterIndex !== -1) {
      newFilters.splice(existingFilterIndex, 1);
    }

    newFilters.push({ property, value, operator });
    setFilters(newFilters);
  };

  const fetchPropertyValues = (propertyName) => {
    if (!propertyValues[propertyName]) {
      axios.get('/api/property-values', { params: { property_name: propertyName } })
        .then((response) => {
          setPropertyValues((prevValues) => ({
            ...prevValues,
            [propertyName]: response.data,
          }));
        })
        .catch((error) => console.error('Error fetching property values:', error));
    }
  };

  const handleMaterialSelect = (materialId) => {
    const material = materials.find(m => m.id === materialId);
    setSelectedMaterial(material);
  };

  const handleFilterHistoryToggle = () => {
    setFilterHistoryVisible(!filterHistoryVisible);
  };

  return (
    <div>
      <h1>Material Filter Admin</h1>

      {/* Material Selection */}
      <h3>Select Material to Edit</h3>
      <select onChange={(e) => handleMaterialSelect(e.target.value)}>
        <option value="">Select Material</option>
        {materials.map((material) => (
          <option key={material.id} value={material.id}>
            {material.name}
          </option>
        ))}
      </select>

      {/* Filter properties */}
      <h3>Filter Materials by Properties</h3>
      {properties.map((property) => (
        <div key={property.property_name}>
          <h4>{property.property_name}</h4>
          <div>
            {propertyValues[property.property_name] ? (
              propertyValues[property.property_name].map((value) => (
                <div key={value.property_value}>
                  <button onClick={() => handleFilterChange(property.property_name, value.property_value)}>
                    {value.property_value}
                  </button>
                  <div>
                    <button onClick={() => handleFilterChange(property.property_name, value.property_value, 'lessThan')}>&lt;</button>
                    <button onClick={() => handleFilterChange(property.property_name, value.property_value, 'equal')}>=</button>
                    <button onClick={() => handleFilterChange(property.property_name, value.property_value, 'greaterThan')}>&gt;</button>
                  </div>
                </div>
              ))
            ) : (
              <button onClick={() => fetchPropertyValues(property.property_name)}>Load Values</button>
            )}
          </div>
        </div>
      ))}

      {/* Filter History Toggle */}
      <button onClick={handleFilterHistoryToggle}>
        {filterHistoryVisible ? 'Hide Filter History' : 'Show Filter History'}
      </button>

      {/* Filter History */}
      {filterHistoryVisible && (
        <div>
          <h3>Selected Filters</h3>
          <ul>
            {filters.map((filter, index) => (
              <li key={index}>
                {filter.property}: {filter.value} (Operator: {filter.operator})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit Material Section */}
      {selectedMaterial && (
        <div>
          <h3>Edit Material: {selectedMaterial.name}</h3>
          {/* Add form fields to edit material properties here */}
        </div>
      )}
    </div>
  );
};

export default MaterialFilterAdmin;
