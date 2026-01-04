import express from 'express';
import {
  createAbsenceRequest,
  getMyAbsenceRequests,
  getAllAbsenceRequests,
  updateAbsenceRequestStatus
} from '../controllers/absenceRequestController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Officer routes
router.post('/', authorize('officer'), createAbsenceRequest);
router.get('/me', authorize('officer'), getMyAbsenceRequests);

// Admin and Supervisor routes
router.get('/', authorize('admin', 'supervisor'), getAllAbsenceRequests);
router.put('/:id/status', authorize('admin', 'supervisor'), updateAbsenceRequestStatus);

export default router;

