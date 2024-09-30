import React, { useState } from 'react';
import MaterialEditor from './MaterialEditor'; 
import PropertyPrioritization from './PropertyPrioritization'; 
import PropertyManager from './PropertyManager';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('materials'); // Default section
  
  return (
    <div className="admin-panel">
      <header>
        <h1>Admin Panel</h1>
        <nav>
          <button onClick={() => setActiveSection('materials')}>Edit Materials</button>
          <button onClick={() => setActiveSection('propertyPrioritization')}>Property Prioritization</button>
          
          <button onClick={() => setActiveSection('propertyManager')}>Manage Properties</button>
        </nav>
      </header>
      
      <main>
        {activeSection === 'materials' && <MaterialEditor />}
        {activeSection === 'propertyPrioritization' && <PropertyPrioritization />}
        {activeSection === 'propertyManager' && <PropertyManager />}
      </main>

      <style jsx>{`
        .admin-panel {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
        }

        nav button {
          margin: 0 10px;
          padding: 10px 15px;
          font-size: 16px;
          background-color: #007bff;
          border: none;
          color: white;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }

        nav button:hover {
          background-color: #0056b3;
        }

        main {
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
