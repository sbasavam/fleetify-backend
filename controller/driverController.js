const pool = require('../db');

// Add Driver
const AddDriver = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      license_number,
      experience_years,
      address1,
      address2,
      city,
      state,
      zip_code
    } = req.body;

    const result = await pool.query(
      `INSERT INTO drivers (
        user_id, company_id, first_name, last_name, email, phone,
        date_of_birth, license_number, experience_years,
        address1, address2, city, state, zip_code,
        created_at, isActive
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, NOW(), 1
      ) RETURNING *`,
      [
        req.user.id,
        req.user.company_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        license_number,
        experience_years,
        address1,
        address2,
        city,
        state,
        zip_code
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create driver error:', err);
    res.status(500).json({
      error: 'Driver creation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get All Active Drivers
const getDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, first_name, last_name, email, phone, date_of_birth,
        license_number, experience_years, address1, address2,
        city, state, zip_code, created_at, updated_at
       FROM drivers 
       WHERE isActive = 1
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get drivers error:', err);
    res.status(500).json({
      error: 'Failed to fetch drivers',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get Driver by ID
const getDriverById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        id, first_name, last_name, email, phone, date_of_birth,
        license_number, experience_years, address1, address2,
        city, state, zip_code, created_at, updated_at
       FROM drivers 
       WHERE isActive = 1 AND id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Get driver by ID error:', err);
    res.status(500).json({
      error: 'Failed to fetch driver',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



// Update Driver (Partial Update)
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing driver
    const existing = await pool.query(
      `SELECT * FROM drivers WHERE id = $1 AND isActive = 1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const current = existing.rows[0];
    const {
      first_name = current.first_name,
      last_name = current.last_name,
      email = current.email,
      phone = current.phone,
      date_of_birth = current.date_of_birth,
      license_number = current.license_number,
      experience_years = current.experience_years,
      address1 = current.address1,
      address2 = current.address2,
      city = current.city,
      state = current.state,
      zip_code = current.zip_code
    } = req.body;

    const result = await pool.query(
      `UPDATE drivers SET
        first_name = $1,
        last_name = $2,
        email = $3,
        phone = $4,
        date_of_birth = $5,
        license_number = $6,
        experience_years = $7,
        address1 = $8,
        address2 = $9,
        city = $10,
        state = $11,
        zip_code = $12,
        updated_at = NOW()
      WHERE id = $13 AND isActive = 1
      RETURNING *`,
      [
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        license_number,
        experience_years,
        address1,
        address2,
        city,
        state,
        zip_code,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update driver error:', err);
    res.status(500).json({
      error: 'Driver update failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Soft Delete Driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE drivers 
       SET isActive = 0, updated_at = NOW()
       WHERE id = $1 AND isActive = 1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found or already deleted' });
    }

    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    console.error('Delete driver error:', err);
    res.status(500).json({
      error: 'Driver deletion failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  AddDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
};
