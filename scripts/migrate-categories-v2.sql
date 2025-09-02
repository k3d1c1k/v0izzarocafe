-- Migration script to update menu categories from old system to new Turkish categories
-- This script maps existing categories to new ones and updates the database schema

USE restaurant_pos;

-- First, let's create a temporary mapping table to help with the migration
CREATE TEMPORARY TABLE category_mapping (
    old_category VARCHAR(50),
    new_category VARCHAR(50)
);

-- Insert mapping from old categories to new ones
-- Based on the existing data, we'll map logically:
INSERT INTO category_mapping (old_category, new_category) VALUES
('starters', 'classic_coffee'),  -- Hot Coffee items -> Classic Coffee
('mains', 'ice_latte'),          -- Ice Coffee items -> Ice Latte  
('desserts', 'rum_konyak_gin'),  -- Alkoller items -> Rum/Konyak Gin
('drinks', 'italian_soda');      -- Diğerleri items -> Italian Soda

-- Step 1: Add new category column temporarily
ALTER TABLE menu_items ADD COLUMN new_category VARCHAR(50);

-- Step 2: Update existing records with new category values
UPDATE menu_items m 
JOIN category_mapping cm ON m.category = cm.old_category 
SET m.new_category = cm.new_category;

-- Step 3: Drop the old category column
ALTER TABLE menu_items DROP COLUMN category;

-- Step 4: Rename new_category to category
ALTER TABLE menu_items CHANGE COLUMN new_category category VARCHAR(50) NOT NULL;

-- Step 5: Update the column to use the new ENUM with all Turkish categories
ALTER TABLE menu_items MODIFY COLUMN category ENUM(
    'tatlilar',
    'classic_coffee', 
    'hot_chocolate',
    'coffee_specials',
    'rum_konyak_gin',
    'whiskey',
    'ice_latte',
    'coffee_chiller',
    'freshly_squeezed_juices',
    'international_kokteyl',
    'signatura_izzaro',
    'smoothie_fruit_spills',
    'italian_soda',
    'tropical_chillers',
    'milk_shake'
) NOT NULL;

-- Step 6: Clean up temporary table
DROP TEMPORARY TABLE category_mapping;

-- Verify the migration
SELECT category, COUNT(*) as item_count 
FROM menu_items 
GROUP BY category 
ORDER BY category;

-- Show sample of migrated data
SELECT id, name, category, price 
FROM menu_items 
LIMIT 10;
