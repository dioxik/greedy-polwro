// components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MaterialModal from './MaterialModal';
import PropertyPriorityAdmin from './PropertyPriorityAdmin';

const AdminPanel = ({ token }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3001/api/materials', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMaterials(response.data);
      })
      .catch((error) => {
        console.error('Error fetching materials:', error);
      });
  }, [token]);

  return (
    <div>
      <h2>Admin Panel - Manage Materials</h2>
      {PropertyPriorityAdmin}
      <table>
        <thead>
          <tr>
            <th>Material Name</th>
            <th>Category</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr key={material.id}>
              <td>{material.name}</td>
              <td>{material.category_name}</td>
              <td>{material.type_name}</td>
              <td>
                <button onClick={() => setSelectedMaterial(material)}>
                  Edit
                </button>
              </td>
            </tr> 
          ))}
        </tbody>
      </table>

      {selectedMaterial && (
        <MaterialModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          token={token}
          refreshMaterials={() => {
            // Refresh the materials list after editing
            axios
              .get('http://localhost:3001/api/materials', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              .then((response) => {
                setMaterials(response.data);
              })
              .catch((error) => {
                console.error('Error fetching materials:', error);
              });
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;
