import dotenv from 'dotenv';

dotenv.config();

export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://127.0.0.1:3000/api',
  VERSION: 'v1',
  ENDPOINTS: {
    // Authentication
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      ME: '/auth/me',
      LOGOUT: '/auth/logout'
    },
    // Officers
    OFFICERS: {
      BASE: '/officers',
      BY_ID: (id: string) => `/officers/${id}`
    },
    // Duty Assignments
    DUTY_ASSIGNMENTS: {
      BASE: '/duty-assignments',
      BY_ID: (id: string) => `/duty-assignments/${id}`
    },
    // Duty Schedules
    DUTY_SCHEDULES: {
      BASE: '/duty-schedules',
      BY_ID: (id: string) => `/duty-schedules/${id}`
    },
    // Ongoing Activities
    ONGOING_ACTIVITIES: {
      BASE: '/ongoing-activities',
      BY_ID: (id: string) => `/ongoing-activities/${id}`
    },
    // Pending Activities
    PENDING_ACTIVITIES: {
      BASE: '/pending-activities',
      BY_ID: (id: string) => `/pending-activities/${id}`
    },
    // Notifications
    NOTIFICATIONS: {
      BASE: '/notifications',
      BY_ID: (id: string) => `/notifications/${id}`,
      MARK_READ: (id: string) => `/notifications/${id}/read`
    },
    // Attendance
    ATTENDANCE: {
      BASE: '/attendance',
      CLOCK_IN: '/attendance/clock-in',
      CLOCK_OUT: '/attendance/clock-out',
      BY_ID: (id: string) => `/attendance/${id}`
    },
    // Departments
    DEPARTMENTS: {
      BASE: '/departments',
      BY_ID: (id: string) => `/departments/${id}`
    }
  }
};

export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

