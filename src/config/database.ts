import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Import all models to ensure they're registered
import User from '../models/User';
import DutyAssignment from '../models/DutyAssignment';
import DutySchedule from '../models/DutySchedule';
import OngoingActivity from '../models/OngoingActivity';
import PendingActivity from '../models/PendingActivity';
import Notification from '../models/Notification';
import Attendance from '../models/Attendance';
import AbsenceRequest from '../models/AbsenceRequest';
import ClockSettings from '../models/ClockSettings';

dotenv.config();

// Get database URL from environment variable (required for PostgreSQL)
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('✗ DATABASE_URL environment variable is required');
  console.error('Please set DATABASE_URL to your PostgreSQL connection string');
  process.exit(1);
}

// Configure Sequelize for PostgreSQL
// For local development, use External Database URL (not Internal)
// Internal URLs only work within Render's network
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connection established successfully.');

    // Sync all models - creates tables if they don't exist
    // This will create all tables with their relationships
    await sequelize.sync({ force: false });
    console.log('Database synced successfully.');
 
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;

