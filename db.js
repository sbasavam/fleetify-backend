const { Pool } = require('pg');
require('dotenv').config();

const sslEnabled = process.env.SSL_ENABLED === 'true';

const pool = new Pool({
  connectionString: process.env.RENDER_DB_EXTERNAL_URL,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 10) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 10) || 5000
});

module.exports = pool;
