import { Response } from 'express';
import ClockSettings from '../models/ClockSettings';
import User from '../models/User';
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

export const getClockSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await ClockSettings.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (!settings) {
      res.status(200).json({
        success: true,
        data: null,
        message: 'Clock settings not configured'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    // Check if error is due to missing database columns
    if (error.message && error.message.includes("Unknown column 'createdBy'") || 
        error.message.includes("Unknown column 'updatedBy'")) {
      res.status(500).json({ 
        success: false, 
        message: 'Database migration required. Please run the migration script: migrations/add_user_tracking_to_clock_settings.sql'
      });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const createClockSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clockInStartTime, clockOutStartTime, isActive } = req.body;

    // Validate required fields
    if (!clockInStartTime || !clockOutStartTime) {
      res.status(400).json({
        success: false,
        message: 'Clock-in start time and clock-out start time are required'
      });
      return;
    }

    // Deactivate all existing settings
    await ClockSettings.update(
      { isActive: false },
      { where: { isActive: true } }
    );

    // Create new settings with user tracking (if columns exist)
    const createData: any = {
      clockInStartTime,
      clockOutStartTime,
      isActive: isActive !== undefined ? isActive : true
    };
    
    // Only include createdBy if user is authenticated (and column exists)
    if (req.user?.id) {
      createData.createdBy = req.user.id;
    }
    
    const settings = await ClockSettings.create(createData);

    res.status(201).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    // Check if error is due to missing database columns
    if (error.message && error.message.includes("Unknown column 'createdBy'") || 
        error.message.includes("Unknown column 'updatedBy'")) {
      res.status(500).json({ 
        success: false, 
        message: 'Database migration required. Please run the migration script: migrations/add_user_tracking_to_clock_settings.sql'
      });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const updateClockSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, clockInStartTime, clockOutStartTime, isActive } = req.body;

    // Prefer updating by specific ID if provided,
    // otherwise update the most recent settings regardless of isActive
    let settings: ClockSettings | null = null;

    if (id) {
      settings = await ClockSettings.findByPk(id);
    }

    if (!settings) {
      settings = await ClockSettings.findOne({
        order: [['createdAt', 'DESC']]
      });
    }

    if (!settings) {
      res.status(404).json({
        success: false,
        message: 'Clock settings not found. Please create settings first.'
      });
      return;
    }

    // Update settings with user tracking (if columns exist)
    const updateData: any = {
      clockInStartTime: clockInStartTime || settings.clockInStartTime,
      clockOutStartTime: clockOutStartTime || settings.clockOutStartTime,
      isActive: isActive !== undefined ? isActive : settings.isActive
    };
    
    // Only include updatedBy if user is authenticated (and column exists)
    if (req.user?.id) {
      updateData.updatedBy = req.user.id;
    }
    
    await settings.update(updateData);

    // Refresh settings
    await settings.reload();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    // Check if error is due to missing database columns
    if (error.message && error.message.includes("Unknown column 'createdBy'") || 
        error.message.includes("Unknown column 'updatedBy'")) {
      res.status(500).json({ 
        success: false, 
        message: 'Database migration required. Please run the migration script: migrations/add_user_tracking_to_clock_settings.sql'
      });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const getClockAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await ClockSettings.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (!settings) {
      res.status(200).json({
        success: true,
        data: {
          canClockIn: false,
          canClockOut: false,
          message: 'Clock settings not configured',
          clockSettings: null
        }
      });
      return;
    }

    if (!settings.isActive) {
      res.status(200).json({
        success: true,
        data: {
          canClockIn: false,
          canClockOut: false,
          message: 'Clock settings are currently disabled',
          clockSettings: settings
        }
      });
      return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const clockInStartMinutes = timeToMinutes(settings.clockInStartTime);
    const clockOutStartMinutes = timeToMinutes(settings.clockOutStartTime);

    // Clock-in allowed from clockInStartTime up to (but not including) clockOutStartTime
    const canClockIn = currentMinutes >= clockInStartMinutes && currentMinutes < clockOutStartMinutes;
    // Clock-out allowed from clockOutStartTime onwards (no upper limit - once it starts, it stays available)
    const canClockOut = currentMinutes >= clockOutStartMinutes;

    let message = '';
    if (canClockIn) {
      message = 'You can clock in now';
    } else if (canClockOut) {
      message = 'You can clock out now';
    } else {
      // Before clock-in start
      if (currentMinutes < clockInStartMinutes) {
        message = `Clock-in starts at ${settings.clockInStartTime}, clock-out starts at ${settings.clockOutStartTime}`;
      } else {
        // After clock-out start but no attendance context here, just generic
        message = `Clock-out started at ${settings.clockOutStartTime}`;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        canClockIn,
        canClockOut,
        message,
        clockSettings: settings
      }
    });
  } catch (error: any) {
    // Check if error is due to missing database columns
    if (error.message && error.message.includes("Unknown column 'createdBy'") || 
        error.message.includes("Unknown column 'updatedBy'")) {
      res.status(500).json({ 
        success: false, 
        message: 'Database migration required. Please run the migration script: migrations/add_user_tracking_to_clock_settings.sql'
      });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const getClockSettingsHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allSettings = await ClockSettings.findAll({
      include: [
        {
          model: User,
          as: 'createdByUser',
          attributes: ['id', 'username', 'fullName'],
          required: false
        },
        {
          model: User,
          as: 'updatedByUser',
          attributes: ['id', 'username', 'fullName'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform the data to match the expected format
    // Note: Sequelize includes associations in toJSON(), but TypeScript doesn't know about them
    const history = allSettings.map(setting => {
      const settingData = setting.toJSON() as any;
      
      return {
        id: settingData.id,
        clockInStartTime: settingData.clockInStartTime,
        clockOutStartTime: settingData.clockOutStartTime,
        isActive: settingData.isActive,
        createdAt: settingData.createdAt,
        updatedAt: settingData.updatedAt,
        createdBy: settingData.createdByUser || null,
        updatedBy: settingData.updatedByUser || null
      };
    });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error: any) {
    // Check if error is due to missing database columns
    if (error.message && error.message.includes("Unknown column 'createdBy'") || 
        error.message.includes("Unknown column 'updatedBy'")) {
      res.status(500).json({ 
        success: false, 
        message: 'Database migration required. Please run the migration script: migrations/add_user_tracking_to_clock_settings.sql'
      });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

