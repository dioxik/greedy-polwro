import React, { useState } from 'react';
import axios from 'axios';

const MaterialAdder = () => {
  const [materialName, setMaterialName] = useState('');

  const handleAddMaterial = async () => {
    try {
      await axios.post('/api/materials', { name: materialName }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMaterialName('');
    } catch (error) {
      console.error('Error adding material', error);
    }
  };

  return (
    <div>
      <h2>Add New Material</h2>
      <input 
        type="text" 
        value={materialName} 
        onChange={(e) => setMaterialName(e.target.value)} 
        placeholder="Material Name"
      />
      <button onClick={handleAddMaterial}>Add Material</button>
    </div>
  );
};

export default MaterialAdder;
