import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

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

// SQLite database file path - stored locally in the project
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/officer_duty.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath, 
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
    console.log('SQLite database connection established successfully.');

    
    // Sync all models - creates tables if they don't exist
    // This will create all tables with their relationships
    await sequelize.sync({ force: false });
    console.log('Connected to the database successfully.');
 
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;

