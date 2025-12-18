-- Migration script to add user tracking to clock_settings table
-- Adds createdBy and updatedBy columns to track which admin user created/updated each setting

-- Add createdBy column
ALTER TABLE clock_settings 
ADD COLUMN createdBy INT UNSIGNED NULL;

-- Add foreign key constraint for createdBy
ALTER TABLE clock_settings 
ADD CONSTRAINT fk_clock_settings_created_by 
FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add updatedBy column
ALTER TABLE clock_settings 
ADD COLUMN updatedBy INT UNSIGNED NULL;

-- Add foreign key constraint for updatedBy
ALTER TABLE clock_settings 
ADD CONSTRAINT fk_clock_settings_updated_by 
FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Note: Existing records will have createdBy and updatedBy set to NULL (historical data)

