// data/db.js
const knex = require('knex');

// Ensure to configure this according to your database settings
const db = knex({
  client: 'sqlite3', // or 'pg' for PostgreSQL, 'mysql' for MySQL, etc.
  connection: {
    filename: '../data/mydatabse.db', // Adjust this path based on your setup
  },
  useNullAsDefault: true,
});

module.exports = db;
