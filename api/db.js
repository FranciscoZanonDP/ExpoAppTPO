const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://usuario:password@localhost:5432/tu_basededatos',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

module.exports = pool; 