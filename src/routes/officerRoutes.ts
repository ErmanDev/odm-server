import express from 'express';
import {
  getOfficers,
  getOfficer,
  createOfficer,
  updateOfficer,
  deleteOfficer
} from '../controllers/officerController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOfficers)
  .post(authorize('admin', 'supervisor'), createOfficer);

router.route('/:id')
  .get(getOfficer)
  .put(authorize('admin', 'supervisor'), updateOfficer)
  .delete(authorize('admin', 'supervisor'), deleteOfficer);

export default router;

