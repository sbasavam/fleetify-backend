require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const pool = require('./db');


const app = express();
const allowedOrigin = process.env.CORS_ORIGIN;

// Middleware
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

console.log(`🌐 Allowed CORS Origin: ${allowedOrigin}`);



app.use(express.json({ limit: '10kb' }));

// Database connection check
const checkDatabase = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    console.log(`✅ Database connected | Time: ${res.rows[0].now}`);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Start server
const start = async () => {
  await checkDatabase();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`
🚀 Server running on port ${port}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📡 API: http://localhost:${port}/api
    `);
  });
};

start();

// Error handling
pool.on('error', (err) => console.error('💥 DB error:', err));
process.on('unhandledRejection', (err) => console.error('💥 Unhandled rejection:', err));