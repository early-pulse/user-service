# User Service - Multi-Entity Authentication System

A comprehensive authentication and user management service that supports multiple entity types: Users, Doctors, and Labs (with optional blood inventory).

## Features

- **Multi-Entity Support**: Separate collections for Users, Doctors, and Labs (Labs can also act as Blood Banks)
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access**: Different endpoints and permissions for each entity type
- **CRUD Operations**: Complete Create, Read, Update, Delete operations for all entities
- **Password Management**: Secure password hashing and change functionality
- **Input Validation**: Comprehensive validation for all endpoints
- **Error Handling**: Standardized error responses
- **Logging**: Request logging for monitoring and debugging

## Entity Types and Fields

### User
- `name` (required)
- `email` (required, unique)
- `phoneNumber` (required)
- `address` (required)
- `emergencyContactNumber` (required)
- `password` (required)

### Doctor
- `name` (required)
- `email` (required, unique)
- `phoneNumber` (required)
- `address` (required)
- `specialization` (required)
- `password` (required)

### Lab (with BloodBank features)
- `name` (required)
- `email` (required, unique)
- `phoneNumber` (required)
- `address` (required)
- `testsOffered` (required, array of strings)
- `bloodInventory` (object with blood type quantities, optional)
- `password` (required)

## API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Health Check
```
GET /health
```

### User Endpoints

#### Public Routes
- `POST /users/register` - Register a new user
- `POST /users/login` - Login user
- `POST /users/refresh-token` - Refresh access token

#### Protected Routes
- `POST /users/logout` - Logout user
- `GET /users/current-user` - Get current user details
- `PATCH /users/update` - Update user details
- `POST /users/change-password` - Change password
- `DELETE /users/delete` - Delete user account
- `GET /users/verify-token` - Verify token (for other services)

### Doctor Endpoints

#### Public Routes
- `POST /doctors/register` - Register a new doctor
- `POST /doctors/login` - Login doctor
- `POST /doctors/refresh-token` - Refresh access token
- `GET /doctors/all` - Get all doctors
- `GET /doctors/specialization/:specialization` - Get doctors by specialization

#### Protected Routes
- `POST /doctors/logout` - Logout doctor
- `GET /doctors/current-doctor` - Get current doctor details
- `PATCH /doctors/update` - Update doctor details
- `POST /doctors/change-password` - Change password
- `DELETE /doctors/delete` - Delete doctor account
- `GET /doctors/verify-token` - Verify token (for other services)

### Lab Endpoints (including BloodBank features)

#### Public Routes
- `POST /labs/register` - Register a new lab
- `POST /labs/login` - Login lab
- `POST /labs/refresh-token` - Refresh access token
- `GET /labs/all` - Get all labs
- `GET /labs/test/:testName` - Get labs by test
- `GET /labs/blood-type/:bloodType` - Get labs by available blood type
- `GET /labs/search?location=city` - Search labs by location

#### Protected Routes
- `POST /labs/logout` - Logout lab
- `GET /labs/current-lab` - Get current lab details
- `PATCH /labs/update` - Update lab details
- `POST /labs/change-password` - Change password
- `DELETE /labs/delete` - Delete lab account
- `POST /labs/add-test` - Add a test to lab
- `DELETE /labs/remove-test` - Remove a test from lab
- `PATCH /labs/update-inventory` - Update blood inventory
- `GET /labs/verify-token` - Verify token (for other services)

## Request/Response Examples

### Register Lab (with blood inventory)
```json
POST /api/v1/labs/register
{
  "name": "City Lab",
  "email": "lab@example.com",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City, State",
  "testsOffered": ["CBC", "Blood Sugar"],
  "bloodInventory": {
    "A_Positive": 10,
    "O_Negative": 5
  },
  "password": "securePassword123"
}
```

### Update Blood Inventory
```json
PATCH /api/v1/labs/update-inventory
Authorization: Bearer <access_token>
{
  "bloodType": "A_Positive",
  "quantity": 15
}
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/user-service
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
```

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Start the server:
   ```bash
   npm start
   ```

## Project Structure

```
user-service/
├── models/
│   ├── user.model.js          # User model
│   ├── doctor.model.js        # Doctor model
│   └── lab.model.js           # Lab model (with blood inventory)
├── services/
│   ├── user.service.js        # User business logic
│   ├── doctor.service.js      # Doctor business logic
│   └── lab.service.js         # Lab business logic (with blood inventory)
├── controllers/
│   ├── user.controller.js     # User HTTP handlers
│   ├── doctor.controller.js   # Doctor HTTP handlers
│   └── lab.controller.js      # Lab HTTP handlers (with blood inventory)
├── routes/
│   ├── user.routes.js         # User routes
│   ├── doctor.routes.js       # Doctor routes
│   └── lab.routes.js          # Lab routes (with blood inventory)
├── middlewares/
│   └── auth.middleware.js     # JWT authentication middleware
├── utils/
│   ├── ApiError.js            # Error handling utility
│   ├── ApiResponse.js         # Response formatting utility
│   ├── asyncHandler.js        # Async error handler
│   └── logger.js              # Logging utility
├── app.js                     # Express app configuration
├── index.js                   # Server entry point
└── package.json
```

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Refresh token rotation
- Input validation and sanitization
- CORS configuration
- Secure cookie settings

## Error Handling

The service uses standardized error responses:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false
}
```

## Logging

All API requests are logged with:
- HTTP method
- Endpoint path
- Status code
- Timestamp

## Dependencies

- Express.js - Web framework
- Mongoose - MongoDB ODM
- JWT - JSON Web Tokens
- bcryptjs - Password hashing
- cors - Cross-origin resource sharing
- cookie-parser - Cookie parsing

## License

MIT License