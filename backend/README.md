# EduLink Backend API

Backend API for the EduLink platform built with Node.js, Express, and MongoDB.

## Features

- ✅ JWT-based authentication
- ✅ Two-step registration (Basic info + Role-specific profile)
- ✅ Role-based access control (Admin, School, Donor, Volunteer)
- ✅ File upload support for verification documents
- ✅ User approval system (Pending, Verified, Rejected)
- ✅ Secure password hashing with bcrypt
- ✅ MongoDB database with Mongoose ODM
- ✅ Input validation
- ✅ CORS enabled
- ✅ Security headers with Helmet

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/edulink
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

4. Make sure MongoDB is running:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

## Running the Server

### Development mode (with auto-reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Public Routes

#### Health Check

- **GET** `/api/health` - Check API status

#### Authentication

- **POST** `/api/auth/register/basic` - Register basic account info (Step 1)

  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "donor"
  }
  ```

- **POST** `/api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Profile Completion (Step 2)

- **POST** `/api/auth/register/school-profile` - Complete school profile

  - Form-data with school fields + files (registrationProof, endorsementLetter)

- **POST** `/api/auth/register/donor-profile` - Complete donor profile

  - Form-data with donor fields + file (identityCertificate)

- **POST** `/api/auth/register/volunteer-profile` - Complete volunteer profile
  - Form-data with volunteer fields + files (nicFront, nicBack)

### Protected Routes (Requires JWT Token)

Add token to request headers:

```
Authorization: Bearer <your_jwt_token>
```

- **GET** `/api/auth/me` - Get current user profile
- **PUT** `/api/auth/update-profile` - Update user profile
- **PUT** `/api/auth/change-password` - Change password
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }
  ```
- **POST** `/api/auth/logout` - Logout user

### Admin Routes (Requires admin role)

- **GET** `/api/auth/pending-users` - Get all pending users awaiting approval
- **PUT** `/api/auth/approve-user/:userId` - Approve a user
- **PUT** `/api/auth/reject-user/:userId` - Reject a user
  ```json
  {
    "reason": "Documents are not clear"
  }
  ```

## Project Structure

```
backend/
├── controllers/
│   └── auth.controller.js      # Authentication logic
├── middleware/
│   ├── auth.middleware.js      # JWT verification & authorization
│   └── upload.middleware.js    # File upload handling
├── models/
│   └── User.model.js          # User schema
├── routes/
│   └── auth.routes.js         # Auth endpoints
├── uploads/                   # Uploaded files directory
├── .env                       # Environment variables
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
├── server.js                 # Express app entry point
└── README.md                 # This file
```

## User Roles

1. **Admin** - Full access, can approve/reject users
2. **School** - Can create requests for educational resources
3. **Donor** - Can create donation offers
4. **Volunteer** - Can accept delivery assignments

## User Status Flow

1. **Pending** - User registered but awaiting admin verification
2. **Verified** - User approved by admin, full access granted
3. **Rejected** - User rejected by admin with reason

## Testing with Postman/Thunder Client

1. **Register a user** (POST `/api/auth/register/basic`)
2. **Complete profile** (POST `/api/auth/register/{role}-profile`)
3. **Login** (POST `/api/auth/login`) - Save the token
4. **Access protected routes** - Add token to Authorization header

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation with express-validator
- Security headers with Helmet
- CORS configuration
- File type and size validation

## Error Handling

All API responses follow this format:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
