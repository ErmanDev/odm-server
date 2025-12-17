import { Response } from 'express';
import Officer from '../models/Officer';
import { AuthRequest } from '../middleware/auth';

export const getOfficers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const officers = await Officer.findAll({
      include: [{ association: 'user', attributes: ['id', 'username', 'role'] }]
    });
    res.status(200).json({ success: true, data: officers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const officer = await Officer.findByPk(req.params.id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'role'] }]
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
    const officer = await Officer.create(req.body);
    res.status(201).json({ success: true, data: officer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const officer = await Officer.findByPk(req.params.id);
    if (officer) {
      await officer.update(req.body);
      res.status(200).json({ success: true, data: officer });
    } else {
      res.status(404).json({ success: false, message: 'Officer not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const officer = await Officer.findByPk(req.params.id);
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

