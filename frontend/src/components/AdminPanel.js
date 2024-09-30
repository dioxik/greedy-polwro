import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css'; // Import pliku CSS dla styli

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('materials');
  const [properties, setProperties] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [newProperty, setNewProperty] = useState('');
  const [priorities, setPriorities] = useState({});
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showMaterialPopup, setShowMaterialPopup] = useState(false);
  const [materialProperties, setMaterialProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
    fetchMaterials();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/properties', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setProperties(response.data);

      // Inicjalizuj priorytety
      const initialPriorities = {};
      response.data.forEach((property) => {
        initialPriorities[property.id] = property.priority || 0;
      });
      setPriorities(initialPriorities);
    } catch (error) {
      console.error('Error fetching properties', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/api/materials', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials', error);
    }
  };

  const handleAddProperty = async () => {
    try {
      await axios.post('/api/properties', { property_name: newProperty }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setNewProperty('');
      fetchProperties();
    } catch (error) {
      console.error('Error adding property', error);
    }
  };

  const handlePriorityChange = (propertyId, value) => {
    setPriorities({
      ...priorities,
      [propertyId]: parseInt(value, 10), // Upewnij się, że wartość jest liczbą
    });
  };

  const handleSavePriorities = () => {
    axios.post('/api/properties/priorities', priorities, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
    })
      .then(() => alert('Priorities saved successfully'))
      .catch((error) => console.error('Error saving priorities:', error));
  };

  const handleEditMaterial = async (material) => {
    setSelectedMaterial(material);
    setShowMaterialPopup(true);

    try {
      const response = await axios.get(`/api/materials/${material.id}/properties`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setMaterialProperties(response.data);
    } catch (error) {
      console.error('Error fetching material properties', error);
    }
  };

  const handleMaterialPropertyChange = (propertyId, value) => {
    setMaterialProperties(prevProperties =>
      prevProperties.map(property =>
        property.property_id === propertyId ? { ...property, property_value: value } : property
      )
    );
  };

  const handleSaveMaterial = async () => {
    try {
      const updatedProperties = materialProperties.map(({ property_id, property_value }) => ({ id: property_id, value: property_value }));
      await axios.post(`http://localhost:3001/api/materials/${selectedMaterial.id}/properties`, updatedProperties, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setShowMaterialPopup(false);
      fetchMaterials();
    } catch (error) {
      console.error('Error saving material properties', error);
    }
  };

  const handleDeleteMaterial = (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      axios.delete(`/api/materials/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
        .then(() => {
          alert('Material deleted successfully');
          fetchMaterials();
        })
        .catch((error) => console.error('Error deleting material:', error));
    }
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="section-tabs">
        <button
          onClick={() => setActiveSection('materials')}
          className={activeSection === 'materials' ? 'active' : ''}
        >
          Materials
        </button>
        <button
          onClick={() => setActiveSection('properties')}
          className={activeSection === 'properties' ? 'active' : ''}
        >
          Properties
        </button>
      </div>

      <div className="section-content">
        {activeSection === 'materials' && (
          <div className="materials-section">
            <h2>Materials</h2>
            <ul>
              {materials.map((material) => (
                <li key={material.id}>
                  {material.name} - {material.category_name} - {material.type_name}
                  <button onClick={() => handleEditMaterial(material)}>Edit</button>
                  <button onClick={() => handleDeleteMaterial(material.id)} className="delete-button">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'properties' && (
          <div className="properties-section">
            <h2>Properties</h2>

            <h3>Add New Property</h3>
            <div className="add-property">
              <input
                type="text"
                value={newProperty}
                onChange={(e) => setNewProperty(e.target.value)}
                placeholder="New Property Name"
              />
              <button onClick={handleAddProperty}>Add Property</button>
            </div>

            <h3>Manage Property Priorities</h3>
            <div className="property-priorities">
              {properties.map((property) => (
                <div key={property.id} className="priority-item">
                  <label htmlFor={`priority-${property.id}`}>
                    {property.property_name}:
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={priorities[property.id]}
                    onChange={(e) => handlePriorityChange(property.id, e.target.value)}
                    id={`priority-${property.id}`}
                  />
                  <span className="priority-value">{priorities[property.id]}</span>
                </div>
              ))}
              <button onClick={handleSavePriorities}>Save Priorities</button>
            </div>
          </div>
        )}
      </div>

      {/* Popup do edycji materiału */}
      {showMaterialPopup && selectedMaterial && (
        <div className="material-popup">
          <div className="popup-content material-popup-content"> {/* Dodano klasę material-popup-content */}
            <h3>Edit Material: {selectedMaterial.name}</h3>
            <button className="close-button" onClick={() => setShowMaterialPopup(false)}>
              &times;
            </button>
            <div className="property-list">
              {materialProperties.map((property) => (
                <div key={property.property_id} className="property-item">
                  <label htmlFor={`property-${property.property_id}`}>
                    {property.property_name}:
                  </label>
                  <input
                    type="text"
                    id={`property-${property.property_id}`}
                    value={property.property_value}
                    onChange={(e) => handleMaterialPropertyChange(property.property_id, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSaveMaterial}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
