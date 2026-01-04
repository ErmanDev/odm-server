# Officer Duty Management Server

Backend server for the Officer Duty Management System using SQLite (file-based database).

## Features

- **SQLite database** - File-based, no server needed! Works completely offline
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
- **No database server required!** SQLite is file-based and works offline

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example` if available):
```bash
# Create .env file with these settings:
PORT=3000
NODE_ENV=development
DB_PATH=./data/officer_duty.db
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
API_BASE_URL=http://127.0.0.1:3000/api
```

3. Run the development server:
```bash
npm run dev
```

The server will automatically create the database file and tables on first run in the `data/` directory.

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
- `DB_PATH` - SQLite database file path (default: `./data/officer_duty.db`)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `API_BASE_URL` - Base URL for API endpoints
- `NODE_ENV` - Environment (development/production)

## Offline Operation

✅ **This server runs completely offline!**
- No database server needed (SQLite is file-based)
- No internet connection required
- All data is stored in `data/officer_duty.db`
- Just run `npm run dev` and it works!

## Database Tables

The following tables will be automatically created when you run `npm run dev`:

- `users` - User accounts with authentication
- `duty_assignments` - Duty assignment records
- `duty_schedules` - Duty schedule records
- `ongoing_activities` - Ongoing activity records
- `pending_activities` - Pending activity records
- `notifications` - Notification records
- `attendance` - Attendance tracking records
- `absence_requests` - Absence request records
- `clock_settings` - Clock settings records

**Note:** The database file is stored at `data/officer_duty.db`. You can backup or move this file to transfer data.

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

