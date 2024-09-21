// server.js or app.js
const express = require('express');
const knex = require('knex');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Configure CORS
app.use(cors());
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
      //console.log(property.query);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Get distinct values for that property
    const propertyValues = await db('material_properties')
      .distinct('property_value')
      .where({ property_id: property.id });

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


app.post('/api/update-property-priority', async (req, res) => {
  const { property_id, priority } = req.body;
  try {
    await db('properties_dictionary').where('id', property_id).update({ priority });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Dynamic filtering based on user input
app.get('/api/filter', async (req, res) => {
  const { filters } = req.query;

  try {
    // Parse the filters and make sure it's an array
    let parsedFilters = [];
    if (filters) {
      parsedFilters = JSON.parse(filters);
    }

    // Check if parsedFilters is an array
    if (!Array.isArray(parsedFilters)) {
      return res.status(400).json({ error: 'Invalid filters format. Expected an array.' });
    }

    // Build dynamic query
    let query = `
      SELECT m.name, c.category_name, t.type_name, p.property_name, mp.property_value
      FROM materials m
      JOIN categories c ON m.category_id = c.id
      JOIN types t ON m.type_id = t.id
      JOIN material_properties mp ON mp.material_id = m.id
      JOIN properties_dictionary p ON mp.property_id = p.id
      WHERE 1 = 1
    `;

    const queryParams = [];

    // Dynamically add filters to query
    parsedFilters.forEach((filter) => {
      query += `
        AND m.id IN (
          SELECT material_id FROM material_properties
          WHERE property_id = (
            SELECT id FROM properties_dictionary WHERE property_name = ?
          )
          AND property_value = ?
        )
      `;
      queryParams.push(filter.property, filter.value);
    });
console.log(queryParams);
    // Execute the dynamic query
    const results = await db.raw(query, queryParams);
console.log(results);
    res.json({ filteredMaterials: results });
  } catch (error) {
    console.error('Error during filtering:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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