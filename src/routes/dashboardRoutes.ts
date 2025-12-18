import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin routes
router.get('/stats', authorize('admin'), getDashboardStats);

export default router;

