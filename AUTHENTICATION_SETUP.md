# Authentication Setup Instructions

## Important: Configure Your Database

Before using the authentication system, you need to set up your Neon database connection:

### 1. Create a Neon Database Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new database project

### 2. Get Your Connection String
1. In your Neon dashboard, go to the connection details
2. Copy the PostgreSQL connection string
3. It should look like: `postgresql://username:password@hostname/database?sslmode=require`

### 3. Update the .env File
Open the `.env` file in the project root and replace the placeholder values:

```env
# Replace this with your actual Neon DB connection string
DATABASE_URL="postgresql://your_username:your_password@your_hostname/your_database?sslmode=require"

# Replace this with a secure random string (at least 32 characters)
JWT_SECRET="your_super_secure_jwt_secret_key_here_make_it_long_and_random"

# This can stay the same
PING_MESSAGE="pong"
```

### 4. Generate a Secure JWT Secret
You can generate a secure JWT secret using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Features Implemented

✅ **User Registration/Signup**
- Email validation
- Password hashing with bcrypt
- User role assignment
- JWT token generation

✅ **User Login**
- Email/password authentication
- Session management with JWT
- Auto-redirect to dashboard

✅ **Protected Routes**
- Dashboard requires authentication
- Automatic redirect to login for unauthenticated users
- Loading states during auth verification

✅ **Theme Support**
- Consistent OKLCH color scheme
- Light/dark theme toggle on login/signup pages
- Theme persistence

✅ **User Interface**
- Modern, responsive design
- User avatar with initials in header and sidebar
- User dropdown with logout option
- Mobile-friendly interface

✅ **Database Integration**
- PostgreSQL/Neon database support
- Automatic table creation
- Secure password storage

## How to Use

1. **Start the Development Server**: The server is already running at http://localhost:8083
2. **Visit the Application**: Click the preview button to open the application
3. **Create an Account**: You'll be redirected to the login page, click "Sign up" to create an account
4. **Login**: After signup, you'll be automatically logged in and redirected to the dashboard
5. **View User Info**: Your name and email will appear in the header and sidebar
6. **Logout**: Use the logout button in the header dropdown or sidebar

## Project Structure

```
├── server/
│   ├── routes/auth.ts          # Authentication API endpoints
│   ├── middleware/auth.ts      # JWT middleware
│   └── db.ts                   # Database operations
├── client/
│   ├── pages/
│   │   ├── Login.tsx           # Login page
│   │   ├── Signup.tsx          # Signup page
│   │   └── Index.tsx           # Dashboard (protected)
│   ├── hooks/
│   │   └── useAuth.tsx         # Authentication context
│   └── components/
│       ├── ProtectedRoute.tsx  # Route protection
│       └── dashboard/
│           ├── Header.tsx      # Updated with user info
│           └── Sidebar.tsx     # Updated with user info
└── shared/
    └── api.ts                  # Shared types for auth
```

## API Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/verify` - Verify JWT token (protected)

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 12
- JWT tokens expire after 7 days
- Protected routes require valid authentication
- CORS enabled for API access
- Environment variables for sensitive data