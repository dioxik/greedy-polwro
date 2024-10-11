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

// Funkcja do tworzenia tabeli material_property_ranges_table i triggerów
async function createMaterialPropertyRangesTable() {
  try {
    await db.raw(`
      -- Utwórz tabelę, jeśli nie istnieje
      --CREATE TABLE IF NOT EXISTS material_property_ranges_table AS
      --SELECT * FROM material_property_ranges;

      -- Utwórz trigger, który będzie aktualizował tabelę po INSERT do material_properties
      CREATE TRIGGER IF NOT EXISTS update_ranges_after_insert
      AFTER INSERT ON material_properties
      BEGIN
        -- Usuń stare zakresy dla danego materiału i właściwości
        DELETE FROM material_property_ranges_table
        WHERE material_id = NEW.material_id AND property_id = NEW.property_id;

        -- Dodaj nowe zakresy dla danego materiału i właściwości
        INSERT INTO material_property_ranges_table
        SELECT * FROM material_property_ranges
        WHERE material_id = NEW.material_id AND property_id = NEW.property_id;
      END;

      -- Utwórz trigger, który będzie aktualizował tabelę po UPDATE do material_properties
      CREATE TRIGGER IF NOT EXISTS update_ranges_after_update
      AFTER UPDATE ON material_properties
      BEGIN
        -- Usuń stare zakresy dla danego materiału i właściwości
        DELETE FROM material_property_ranges_table
        WHERE material_id = NEW.material_id AND property_id = NEW.property_id;

        -- Dodaj nowe zakresy dla danego materiału i właściwości
        INSERT INTO material_property_ranges_table
        SELECT * FROM material_property_ranges
        WHERE material_id = NEW.material_id AND property_id = NEW.property_id;
      END;

      -- Utwórz trigger, który będzie aktualizował tabelę po DELETE do material_properties
      CREATE TRIGGER IF NOT EXISTS update_ranges_after_delete
      AFTER DELETE ON material_properties
      BEGIN
        -- Usuń stare zakresy dla danego materiału i właściwości
        DELETE FROM material_property_ranges_table
        WHERE material_id = OLD.material_id AND property_id = OLD.property_id;

        -- Dodaj nowe zakresy dla danego materiału i właściwości (jeśli istnieją)
        INSERT INTO material_property_ranges_table
        SELECT * FROM material_property_ranges
        WHERE material_id = OLD.material_id AND property_id = OLD.property_id;
      END;
    `);
    console.log('Tabela material_property_ranges_table i triggery utworzone.');
  } catch (error) {
    console.error('Błąd podczas tworzenia tabeli i triggerów:', error);
  }
}

// Wywołaj funkcję po uruchomieniu aplikacji
// createMaterialPropertyRangesTable();

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

    // Use the material_property_ranges_table to get distinct values
    const propertyValues = await db('material_property_ranges_table')
      .select('property_value')
      .where({ property_id: property.id })
      .distinct()
      .orderBy('property_value');

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

    const { filteredMaterials, suggestions } = await applyFiltersAndSuggestions(parsedFilters);

    res.json({ filteredMaterials, suggestions });
  } catch (error) {
    console.error('Error during filtering:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function applyFiltersAndSuggestions(filters) {
  let query = `
    SELECT DISTINCT m.id, m.name, c.category_name, t.type_name
    FROM materials m
    JOIN categories c ON m.category_id = c.id
    JOIN types t ON m.type_id = t.id
    JOIN material_property_ranges_table mp ON mp.material_id = m.id
    JOIN properties_dictionary p ON mp.property_id = p.id
    WHERE 1 = 1
  `;

  const queryParams = [];
  filters.forEach((filter, index) => {
    let operator = '=';
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
        operator = '=';
    }

    query += `
      AND m.id IN (
        SELECT material_id FROM material_property_ranges_table
        WHERE property_id = (
          SELECT id FROM properties_dictionary WHERE property_name = ?
        )
        AND CAST(REPLACE(property_value, ',', '.') AS REAL) ${operator} ?
      )
    `;
    queryParams.push(filter.property, filter.value);
  });

  // Execute the dynamic query
 // const compiledQuery = db.raw(query, queryParams).toSQL(); // Zbuduj zapytanie z parametrami
 // console.log(compiledQuery.toString()); // Wyświetl pełne zapytanie w konsoli
  const filteredMaterials = await db.raw(query, queryParams);

  // If no exact matches, provide suggestions
  let suggestions = [];
  if (filteredMaterials.length === 0 && filters.length > 0) {
    const lastFilter = filters[filters.length - 1];
    const relaxedFilters = filters.slice(0, -1);

    // Relax the last filter if it's numeric
    if (!isNaN(lastFilter.value)) {
      const numericValue = parseFloat(lastFilter.value);
      const relaxedValue =
        lastFilter.operator === 'lessThanOrEqual'
          ? numericValue + 5
          : lastFilter.operator === 'greaterThanOrEqual'
          ? numericValue - 5
          : numericValue; // For 'equal', just use the same value

      const { suggestions: relaxedSuggestions } = await applyFiltersAndSuggestions([
        ...relaxedFilters,
        { ...lastFilter, value: relaxedValue },
      ]);
      suggestions = relaxedSuggestions;
    }
  }

  return { filteredMaterials, suggestions };
}

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
    for (const { id: propertyId, value: propertyValue } of properties) {
      // Sprawdź, czy materiał ma już przypisaną tę właściwość
      const existingProperty = await db('material_properties')
        .where({ material_id: materialId, property_id: propertyId })
        .first();

      if (existingProperty) {
        // Wykonaj UPDATE, jeśli właściwość istnieje
        await db('material_properties')
          .where({ material_id: materialId, property_id: propertyId })
          .update({ property_value: propertyValue });
      } else {
        // Wykonaj INSERT, jeśli właściwość nie istnieje
        await db('material_properties').insert({
          material_id: materialId,
          property_id: propertyId,
          property_value: propertyValue,
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating or inserting material properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    const [newMaterialId] = await db('materials').insert({
      name,
      category_id: await getCategoryID(category),
      type_id: await getTypeID(type),
    });

    // Wywołaj trigger
    try {
      await db.raw(`
        INSERT INTO material_properties (material_id, property_id, property_value)
        VALUES (?, ?, ?);
      `, [newMaterialId, propertyId, propertyValue]);
    } catch (error) {
      console.error('Błąd podczas wywoływania triggera:', error);
    }

    res.json({ success: true, id: newMaterialId });
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

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
