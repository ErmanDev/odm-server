import { Response } from 'express';
import DutyAssignment from '../models/DutyAssignment';
import { AuthRequest } from '../middleware/auth';

export const getDutyAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignments = await DutyAssignment.findAll({
      include: [{ association: 'officer', attributes: ['id', 'name', 'department'] }]
    });
    res.status(200).json({ success: true, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDutyAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await DutyAssignment.findByPk(req.params.id, {
      include: [{ association: 'officer', attributes: ['id', 'name', 'department'] }]
    });
    if (assignment) {
      res.status(200).json({ success: true, data: assignment });
    } else {
      res.status(404).json({ success: false, message: 'Duty assignment not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDutyAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await DutyAssignment.create(req.body);
    res.status(201).json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDutyAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await DutyAssignment.findByPk(req.params.id);
    if (assignment) {
      await assignment.update(req.body);
      res.status(200).json({ success: true, data: assignment });
    } else {
      res.status(404).json({ success: false, message: 'Duty assignment not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDutyAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await DutyAssignment.findByPk(req.params.id);
    if (assignment) {
      await assignment.destroy();
      res.status(200).json({ success: true, data: {} });
    } else {
      res.status(404).json({ success: false, message: 'Duty assignment not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

