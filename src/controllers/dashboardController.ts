import { Response } from 'express';
import { Op } from 'sequelize';
import Attendance from '../models/Attendance';
import AbsenceRequest from '../models/AbsenceRequest';
import DutyAssignment from '../models/DutyAssignment';
import User from '../models/User';
import { AuthRequest, getDepartmentFilter } from '../middleware/auth';

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

export const getSupervisorDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const departmentFilter = getDepartmentFilter(req.user);
    if (!departmentFilter) {
      res.status(403).json({ success: false, message: 'Supervisor must have a department assigned' });
      return;
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Set default late check-in threshold to 9:00 AM
    const lateCheckInThreshold = new Date(today);
    lateCheckInThreshold.setHours(9, 0, 0, 0);

    // Get all officers in supervisor's department
    const departmentOfficers = await User.findAll({
      where: {
        role: 'officer',
        department: departmentFilter
      },
      attributes: ['id']
    });
    const officerIds = departmentOfficers.map(o => o.id);

    // Count officers who checked in today (in supervisor's department)
    const presentTodayCount = await Attendance.count({
      where: {
        date: todayString,
        userId: {
          [Op.in]: officerIds
        }
      },
      distinct: true,
      col: 'userId'
    });

    // Count officers who checked in late today (after 9:00 AM) in supervisor's department
    const lateCheckInCount = await Attendance.count({
      where: {
        date: todayString,
        clockIn: {
          [Op.gt]: lateCheckInThreshold
        },
        userId: {
          [Op.in]: officerIds
        }
      },
      distinct: true,
      col: 'userId'
    });

    // Count pending absence requests from officers in supervisor's department
    const absenceRequestCount = await AbsenceRequest.count({
      where: {
        status: 'pending',
        userId: {
          [Op.in]: officerIds
        }
      }
    });

    // Count active duty assignments for officers in supervisor's department
    const activeDutyAssignmentsCount = await DutyAssignment.count({
      where: {
        department: departmentFilter,
        status: {
          [Op.in]: ['pending', 'in-progress']
        }
      }
    });

    // Count total officers in supervisor's department
    const totalOfficersCount = officerIds.length;

    res.status(200).json({
      success: true,
      data: {
        lateCheckInCount,
        presentTodayCount,
        absenceRequestCount,
        activeDutyAssignmentsCount,
        totalOfficersCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

