import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getClockSettings,
  createClockSettings,
  updateClockSettings,
  getClockAvailability,
  getClockSettingsHistory
} from '../controllers/clockSettingsController';

const router = express.Router();

// Get current clock settings (all authenticated users)
router.get('/', protect, getClockSettings);

// Check clock availability (officer)
router.get('/availability', protect, getClockAvailability);

// Get clock settings history (admin only)
router.get('/history', protect, authorize('admin'), getClockSettingsHistory);

// Create clock settings (admin only)
router.post('/', protect, authorize('admin'), createClockSettings);

// Update clock settings (admin only)
router.put('/', protect, authorize('admin'), updateClockSettings);

export default router;

