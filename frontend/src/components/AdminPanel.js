import React, { useState } from 'react';
import axios from 'axios';

function AdminPanel({ authToken }) {
  const [materialName, setMaterialName] = useState('');
  const [properties, setProperties] = useState([]);
  const [propertyName, setPropertyName] = useState('');

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/materials', { name: materialName, properties }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setMaterialName('');
      setProperties([]);
    } catch (error) {
      console.error('Add material failed', error);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/properties', { name: propertyName }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setPropertyName('');
    } catch (error) {
      console.error('Add property failed', error);
    }
  };

  return (
    <div>
      <h2>Add Material</h2>
      <form onSubmit={handleAddMaterial}>
        <input type="text" value={materialName} onChange={(e) => setMaterialName(e.target.value)} placeholder="Material Name" />
        {/* Input fields for adding properties */}
        <button type="submit">Add Material</button>
      </form>

      <h2>Add Property</h2>
      <form onSubmit={handleAddProperty}>
        <input type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder="Property Name" />
        <button type="submit">Add Property</button>
      </form>
    </div>
  );
}

export default AdminPanel;
