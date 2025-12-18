import { Response } from 'express';
import { Op } from 'sequelize';
import Attendance from '../models/Attendance';
import AbsenceRequest from '../models/AbsenceRequest';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Set default late check-in threshold to 9:00 AM
    const lateCheckInThreshold = new Date(today);
    lateCheckInThreshold.setHours(9, 0, 0, 0);

    // Count officers who checked in today
    const presentTodayCount = await Attendance.count({
      where: {
        date: todayString
      },
      distinct: true,
      col: 'userId'
    });

    // Count officers who checked in late today (after 9:00 AM)
    const lateCheckInCount = await Attendance.count({
      where: {
        date: todayString,
        clockIn: {
          [Op.gt]: lateCheckInThreshold
        }
      },
      distinct: true,
      col: 'userId'
    });

    // Count pending absence requests
    const absenceRequestCount = await AbsenceRequest.count({
      where: {
        status: 'pending'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        lateCheckInCount,
        presentTodayCount,
        absenceRequestCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

