// server.js or app.js
const express = require('express');
const knex = require('knex');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Configure CORS
app.use(cors({
  origin: true, // Automatically sets the correct origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Setup the database connection (assuming Knex configuration is done)
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: '../data/mydatabse.db', // Adjust according to your setup
  },
  useNullAsDefault: true,
});

// Endpoint to get distinct property values
app.get('/api/property-values', async (req, res) => {
  const { property_name } = req.query;

  try {
    // Get the property ID from the dictionary
    const property = await db('properties_dictionary')
      .select('id')
      .where({ property_name })
      .first();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    const propertyValues = await db.raw(`
      WITH RECURSIVE RangeSeries(id, material_id, property_id, property_value) AS (
        -- Pobierz dolną granicę zakresu i zaokrąglij do 2 miejsc po przecinku
        SELECT id, material_id, property_id,
               ROUND(CAST(REPLACE(substr(property_value, 1, instr(property_value, '÷') - 1), ',', '.') AS REAL), 2) AS property_value
        FROM material_properties
        WHERE property_id = ? AND instr(property_value, '÷') > 0
        
        UNION ALL
        
        -- Dodawaj 0.01 i zaokrąglij do 2 miejsc po przecinku
        SELECT id, material_id, property_id, ROUND(property_value + 0.01, 2)
        FROM RangeSeries
        WHERE property_value + 0.01 <= (
          SELECT ROUND(CAST(REPLACE(substr(property_value, instr(property_value, '÷') + 1), ',', '.') AS REAL), 2)
          FROM material_properties
          WHERE property_id = ? AND instr(property_value, '÷') > 0
        )
      )
      -- Wybierz wszystkie wygenerowane wartości z zakresów i zaokrąglij do 2 miejsc po przecinku
      SELECT id, material_id, property_id, ROUND(property_value, 2) AS property_value FROM RangeSeries
    
      UNION
    
      -- Wybierz oryginalne wartości, które nie są zakresami i zaokrąglij do 2 miejsc po przecinku
      SELECT id, material_id, property_id,
             ROUND(CAST(REPLACE(property_value, ',', '.') AS REAL), 2) AS property_value
      FROM material_properties
      WHERE property_id = ? AND instr(property_value, '÷') = 0
    `, [property.id, property.id, property.id]);
    
    
  
  
    res.json(propertyValues);
  } catch (error) {
    console.error('Error fetching property values:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/properties', async (req, res) => {
  try {
    const properties = await db('properties_dictionary').select('*').orderBy('priority', 'desc');
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to update property priorities
app.post('/api/properties/priorities', async (req, res) => {
  const priorities = req.body;

  try {
    const promises = Object.entries(priorities).map(([propertyId, priority]) =>
      db('properties_dictionary').where('id', propertyId).update({ priority })
    );

    await Promise.all(promises);

    res.send('Priorities updated successfully');
  } catch (error) {
    console.error('Error updating priorities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// server.js or app.js

// Dynamic filtering based on user input with operators
app.get('/api/filter', async (req, res) => {
  const { filters } = req.query;

  try {
    // Parse the filters and ensure it's an array
    let parsedFilters = [];
    if (filters) {
      parsedFilters = JSON.parse(filters);
    }

    // Check if parsedFilters is an array
    if (!Array.isArray(parsedFilters)) {
      return res.status(400).json({ error: 'Invalid filters format. Expected an array.' });
    }

    // Start the base query
    let query = `
      SELECT DISTINCT m.id, m.name, c.category_name, t.type_name
      FROM materials m
      JOIN categories c ON m.category_id = c.id
      JOIN types t ON m.type_id = t.id
      JOIN material_properties mp ON mp.material_id = m.id
      JOIN properties_dictionary p ON mp.property_id = p.id
      WHERE 1 = 1
    `;

    const queryParams = [];

    // Dynamically add filters to query with comparison operators
    parsedFilters.forEach((filter) => {
      let operator = '=';
      
      // Set operator based on the filter's operator field
      switch (filter.operator) {
        case 'lessThanOrEqual':
          operator = '<=';
          break;
        case 'equal':
          operator = '=';
          break;
        case 'greaterThanOrEqual':
          operator = '>=';
          break;
        default:
          operator = '='; // Default is 'equal' if not specified
      }

      query += `
        AND m.id IN (
          SELECT material_id FROM material_properties
          WHERE property_id = (
            SELECT id FROM properties_dictionary WHERE property_name = ?
          )
          AND property_value ${operator} ?
        )
      `;
      queryParams.push(filter.property, filter.value);
    });

    // Execute the dynamic query
    const results = await db.raw(query, queryParams);
    res.json({ filteredMaterials: results });
  } catch (error) {
    console.error('Error during filtering:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route for user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db('users').where({ username }).first();

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '1h' });
    await db('sessions').insert({ user_id: user.id, session_token: token, expires_at: new Date(Date.now() + 3600000) });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to protect routes
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Logout route to invalidate the session
app.post('/logout', authenticate, async (req, res) => {
  await db('sessions').where({ session_token: req.headers.authorization.split(' ')[1] }).del();
  res.json({ success: true });
});




// server.js
app.get('/api/materials', authenticate, async (req, res) => {
  try {
    const materials = await db('materials as m')
      .join('categories as c', 'm.category_id', 'c.id')
      .join('types as t', 'm.type_id', 't.id')
      .select(
        'm.id',
        'm.name',
        'c.category_name',
        't.type_name'
      );
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pobierz wszystkie właściwości (zarówno przypisane, jak i nieprzypisane)
app.get('/api/materials/:id/properties', authenticate, async (req, res) => {
  const materialId = req.params.id;
  try {
    // Pobierz wszystkie właściwości z dictionary
    const allProperties = await db('properties_dictionary').select(
      'id as property_id',
      'property_name'
    );

    // Pobierz właściwości, które są przypisane do materiału
    const materialProperties = await db('material_properties as mp')
      .join('properties_dictionary as pd', 'mp.property_id', 'pd.id')
      .where('mp.material_id', materialId)
      .select('pd.property_name', 'mp.property_value', 'pd.id as property_id');

    // Połącz przypisane właściwości z brakującymi
    const propertiesWithValues = allProperties.map((property) => {
      const assignedProperty = materialProperties.find(
        (mp) => mp.property_id === property.property_id
      );
      return {
        ...property,
        property_value: assignedProperty ? assignedProperty.property_value : '', // Dodaj puste pole, jeśli brak wartości
      };
    });

    res.json(propertiesWithValues);
  } catch (error) {
    console.error('Error fetching material properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/materials/:id/properties', authenticate, async (req, res) => {
  const materialId = req.params.id;
  const properties = req.body; // Zawiera obiekt z parami { property_name: property_value }

  try {
    for (const [propertyName, propertyValue] of Object.entries(properties)) {
      // Znajdź ID właściwości na podstawie nazwy
      const property = await db('properties_dictionary')
        .select('id')
        .where({ property_name: propertyName })
        .first();

      if (!property) {
        return res.status(404).json({ error: `Property ${propertyName} not found` });
      }

      // Sprawdź, czy materiał ma już przypisaną tę właściwość
      const existingProperty = await db('material_properties')
        .where({ material_id: materialId, property_id: property.id })
        .first();

      if (existingProperty) {
        // Wykonaj UPDATE, jeśli właściwość istnieje
        await db('material_properties')
          .where({ material_id: materialId, property_id: property.id })
          .update({ property_value: propertyValue });
      } else {
        // Wykonaj INSERT, jeśli właściwość nie istnieje
        await db('material_properties').insert({
          material_id: materialId,
          property_id: property.id,
          property_value: propertyValue,
        });
      }
    }

// Delete material by ID
app.delete('/api/materials/:id', authenticate, async (req, res) => {
  const materialId = req.params.id;
  try {
    await db('materials').where({ id: materialId }).del();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add new material
app.post('/api/materials', authenticate, async (req, res) => {
  const { name, category, type } = req.body;
  try {
    await db('materials').insert({
      name,
      category_id: await getCategoryID(category),
      type_id: await getTypeID(type),
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions to get category and type IDs from names
async function getCategoryID(categoryName) {
  const category = await db('categories').where({ category_name: categoryName }).first();
  return category ? category.id : null;
}

async function getTypeID(typeName) {
  const type = await db('types').where({ type_name: typeName }).first();
  return type ? type.id : null;
}




    res.json({ success: true });
  } catch (error) {
    console.error('Error updating or inserting material properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});























// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
