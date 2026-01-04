import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import routes from './routes';
import { API_CONFIG } from './config/api';

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    apiBaseUrl: API_CONFIG.BASE_URL
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Base URL: ${API_CONFIG.BASE_URL}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.log(`\nTo fix this, run one of these commands:`);
    console.log(`  Windows: netstat -ano | findstr :${PORT}`);
    console.log(`  Then kill the process: taskkill /PID <PID> /F`);
    console.log(`\nOr change the port by setting PORT environment variable.`);
    process.exit(1);
  } else {
    throw err;
  }
});

