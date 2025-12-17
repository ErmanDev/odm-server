import express from 'express';
import authRoutes from './authRoutes';
import officerRoutes from './officerRoutes';
import dutyAssignmentRoutes from './dutyAssignmentRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/officers', officerRoutes);
router.use('/duty-assignments', dutyAssignmentRoutes);

export default router;

