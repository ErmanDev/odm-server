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

    // Log for debugging
    console.log(`[getAllAbsenceRequests] User: ${req.user.username}, Role: ${req.user.role}, Department: ${req.user.department}`);

    // Get query parameters for filtering
    const { status } = req.query;
    const whereClause: any = {};

    if (status && typeof status === 'string' && status.trim() !== '') {
      whereClause.status = status.toLowerCase();
    }

    // Filter by department for supervisors
    const departmentFilter = getDepartmentFilter(req.user);
    
    // If supervisor, get all officers in their department first
    if (departmentFilter) {
      console.log(`[getAllAbsenceRequests] Supervisor filtering by department: ${departmentFilter}`);
      const departmentOfficers = await User.findAll({
        where: {
          role: 'officer',
          department: departmentFilter
        },
        attributes: ['id']
      });
      const officerIds = departmentOfficers.map(o => o.id);
      
      console.log(`[getAllAbsenceRequests] Found ${officerIds.length} officers in department`);
      
      // If no officers in department, return empty array
      if (officerIds.length === 0) {
        console.log(`[getAllAbsenceRequests] No officers in department, returning empty array`);
        res.status(200).json({
          success: true,
          data: []
        });
        return;
      }
      
      // Filter absence requests by officer IDs
      whereClause.userId = {
        [Op.in]: officerIds
      };
    } else {
      console.log(`[getAllAbsenceRequests] Admin user - fetching all absence requests`);
    }

    const absenceRequests = await AbsenceRequest.findAll({
      where: whereClause,
      include: [{
        association: 'user',
        attributes: ['id', 'username', 'fullName', 'department', 'role']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`[getAllAbsenceRequests] Found ${absenceRequests.length} absence requests`);

    res.status(200).json({
      success: true,
      data: absenceRequests
    });
  } catch (error: any) {
    console.error(`[getAllAbsenceRequests] Error:`, error);
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

