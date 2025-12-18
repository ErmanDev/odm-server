import { Response } from 'express';
import { Op } from 'sequelize';
import Attendance from '../models/Attendance';
import User from '../models/User';
import ClockSettings from '../models/ClockSettings';
import { AuthRequest } from '../middleware/auth';

// Helper function to convert time string (HH:MM:SS or HH:MM) to minutes since midnight
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  return hours * 60 + minutes;
};

// Helper function to check if current time is within a time window
const isTimeInWindow = (currentTime: Date, startTime: string, endTime: string): boolean => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Handle case where window spans midnight (e.g., 23:00 - 01:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Verify user is an officer
    if (req.user.role !== 'officer') {
      res.status(403).json({ success: false, message: 'Only officers can check in' });
      return;
    }

    // Check clock settings and validate time window
    const clockSettings = await ClockSettings.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (clockSettings) {
      if (!clockSettings.isActive) {
        res.status(400).json({
          success: false,
          message: 'Clock settings are currently disabled. Please contact administrator.'
        });
        return;
      }

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const clockInStartMinutes = timeToMinutes(clockSettings.clockInStartTime);
      const clockOutStartMinutes = timeToMinutes(clockSettings.clockOutStartTime);

      // Clock-in allowed from clockInStartTime up to (but not including) clockOutStartTime
      if (currentMinutes < clockInStartMinutes || currentMinutes >= clockOutStartMinutes) {
        res.status(400).json({
          success: false,
          message: `Clock-in is only allowed from ${clockSettings.clockInStartTime} until before ${clockSettings.clockOutStartTime}`
        });
        return;
      }
    }

    // Check if officer already has an open attendance record for today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const existingAttendance = await Attendance.findOne({
      where: {
        userId: req.user.id,
        date: todayString,
        status: 'clocked-in'
      }
    });

    if (existingAttendance) {
      res.status(400).json({ 
        success: false, 
        message: 'You have already checked in today. Please check out first.' 
      });
      return;
    }

    // Create new attendance record
    const now = new Date();
    const attendance = await Attendance.create({
      userId: req.user.id,
      clockIn: now,
      date: now, // Sequelize will automatically convert Date to DATEONLY format
      status: 'clocked-in'
    });

    // Fetch with user details
    const attendanceWithUser = await Attendance.findByPk(attendance.id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }]
    });

    res.status(201).json({
      success: true,
      data: attendanceWithUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Verify user is an officer
    if (req.user.role !== 'officer') {
      res.status(403).json({ success: false, message: 'Only officers can check out' });
      return;
    }

    // Check clock settings and validate time window
    const clockSettings = await ClockSettings.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (clockSettings) {
      if (!clockSettings.isActive) {
        res.status(400).json({
          success: false,
          message: 'Clock settings are currently disabled. Please contact administrator.'
        });
        return;
      }

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const clockOutStartMinutes = timeToMinutes(clockSettings.clockOutStartTime);

      // Clock-out allowed from clockOutStartTime onwards (including any time after)
      // Once clock out time starts, officers can clock out at any time
      if (currentMinutes < clockOutStartMinutes) {
        res.status(400).json({
          success: false,
          message: `Clock-out is only allowed from ${clockSettings.clockOutStartTime} onwards`
        });
        return;
      }
      // If current time is >= clockOutStartTime, allow clock out (no upper limit)
    }

    // Find open attendance record for today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const attendance = await Attendance.findOne({
      where: {
        userId: req.user.id,
        date: todayString,
        status: 'clocked-in'
      }
    });

    if (!attendance) {
      res.status(400).json({ 
        success: false, 
        message: 'No check-in record found for today. Please check in first.' 
      });
      return;
    }

    // Update attendance record with check-out
    await attendance.update({
      clockOut: new Date(),
      status: 'clocked-out'
    });

    // Fetch with user details
    const attendanceWithUser = await Attendance.findByPk(attendance.id, {
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }]
    });

    res.status(200).json({
      success: true,
      data: attendanceWithUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Verify user is an officer
    if (req.user.role !== 'officer') {
      res.status(403).json({ success: false, message: 'Only officers can view their attendance' });
      return;
    }

    // Get query parameters for filtering
    const { startDate, endDate } = req.query;
    const whereClause: any = { userId: req.user.id };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause.date[Op.lte] = end;
      }
    }

    const attendanceRecords = await Attendance.findAll({
      where: whereClause,
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }],
      order: [['date', 'DESC'], ['clockIn', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: attendanceRecords
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Get query parameters for filtering
    const { startDate, endDate, officerId, status } = req.query;
    const whereClause: any = {};

    // Filter by user (officer)
    if (officerId) {
      whereClause.userId = parseInt(officerId as string);
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause.date[Op.lte] = end;
      }
    }

    const attendanceRecords = await Attendance.findAll({
      where: whereClause,
      include: [{ association: 'user', attributes: ['id', 'username', 'fullName', 'department', 'role'] }],
      order: [['date', 'DESC'], ['clockIn', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: attendanceRecords
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

