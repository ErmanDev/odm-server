# Officer Duty Management Server

Backend server for the Officer Duty Management System using MySQL and Laragon.

## Features

- MySQL database with Sequelize ORM
- User authentication (JWT)
- Officer management
- Duty assignments
- Duty schedules
- Ongoing activities
- Pending activities
- Notifications
- Attendance tracking

## Prerequisites

- Node.js (v16 or higher)
- Laragon with MySQL running
- MySQL database created (or it will be created automatically)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your Laragon MySQL connection details:
   - `DB_HOST`: Your Laragon MySQL IP (usually `127.0.0.1`)
   - `DB_PORT`: MySQL port (usually `3306`)
   - `DB_NAME`: Database name (will be created if it doesn't exist)
   - `DB_USER`: MySQL username (usually `root`)
   - `DB_PASSWORD`: MySQL password (empty by default in Laragon)

4. Make sure Laragon MySQL is running.

5. Run the development server:
```bash
npm run dev
```

The server will automatically create the database tables on first run.

## API Configuration

All API endpoints are configured in `src/config/api.ts`. You can access the API configuration and endpoints programmatically.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Officers
- `GET /api/officers` - Get all officers (protected)
- `GET /api/officers/:id` - Get officer by ID (protected)
- `POST /api/officers` - Create officer (admin only)
- `PUT /api/officers/:id` - Update officer (admin only)
- `DELETE /api/officers/:id` - Delete officer (admin only)

### Duty Assignments
- `GET /api/duty-assignments` - Get all duty assignments (protected)
- `GET /api/duty-assignments/:id` - Get duty assignment by ID (protected)
- `POST /api/duty-assignments` - Create duty assignment (admin only)
- `PUT /api/duty-assignments/:id` - Update duty assignment (admin only)
- `DELETE /api/duty-assignments/:id` - Delete duty assignment (admin only)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DB_HOST` - MySQL host IP (default: 127.0.0.1)
- `DB_PORT` - MySQL port (default: 3306)
- `DB_NAME` - Database name
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `API_BASE_URL` - Base URL for API endpoints
- `NODE_ENV` - Environment (development/production)

## Database Tables

The following tables will be automatically created when you run `npm run dev`:

- `users` - User accounts with authentication
- `officers` - Officer information
- `duty_assignments` - Duty assignment records
- `duty_schedules` - Duty schedule records
- `ongoing_activities` - Ongoing activity records
- `pending_activities` - Pending activity records
- `notifications` - Notification records
- `attendance` - Attendance tracking records

## Project Structure

```
src/
├── config/
│   ├── database.ts    # Database configuration
│   └── api.ts         # API endpoint configuration
├── models/            # Sequelize models
├── controllers/       # Route controllers
├── routes/            # Express routes
├── middleware/        # Custom middleware (auth, etc.)
└── app.ts            # Main application file
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

