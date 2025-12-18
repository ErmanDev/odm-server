-- Migration script to remove the name column from users table
-- Since fullName column already exists, we no longer need the name column

ALTER TABLE users DROP COLUMN IF EXISTS name;

