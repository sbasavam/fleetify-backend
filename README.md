
# Fleetify – Backend

Fleetify backend is a RESTful API built using Node.js, Express, and PostgreSQL to manage drivers, companies, and user authentication with role-based access control.

##  Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT for authentication
- CORS
- Render (deployment)

##  Features

- **Authentication**:
  - Login with JWT token
  - Role-based access control (Admin, Driver, Company)
- **CRUD APIs**:
  - Add, edit, delete, and fetch drivers and companies
- **Modular Architecture**
- **CORS Enabled**
- **Secure API with Token Validation**

##  API Base URL

Backend API:  
[https://fleetify-backend.onrender.com](https://fleetify-backend.onrender.com)

##  Postman Collection

Use the link below to test all API endpoints:  
[https://www.postman.com/sanganabasavam/workspace/i11/collection/46706206-1420b204-74fb-4a1c-8634-ad480a93cbb2?action=share&source=copy-link&creator=46706206](https://www.postman.com/sanganabasavam/workspace/i11/collection/46706206-1420b204-74fb-4a1c-8634-ad480a93cbb2?action=share&source=copy-link&creator=46706206)

##  Folder Structure

```
backend/
├── controllers/
│   ├── authController.js
│   ├── companyController.js
│   └── driverController.js
├── routes.js
├── index.js
├── .env
└── db.js
```


**Description:**
- `controllers/`: Contains logic for authentication, company, and driver operations
- `migrations/`: SQL migration scripts for database setup
- `routes.js`: Main route definitions
- `index.js`: Entry point for the backend server
- `.env`: Environment variables
- `db.js`: Database connection setup

## Running Locally

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. To run the backend on your local machine:
   - Open the `.env` file and **comment out** the internal (production) API URL if present.
   - Make sure your local environment variables are set correctly (e.g., database connection, JWT secret).
   - Start the server:
   ```bash
   npm start
   ```
3. The backend will be available at `http://localhost:PORT` (default port is usually 3000).


