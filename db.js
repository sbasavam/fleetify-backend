const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.RENDER_DB_EXTERNAL_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: Number(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECTION_TIMEOUT_MS) || 5000
});

module.exports = pool;
