const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('../db');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'No authentication token provided' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await pool.query(
      'SELECT id, email, role_id FROM fleet_users WHERE id = $1',
      [decoded.id]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    req.user = {
      ...user.rows[0],
      company_id: decoded.company_id || null
    };

    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;
