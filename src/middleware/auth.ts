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

