import { Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import { AuthRequest, getDepartmentFilter, canAccessDepartment } from '../middleware/auth';

export const getOfficers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const whereClause: any = {};
    
    // For admins, show both officers and supervisors
    // For supervisors, only show officers in their department
    if (req.user?.role === 'admin') {
      whereClause.role = { [Op.in]: ['officer', 'supervisor'] };
    } else {
      whereClause.role = 'officer';
      // Filter by department for supervisors
      const departmentFilter = getDepartmentFilter(req.user);
      if (departmentFilter) {
        whereClause.department = departmentFilter;
      }
    }
    
    const officers = await User.findAll({
      where: whereClause,
      attributes: ['id', 'username', 'role', 'fullName', 'department', 'createdAt', 'updatedAt']
    });
    res.status(200).json({ success: true, data: officers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const whereClause: any = { 
      id: req.params.id,
      role: 'officer'
    };
    
    // Filter by department for supervisors
    const departmentFilter = getDepartmentFilter(req.user);
    if (departmentFilter) {
      whereClause.department = departmentFilter;
    }
    
    const officer = await User.findOne({
      where: whereClause,
      attributes: ['id', 'username', 'role', 'fullName', 'department', 'createdAt', 'updatedAt']
    });
    if (officer) {
      res.status(200).json({ success: true, data: officer });
    } else {
      res.status(404).json({ success: false, message: 'Officer not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password, fullName, department, role } = req.body;
    
    if (!username || !password || !fullName || !department) {
      res.status(400).json({ success: false, message: 'Username, password, fullName, and department are required' });
      return;
    }

    // If supervisor, ensure they can only create officers (not supervisors)
    if (req.user?.role === 'supervisor') {
      if (role && role.toLowerCase() !== 'officer') {
        res.status(403).json({ success: false, message: 'Supervisors can only create officers' });
        return;
      }
      if (!canAccessDepartment(req.user, department)) {
        res.status(403).json({ success: false, message: 'You can only create officers in your department' });
        return;
      }
    }

    // Determine the role to assign
    let userRole: 'admin' | 'supervisor' | 'officer' = 'officer'; // Default to officer
    if (role) {
      const requestedRole = role.toLowerCase();
      // Only admins can create supervisors
      if (requestedRole === 'supervisor' && req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Only admins can create supervisors' });
        return;
      }
      // Supervisors can only create officers (already checked above)
      if (requestedRole === 'supervisor' || requestedRole === 'officer') {
        userRole = requestedRole as 'supervisor' | 'officer';
      }
    }

    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      res.status(400).json({ success: false, message: 'Username already exists' });
      return;
    }

    const officer = await User.create({
      username,
      password,
      role: userRole,
      fullName,
      department
    });

    res.status(201).json({ 
      success: true, 
      data: {
        id: officer.id,
        username: officer.username,
        role: officer.role,
        fullName: officer.fullName,
        department: officer.department
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const whereClause: any = { 
      id: req.params.id,
      role: 'officer'
    };
    
    // Filter by department for supervisors
    const departmentFilter = getDepartmentFilter(req.user);
    if (departmentFilter) {
      whereClause.department = departmentFilter;
    }
    
    const officer = await User.findOne({
      where: whereClause
    });
    
    if (!officer) {
      res.status(404).json({ success: false, message: 'Officer not found' });
      return;
    }
    
    // Only allow updating fullName and department, not username, password, or role
    const { fullName, department } = req.body;
    
    // If supervisor is updating department, ensure it's their own department
    if (req.user?.role === 'supervisor' && department) {
      if (!canAccessDepartment(req.user, department)) {
        res.status(403).json({ success: false, message: 'You can only assign officers to your department' });
        return;
      }
    }
    
    await officer.update({ fullName, department });
    res.status(200).json({ 
      success: true, 
      data: {
        id: officer.id,
        username: officer.username,
        role: officer.role,
        fullName: officer.fullName,
        department: officer.department
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const whereClause: any = { 
      id: req.params.id,
      role: 'officer'
    };
    
    // Filter by department for supervisors
    const departmentFilter = getDepartmentFilter(req.user);
    if (departmentFilter) {
      whereClause.department = departmentFilter;
    }
    
    const officer = await User.findOne({
      where: whereClause
    });
    
    if (!officer) {
      res.status(404).json({ success: false, message: 'Officer not found' });
      return;
    }
    
    await officer.destroy();
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

