const pool = require('../db');

// Add company
const AddCompany = async (req, res) => {
  try {
    const {
      name,
      established_date,
      registration_number,
      website,
      address1,
      address2,
      city,
      state,
      zip_code,
      contact_first_name,
      contact_last_name,
      contact_email,
      contact_phone
    } = req.body;

    const result = await pool.query(
      `INSERT INTO companies (
        user_id, name, established_date, registration_number,
        website, address1, address2, city, state, zip_code,
        contact_first_name, contact_last_name, contact_email, contact_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        req.user.id,
        name,
        established_date,
        registration_number,
        website,
        address1,
        address2,
        city,
        state,
        zip_code,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({
      error: 'Company creation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get all companies
const getCompanies = async (req, res) => {
  try {
    // Get pagination parameters from query string (default to first page with 10 items)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query to get paginated companies data
    const companiesQuery = await pool.query(`
      SELECT
        id,
        name,
        established_date,
        registration_number,
        website,
        address1,
        address2,
        city,
        state,
        zip_code,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        created_at,
        updated_at
      FROM companies
      WHERE isActive = 1
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Query to get total count of active companies
    const countQuery = await pool.query(`
      SELECT COUNT(*) as total_count
      FROM companies
      WHERE isActive = 1
    `);

    res.status(200).json({
      success: true,
      data: companiesQuery.rows,
      pagination: {
        total: parseInt(countQuery.rows[0].total_count),
        page,
        limit,
        totalPages: Math.ceil(countQuery.rows[0].total_count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  const companyId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        established_date,
        registration_number,
        website,
        address1,
        address2,
        city,
        state,
        zip_code,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        created_at,
        updated_at
      FROM companies
      WHERE id = $1 AND isActive = 1
    `, [companyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found or is inactive'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching company by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};



const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [
      "name",
      "established_date",
      "registration_number",
      "website",
      "address1",
      "address2",
      "city",
      "state",
      "zip_code",
      "contact_first_name",
      "contact_last_name",
      "contact_email",
      "contact_phone"
    ];

    const updates = [];
    const values = [];
    let index = 1;

    // Dynamically add only provided fields
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${index}`);
        values.push(req.body[field]);
        index++;
      }
    }

    // Always update timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE condition
    values.push(id);         // $index
    values.push(req.user.id); // $index + 1

    const query = `
      UPDATE companies SET
        ${updates.join(', ')}
      WHERE id = $${index} AND user_id = $${index + 1}
      RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update company error:', err);
    res.status(500).json({
      error: 'Company update failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


// Delete company

const deleteCompany = async (req, res) => {
  const companyId = req.params.id;

  try {
    const result = await pool.query(
      'UPDATE companies SET isActive = 0, updated_at = NOW() WHERE id = $1 RETURNING *',
      [companyId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Company  deleted', company: result.rows[0] });
  } catch (error) {
    console.error('Error soft deleting company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
  AddCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
};
