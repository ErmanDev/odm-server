import { Response } from 'express';
import { Op } from 'sequelize';
import AbsenceRequest from '../models/AbsenceRequest';
import User from '../models/User';
import { AuthRequest, getDepartmentFilter, canAccessDepartment } from '../middleware/auth';

export const createAbsenceRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      res.status(400).json({ success: false, message: 'Please provide startDate, endDate, and reason' });
      return;
    }

    // Verify user is an officer
    if (req.user.role !== 'officer') {
      res.status(403).json({ success: false, message: 'Only officers can create absence requests' });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      res.status(400).json({ success: false, message: 'Start date must be before or equal to end date' });
      return;
    }

    const absenceRequest = await AbsenceRequest.create({
      userId: req.user.id,
      startDate: start,
      endDate: end,
      reason,
      status: 'pending'
    });

    // Fetch with user details
    const requestWithUser = await AbsenceRequest.findByPk(absenceRequest.id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }]
    });

    res.status(201).json({
      success: true,
      data: requestWithUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAbsenceRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Verify user is an officer
    if (req.user.role !== 'officer') {
      res.status(403).json({ success: false, message: 'Only officers can create absence requests' });
      return;
    }

    const absenceRequests = await AbsenceRequest.findAll({
      where: { userId: req.user.id },
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: absenceRequests
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAbsenceRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Get query parameters for filtering
    const { status } = req.query;
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    // Filter by department for supervisors
    const departmentFilter = getDepartmentFilter(req.user);
    const includeOptions: any = [{
      association: 'user',
      attributes: ['id', 'username', 'fullName', 'department', 'role']
    }];

    if (departmentFilter) {
      includeOptions[0].where = { department: departmentFilter };
    }

    const absenceRequests = await AbsenceRequest.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['createdAt', 'DESC']]
    });

    // Filter results for supervisors (in case include filter didn't work as expected)
    let filteredRequests = absenceRequests;
    if (departmentFilter) {
      filteredRequests = absenceRequests.filter(req => {
        const user = (req as any).user;
        return user && user.department === departmentFilter;
      });
    }

    res.status(200).json({
      success: true,
      data: filteredRequests
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAbsenceRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Please provide a valid status (approved or rejected)' });
      return;
    }

    const absenceRequest = await AbsenceRequest.findByPk(id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }]
    });
    
    if (!absenceRequest) {
      res.status(404).json({ success: false, message: 'Absence request not found' });
      return;
    }

    // Check if supervisor can access this request's department
    const user = (absenceRequest as any).user;
    if (user && !canAccessDepartment(req.user, user.department)) {
      res.status(403).json({ success: false, message: 'Access denied to this resource' });
      return;
    }

    await absenceRequest.update({ status });

    // Fetch with user details
    const requestWithUser = await AbsenceRequest.findByPk(id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }]
    });

    res.status(200).json({
      success: true,
      data: requestWithUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

