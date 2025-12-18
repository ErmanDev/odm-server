-- Migration script to recreate tables with correct schema
-- Run this script to fix table structure issues

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS absence_requests;
DROP TABLE IF EXISTS clock_settings;
DROP TABLE IF EXISTS officers;
-- Note: We're NOT dropping users table to preserve existing user data

-- Create users table if it doesn't exist (to ensure it exists before officers table references it)
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'officer') NOT NULL DEFAULT 'officer',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create officers table
CREATE TABLE officers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  userId INT UNSIGNED NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create attendance table
CREATE TABLE attendance (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  officerId INT UNSIGNED NOT NULL,
  clockIn DATETIME NOT NULL,
  clockOut DATETIME NULL,
  date DATE NOT NULL DEFAULT (CURRENT_DATE),
  status ENUM('clocked-in', 'clocked-out') NOT NULL DEFAULT 'clocked-in',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (officerId) REFERENCES officers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create absence_requests table
CREATE TABLE absence_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  officerId INT UNSIGNED NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (officerId) REFERENCES officers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create clock_settings table
CREATE TABLE clock_settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clockInStartTime TIME NOT NULL,
  clockOutStartTime TIME NOT NULL,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

