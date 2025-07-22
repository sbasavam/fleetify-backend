const express = require("express");
const router = express.Router();
const { register, login } = require("./controller/authController");
const {
  AddCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require("./controller/companyController");
const {
  AddDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
} = require("./controller/driverController");
const authMiddleware = require("./middlewares/authMiddleware");

// Public Routes (No authentication required)
router.post("/auth/register", register);
router.post("/auth/login", login);

// Protected Routes (Require valid JWT token)
router.use(authMiddleware); // Applies to all routes below

router.post("/companies", AddCompany);
router.get("/companies", getCompanies);
router.get('/companies/:id', getCompanyById);  
router.put("/companies/:id", updateCompany);
router.delete("/companies/:id", deleteCompany);

router.post("/drivers", AddDriver);
router.get("/drivers", getDrivers);
router.get('/drivers/:id', getDriverById);
router.put("/drivers/:id", updateDriver);
router.delete("/drivers/:id", deleteDriver);


module.exports = router;
