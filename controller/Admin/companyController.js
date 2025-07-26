const pool = require('../../db');

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.search ? req.query.search.toLowerCase() : '';

    let baseQuery = `
      SELECT
        id, name, established_date, registration_number, website,
        address1, address2, city, state, zip_code,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        created_at, updated_at
      FROM companies
      WHERE isActive = 1 
    `;

    let countQuery = `SELECT COUNT(*) as total_count FROM companies WHERE isActive = 1`;

    let dataValues = [limit, offset];
    let searchValue = null;
    let whereClause = '';

    if (search) {
      whereClause = `
        AND (
          LOWER(name) LIKE $3 OR
          LOWER(registration_number) LIKE $3 OR
          LOWER(contact_email) LIKE $3 OR
          LOWER(contact_phone) LIKE $3 OR
          LOWER(city) LIKE $3
        )
      `;
      searchValue = `%${search}%`;
      dataValues.push(searchValue);
    }

    const finalQuery = `${baseQuery} ${whereClause} ORDER BY updated_at DESC LIMIT $1 OFFSET $2`;
    const companiesQuery = await pool.query(finalQuery, dataValues);

    // Reconstruct count query with its own $1 (don't use $3 here)
    let countQueryValues = [];
    let finalCountQuery = countQuery;

    if (search) {
      finalCountQuery += `
        AND (
          LOWER(name) LIKE $1 OR
          LOWER(registration_number) LIKE $1 OR
          LOWER(contact_email) LIKE $1 OR
          LOWER(contact_phone) LIKE $1 OR
          LOWER(city) LIKE $1
        )
      `;
      countQueryValues.push(searchValue);
    }

    const countQueryResult = await pool.query(finalCountQuery, countQueryValues);

    res.status(200).json({
      success: true,
      data: companiesQuery.rows,
      pagination: {
        total: parseInt(countQueryResult.rows[0].total_count),
        page,
        limit,
        totalPages: Math.ceil(countQueryResult.rows[0].total_count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
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


// const updateCompany = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch existing company
//     const existing = await pool.query(
//       `SELECT * FROM companies WHERE id = $1 AND isActive = 1`,
//       [id]
//     );

//     if (existing.rows.length === 0) {
//       return res.status(404).json({ error: 'Company not found' });
//     }

//     const current = existing.rows[0];

//     // Extract request body and fallback to current values if not provided
//     const {
//       name = current.name,
//       established_date = current.established_date,
//       registration_number = current.registration_number,
//       website = current.website,
//       address1 = current.address1,
//       address2 = current.address2,
//       city = current.city,
//       state = current.state,
//       zip_code = current.zip_code
//     } = req.body;

//     // Update query
//     const result = await pool.query(
//       `UPDATE companies SET
//         name = $1,
//         established_date = $2,
//         registration_number = $3,
//         website = $4,
//         address1 = $5,
//         address2 = $6,
//         city = $7,
//         state = $8,
//         zip_code = $9,
//         updated_at = NOW()
//       WHERE id = $10 AND isActive = 1
//       RETURNING *`,
//       [
//         name,
//         established_date,
//         registration_number,
//         website,
//         address1,
//         address2,
//         city,
//         state,
//         zip_code,
//         id
//       ]
//     );

//     res.json(result.rows[0]);

//   } catch (err) {
//     console.error('Update company error:', err);
//     res.status(500).json({
//       error: 'Company update failed',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };



// Delete company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing company
    const existing = await pool.query(
      `SELECT * FROM companies WHERE id = $1 AND isActive = 1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const current = existing.rows[0];

    // Extract request body and fallback to current values if not provided
    const {
      name = current.name,
      established_date = current.established_date,
      registration_number = current.registration_number,
      website = current.website,
      address1 = current.address1,
      address2 = current.address2,
      city = current.city,
      state = current.state,
      zip_code = current.zip_code,
      contact_first_name = current.contact_first_name,
      contact_last_name = current.contact_last_name,
      contact_email = current.contact_email,
      contact_phone = current.contact_phone
    } = req.body;

    // Update query
    const result = await pool.query(
      `UPDATE companies SET
        name = $1,
        established_date = $2,
        registration_number = $3,
        website = $4,
        address1 = $5,
        address2 = $6,
        city = $7,
        state = $8,
        zip_code = $9,
        contact_first_name = $10,
        contact_last_name = $11,
        contact_email = $12,
        contact_phone = $13,
        updated_at = NOW()
      WHERE id = $14 AND isActive = 1
      RETURNING *`,
      [
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
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Update company error:', err);
    res.status(500).json({
      error: 'Company update failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};




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
