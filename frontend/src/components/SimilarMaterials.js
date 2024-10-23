// SimilarMaterials.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimilarMaterials = ({ filteredMaterials }) => {
  const [similarMaterials, setSimilarMaterials] = useState([]);

  useEffect(() => {
    const fetchSimilarMaterials = async () => {
      try {
        const response = await axios.post('/api/similar_materials', {
          materials: filteredMaterials,
        });
        setSimilarMaterials(response.data);
      } catch (error) {
        console.error('Error fetching similar materials:', error);
      }
    };

    if (filteredMaterials.length > 0) {
      fetchSimilarMaterials();
    }
  }, [filteredMaterials]);

  return (
    <div>
      <h2>Similar Materials</h2>
      <ul>
        {similarMaterials.map((material, index) => (
          <li key={index}>{material.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SimilarMaterials;