import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Import all models to ensure they're registered
import User from '../models/User';
import Officer from '../models/Officer';
import DutyAssignment from '../models/DutyAssignment';
import DutySchedule from '../models/DutySchedule';
import OngoingActivity from '../models/OngoingActivity';
import PendingActivity from '../models/PendingActivity';
import Notification from '../models/Notification';
import Attendance from '../models/Attendance';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'officer_duty_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const connectDB = async (): Promise<void> => {
  try {
    const dbName = process.env.DB_NAME || 'officer_duty_db';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbHost = process.env.DB_HOST || '127.0.0.1';
    const dbPort = parseInt(process.env.DB_PORT || '3306');

    // First, connect without database to create it if it doesn't exist
    const tempSequelize = new Sequelize('', dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: false
    });

    await tempSequelize.authenticate();
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await tempSequelize.close();

    // Now connect to the actual database
    await sequelize.authenticate();
    console.log('MySQL connection has been established successfully.');
    
    // Sync all models - creates tables if they don't exist
    // This will create all tables with their relationships
    await sequelize.sync({ force: false });
    
    console.log('✓ Database tables created/verified successfully.');
    console.log('✓ Tables available:');
    console.log('  - users');
    console.log('  - officers');
    console.log('  - duty_assignments');
    console.log('  - duty_schedules');
    console.log('  - ongoing_activities');
    console.log('  - pending_activities');
    console.log('  - notifications');
    console.log('  - attendance');
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;

