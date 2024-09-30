import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MaterialEditor = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [properties, setProperties] = useState([]); // Lista właściwości
  const [newMaterial, setNewMaterial] = useState({ name: '', category: '', type: '' });
  const [isAdding, setIsAdding] = useState(false); // Toggle between adding mode
  useEffect(() => {
    fetchMaterials();
  }, []);

  // Pobieranie materiałów
  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/api/materials', { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials', error);
    }
  };
// Handle delete material
const deleteMaterial = (id) => {
  if (window.confirm('Are you sure you want to delete this material?')) {
    axios.delete(`/api/materials/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    .then(() => {
      alert('Material deleted successfully');
      fetchMaterials(); // Refresh the materials list
    })
    .catch((error) => console.error('Error deleting material:', error));
  }
};

// Handle add new material
const addMaterial = () => {
  axios.post('/api/materials', newMaterial, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  })
  .then(() => {
    alert('Material added successfully');
    fetchMaterials(); // Refresh the materials list
    setIsAdding(false); // Exit adding mode
    setNewMaterial({ name: '', category: '', type: '' }); // Reset form
  })
  .catch((error) => console.error('Error adding material:', error));
};
  // Funkcja edycji materiału
  const handleEditMaterial = async (material) => {
    setSelectedMaterial(material);
    setShowPopup(true);

    // Pobieranie istniejących właściwości materiału
    try {
      const response = await axios.get(`/api/materials/${material.id}/properties`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      setProperties(response.data); // Zakładamy, że dane właściwości są w postaci {id, name, value}
    } catch (error) {
      console.error('Error fetching material properties', error);
    }
  };

  // Zmiana wartości właściwości
  const handlePropertyChange = (propertyId, value) => {
    setProperties((prevProperties) =>
      prevProperties.map((property) =>
        property.id === propertyId ? { ...property, value: value } : property
      )
    );
  };

  // Zapis zmian materiału
  const handleSave = async () => {
    try {
      const updatedProperties = properties.map(({ id, value }) => ({ id, value }));
      await axios.post(`/api/materials/${selectedMaterial.id}/properties`, updatedProperties, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      setShowPopup(false);
      fetchMaterials(); // Odświeżenie listy materiałów po zapisie
    } catch (error) {
      console.error('Error saving material properties', error);
    }
  };

  return (
    <div>
      <h2>Edit Materials</h2>
      <ul>
        {materials.map((material) => (
          <li key={material.id}>
            {material.name}
            <button onClick={() => handleEditMaterial(material)}>Edit</button>
            <button onClick={() => deleteMaterial(material.id)} className="delete-button">Delete</button>
          </li>
        ))}
      </ul>

      {showPopup && selectedMaterial && (
        <div className="popup">
          <h3>Edit {selectedMaterial.name}</h3>
          <div className="property-list">
            {properties.map((property) => (
              <div className="property-item" key={property.property_id}>
                <label>{property.property_name}</label>
                <input
                  type="text"
                  value={property.property_value}
                  onChange={(e) => handlePropertyChange(property.property_id, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="buttons">
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}

       {/* Toggle to show add new material form */}
       <button onClick={() => setIsAdding(!isAdding)} className="toggle-add-button">
        {isAdding ? 'Cancel' : 'Add New Material'}
      </button>

      {/* Add New Material Form */}
      {isAdding && (
        <div className="add-material-form">
          <h3>Add New Material</h3>
          <input
            type="text"
            placeholder="Material Name"
            value={newMaterial.name}
            onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category"
            value={newMaterial.category}
            onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
          />
          <input
            type="text"
            placeholder="Type"
            value={newMaterial.type}
            onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
          />
          <button onClick={addMaterial} className="add-button">Add Material</button>
        </div>
      )}

      <style jsx>{`
        ul {
          padding: 0;
          list-style: none;
        }

        ul li {
          margin: 10px 0;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
          display: flex;
          justify-content: space-between;
        }

        ul li button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
        }

        ul li button:hover {
          background-color: #0056b3;
        }

        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        .popup h3 {
          margin-bottom: 20px;
        }

        .property-list {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        .property-item {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }

        .property-item label {
          font-size: 14px;
          margin-bottom: 5px;
          color: #555;
        }

        .property-item input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .buttons {
          display: flex;
          justify-content: space-between;
        }

        .buttons button {
          padding: 8px 12px;
          background-color: #007bff;
          border: none;
          color: white;
          cursor: pointer;
          border-radius: 5px;
        }

        .buttons button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default MaterialEditor;
