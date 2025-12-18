import express from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance
} from '../controllers/attendanceController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Officer routes
router.post('/checkin', authorize('officer'), checkIn);
router.post('/checkout', authorize('officer'), checkOut);
router.get('/me', authorize('officer'), getMyAttendance);

// Admin routes
router.get('/', authorize('admin'), getAllAttendance);

export default router;

