-- Migration script to add fullName column to users table

-- Add fullName column to users table
ALTER TABLE users 
ADD COLUMN fullName VARCHAR(255) NULL AFTER name;

-- Optionally, copy existing name values to fullName for backward compatibility
UPDATE users 
SET fullName = name 
WHERE fullName IS NULL AND name IS NOT NULL;


