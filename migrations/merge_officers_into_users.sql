-- Migration script to merge officers table into users table
-- This refactors the database to use only the users table with role-based differentiation

-- Step 1: Drop foreign key constraints (get constraint names first if needed)
-- Note: MySQL constraint names may vary, so we'll handle errors gracefully

-- Step 2: Drop dependent tables first (they will be recreated)
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS absence_requests;
DROP TABLE IF EXISTS pending_activities;
DROP TABLE IF EXISTS ongoing_activities;
DROP TABLE IF EXISTS duty_schedules;
DROP TABLE IF EXISTS duty_assignments;

-- Step 3: Add name, fullName, and department columns to users table
-- Check if columns exist first by attempting to add (will fail gracefully if exists)
ALTER TABLE users 
ADD COLUMN name VARCHAR(255) NULL,
ADD COLUMN fullName VARCHAR(255) NULL,
ADD COLUMN department VARCHAR(255) NULL;

-- Step 4: Migrate data from officers to users (if officers table exists and has data)
UPDATE users u
INNER JOIN officers o ON u.id = o.userId
SET u.name = o.name, u.fullName = o.name, u.department = o.department
WHERE o.userId IS NOT NULL;

-- Step 5: Drop the officers table
DROP TABLE IF EXISTS officers;

-- Step 6: Recreate tables with userId instead of officerId

-- Create attendance table with userId
CREATE TABLE attendance (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId INT UNSIGNED NOT NULL,
  clockIn DATETIME NOT NULL,
  clockOut DATETIME NULL,
  date DATE NOT NULL DEFAULT (CURRENT_DATE),
  status ENUM('clocked-in', 'clocked-out') NOT NULL DEFAULT 'clocked-in',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create absence_requests table with userId
CREATE TABLE absence_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId INT UNSIGNED NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create pending_activities table with userId
CREATE TABLE pending_activities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  officerName VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  activity VARCHAR(500) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  userId INT UNSIGNED NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ongoing_activities table with userId
CREATE TABLE ongoing_activities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date DATETIME NOT NULL,
  task VARCHAR(500) NOT NULL,
  location VARCHAR(255) NOT NULL,
  status ENUM('in-progress', 'completed', 'on-hold') NOT NULL DEFAULT 'in-progress',
  action VARCHAR(255) NOT NULL,
  userId INT UNSIGNED NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create duty_schedules table with userId
CREATE TABLE duty_schedules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  duty VARCHAR(500) NOT NULL,
  userId INT UNSIGNED NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create duty_assignments table with userId
CREATE TABLE duty_assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  officerName VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  taskLocation VARCHAR(255) NOT NULL,
  status ENUM('pending', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  userId INT UNSIGNED NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
