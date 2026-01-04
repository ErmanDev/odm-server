import { Response } from 'express';
import { Op } from 'sequelize';
import DutyAssignment from '../models/DutyAssignment';
import User from '../models/User';
import { AuthRequest, getDepartmentFilter, canAccessDepartment } from '../middleware/auth';

export const getDutyAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    const whereClause: any = {};
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    // Filter by department for supervisors
    const departmentFilter = getDepartmentFilter(req.user);
    if (departmentFilter) {
      whereClause.department = departmentFilter;
    }
    
    const assignments = await DutyAssignment.findAll({
      where: whereClause,
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }],
      order: [['date', 'DESC']]
    });
    res.status(200).json({ success: true, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDutyAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await DutyAssignment.findByPk(req.params.id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }]
    });
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Duty assignment not found' });
      return;
    }
    
    // Check if supervisor can access this assignment's department
    if (!canAccessDepartment(req.user, assignment.department)) {
      res.status(403).json({ success: false, message: 'Access denied to this resource' });
      return;
    }
    
    res.status(200).json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDutyAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, date, department, taskLocation, status } = req.body;
    
    // Validate required fields
    if (!userId || !date || !taskLocation) {
      res.status(400).json({ success: false, message: 'userId, date, and taskLocation are required' });
      return;
    }
    
    // Validate userId exists and is an officer
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    
    if (user.role !== 'officer') {
      res.status(400).json({ success: false, message: 'User must be an officer' });
      return;
    }
    
    // Determine department
    const assignmentDepartment = department || user.department || '';
    
    // If supervisor, ensure they can only assign to their department
    if (req.user?.role === 'supervisor') {
      if (!canAccessDepartment(req.user, assignmentDepartment)) {
        res.status(403).json({ success: false, message: 'You can only assign officers from your department' });
        return;
      }
    }
    
    // Create assignment with auto-populated officerName
    const assignment = await DutyAssignment.create({
      userId,
      date,
      officerName: user.fullName || user.username,
      department: assignmentDepartment,
      taskLocation,
      status: status || 'pending'
    });
    
    // Fetch with user association
    const assignmentWithUser = await DutyAssignment.findByPk(assignment.id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }]
    });
    
    res.status(201).json({ success: true, data: assignmentWithUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDutyAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await DutyAssignment.findByPk(req.params.id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }]
    });
    
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Duty assignment not found' });
      return;
    }
    
    // Check if supervisor can access this assignment's department
    if (!canAccessDepartment(req.user, assignment.department)) {
      res.status(403).json({ success: false, message: 'Access denied to this resource' });
      return;
    }
    
    // If userId is being updated, validate and update officerName
    if (req.body.userId && req.body.userId !== assignment.userId) {
      const user = await User.findByPk(req.body.userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      if (user.role !== 'officer') {
        res.status(400).json({ success: false, message: 'User must be an officer' });
        return;
      }
      req.body.officerName = user.fullName || user.username;
      if (!req.body.department && user.department) {
        req.body.department = user.department;
      }
      
      // If supervisor, ensure they can only assign to their department
      if (req.user?.role === 'supervisor') {
        const newDepartment = req.body.department || user.department || '';
        if (!canAccessDepartment(req.user, newDepartment)) {
          res.status(403).json({ success: false, message: 'You can only assign officers from your department' });
          return;
        }
      }
    }
    
    await assignment.update(req.body);
    
    // Fetch updated assignment with user association
    const updatedAssignment = await DutyAssignment.findByPk(assignment.id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }]
    });
    
    res.status(200).json({ success: true, data: updatedAssignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDutyAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await DutyAssignment.findByPk(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Duty assignment not found' });
      return;
    }
    
    // Check if supervisor can access this assignment's department
    if (!canAccessDepartment(req.user, assignment.department)) {
      res.status(403).json({ success: false, message: 'Access denied to this resource' });
      return;
    }
    
    await assignment.destroy();
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyDutyAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    
    const assignments = await DutyAssignment.findAll({
      where: { userId },
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }],
      order: [['date', 'DESC']]
    });
    
    res.status(200).json({ success: true, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

