const pool = require('../../db'); // Make sure this points to your DB connection

const getStats = async (req, res) => {
  try {
    const companyCountResult = await pool.query('SELECT COUNT(*) FROM companies WHERE isactive = 1');
    const driverCountResult = await pool.query('SELECT COUNT(*) FROM drivers WHERE isactive = 1');

    const totalCompanies = parseInt(companyCountResult.rows[0].count);
    const totalDrivers = parseInt(driverCountResult.rows[0].count);

    res.status(200).json({
      totalCompanies,
      totalDrivers
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { getStats };
