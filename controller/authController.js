const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { email, password, role_id } = req.body;
    
    // 1. Check if email already exists
    const existingUser = await pool.query(
      'SELECT * FROM fleet_users WHERE email = $1', 
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // 2. Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO fleet_users 
       (email, password_hash, role_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, role_id, created_at`,  // Don't return password hash
      [email, hashedPassword, role_id]
    );
    
    // 3. Generate token
    const token = jwt.sign(
      { id: result.rows[0].id, role_id: result.rows[0].role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      user: result.rows[0],
      token
    });
    
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Find user
    const user = await pool.query(
      `SELECT id,name, email, password_hash, role_id 
       FROM fleet_users 
       WHERE email = $1`,
      [email]
    );
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 2. Verify password
    const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 3. Generate token
    const token = jwt.sign(
      { 
        id: user.rows[0].id, 
        role_id: user.rows[0].role_id ,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // 4. Return response (without password hash)
    res.json({
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        role_id: user.rows[0].role_id,
         name: user.rows[0].name
      },
      token
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = { register, login };