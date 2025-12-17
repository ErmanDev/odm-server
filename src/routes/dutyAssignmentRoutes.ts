import express from 'express';
import {
  getDutyAssignments,
  getDutyAssignment,
  createDutyAssignment,
  updateDutyAssignment,
  deleteDutyAssignment
} from '../controllers/dutyAssignmentController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDutyAssignments)
  .post(authorize('admin'), createDutyAssignment);

router.route('/:id')
  .get(getDutyAssignment)
  .put(authorize('admin'), updateDutyAssignment)
  .delete(authorize('admin'), deleteDutyAssignment);

export default router;

