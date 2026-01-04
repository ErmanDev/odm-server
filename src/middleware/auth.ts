import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: User;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Not authorized to access this route' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number };
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'User role is not authorized' });
      return;
    }

    next();
  };
};

/**
 * Helper function to get department filter for supervisors
 * Returns the supervisor's department if user is a supervisor, null otherwise
 */
export const getDepartmentFilter = (user: User | undefined): string | null => {
  if (!user) return null;
  if (user.role === 'supervisor' && user.department) {
    return user.department;
  }
  return null;
};

/**
 * Helper function to check if supervisor can access a resource in a specific department
 */
export const canAccessDepartment = (user: User | undefined, department: string | null | undefined): boolean => {
  if (!user) return false;
  // Admins can access all departments
  if (user.role === 'admin') return true;
  // Supervisors can only access their own department
  if (user.role === 'supervisor') {
    return user.department === department;
  }
  // Officers can only access their own data (handled separately)
  return false;
};

