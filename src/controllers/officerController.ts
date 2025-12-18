import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getOfficers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const officers = await User.findAll({
      where: { role: 'officer' },
      attributes: ['id', 'username', 'role', 'fullName', 'department', 'createdAt', 'updatedAt']
    });
    res.status(200).json({ success: true, data: officers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const officer = await User.findOne({
      where: { 
        id: req.params.id,
        role: 'officer'
      },
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
    const { username, password, fullName, department } = req.body;
    
    if (!username || !password || !fullName || !department) {
      res.status(400).json({ success: false, message: 'Username, password, fullName, and department are required' });
      return;
    }

    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      res.status(400).json({ success: false, message: 'Username already exists' });
      return;
    }

    const officer = await User.create({
      username,
      password,
      role: 'officer',
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
    const officer = await User.findOne({
      where: { 
        id: req.params.id,
        role: 'officer'
      }
    });
    if (officer) {
      // Only allow updating fullName and department, not username, password, or role
      const { fullName, department } = req.body;
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
    } else {
      res.status(404).json({ success: false, message: 'Officer not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const officer = await User.findOne({
      where: { 
        id: req.params.id,
        role: 'officer'
      }
    });
    if (officer) {
      await officer.destroy();
      res.status(200).json({ success: true, data: {} });
    } else {
      res.status(404).json({ success: false, message: 'Officer not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

