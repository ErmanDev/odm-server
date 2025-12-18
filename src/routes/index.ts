import express from 'express';
import authRoutes from './authRoutes';
import officerRoutes from './officerRoutes';
import dutyAssignmentRoutes from './dutyAssignmentRoutes';
import attendanceRoutes from './attendanceRoutes';
import absenceRequestRoutes from './absenceRequestRoutes';
import dashboardRoutes from './dashboardRoutes';
import clockSettingsRoutes from './clockSettingsRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/officers', officerRoutes);
router.use('/duty-assignments', dutyAssignmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/absence-requests', absenceRequestRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/clock-settings', clockSettingsRoutes);

export default router;

