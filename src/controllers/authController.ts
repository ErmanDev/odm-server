import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: number): string => {
  const secret: string = process.env.JWT_SECRET || 'secret';
  const expiresIn: string = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id }, secret, { expiresIn } as SignOptions);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role, fullName, department } = req.body;

    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Validate required fields based on role
    const userRole = role || 'officer';
    if (userRole === 'officer') {
      if (!fullName || !department) {
        res.status(400).json({ 
          success: false, 
          message: 'FullName and department are required for officer registration' 
        });
        return;
      }
    } else if (userRole === 'supervisor') {
      if (!department) {
        res.status(400).json({ 
          success: false, 
          message: 'Department is required for supervisor registration' 
        });
        return;
      }
    }

    const user = await User.create({ 
      username, 
      password, 
      role: userRole,
      fullName: (userRole === 'officer' || userRole === 'supervisor') ? fullName : undefined,
      department: (userRole === 'officer' || userRole === 'supervisor') ? department : undefined
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        department: user.department,
        token: generateToken(user.id)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Please provide username and password' });
      return;
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        department: user.department,
        token: generateToken(user.id)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user?.id);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

