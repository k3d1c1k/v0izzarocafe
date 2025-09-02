-- IZZARO Menu Items Seed Data
-- This script adds all the IZZARO menu items with proper Turkish categories

-- Atıştırmalıklar (Appetizers) - using "Tatlılar" category for now
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Çıtır Tavuk Parçaları', 'Çıtır çıtır pane edilmiş tavuk parçaları', 85.00, 'Tatlılar', 1, 15, NOW(), NOW()),
('Trüf Yağlı Parmesanlı Patates', 'Trüf yağı ve parmesan peyniri ile hazırlanmış özel patates', 95.00, 'Tatlılar', 1, 20, NOW(), NOW()),
('Sade Patates', 'Klasik patates kızartması', 45.00, 'Tatlılar', 1, 10, NOW(), NOW()),
('Bira Tabağı', 'Çeşitli atıştırmalıkların bir arada sunulduğu özel tabak', 120.00, 'Tatlılar', 1, 25, NOW(), NOW()),
('Soğan Halkası + Cips', 'Çıtır soğan halkaları ve patates cipsi', 65.00, 'Tatlılar', 1, 15, NOW(), NOW()),
('Mozzarella Stick + Cips', 'Çıtır mozzarella çubukları ve patates cipsi', 75.00, 'Tatlılar', 1, 15, NOW(), NOW());

-- IZZARO MAKARNALAR (Pasta)
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Spaghetti Bolonez', 'Dana kıyma bolonez sos parmesan peyniri', 110.00, 'Classic Coffee', 1, 25, NOW(), NOW()),
('Alfredo', 'Krema mantar parmesan peyniri tavuk', 125.00, 'Classic Coffee', 1, 20, NOW(), NOW()),
('Pesto Penne', 'Pesto sos parmesan peyniri', 115.00, 'Classic Coffee', 1, 18, NOW(), NOW()),
('Napolitan', 'Domates sos parmesan peyniri', 95.00, 'Classic Coffee', 1, 15, NOW(), NOW()),
('Arabbiata', 'Acılı domates sos parmesan peyniri', 105.00, 'Classic Coffee', 1, 18, NOW(), NOW()),
('Sea Food', 'Karışık deniz mahsulleri domates sos parmesan peyniri', 145.00, 'Classic Coffee', 1, 30, NOW(), NOW());

-- IZZARO PİZZALAR (Pizzas)
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Margarita', 'Muzerella peynir domates sos', 95.00, 'Hot Chocolate', 1, 20, NOW(), NOW()),
('Peperoni', 'Muzerella peynir dana sucuk domates sos', 115.00, 'Hot Chocolate', 1, 22, NOW(), NOW()),
('Akdeniz', 'Muzerella peynir domates sos mantar zeytin kapya biber yeşil biber domates beyaz peynir kekik', 125.00, 'Hot Chocolate', 1, 25, NOW(), NOW()),
('4 Peynir', 'Muzerella peynir rokfor cheddar parmesan domates sos', 135.00, 'Hot Chocolate', 1, 23, NOW(), NOW()),
('BBQ Chicken', 'Muzerella peyniri domates sos tavuk parçaları bbq sos', 130.00, 'Hot Chocolate', 1, 25, NOW(), NOW());

-- IZZARO Tavuk Tabakları (Chicken Dishes)
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Kremalı Mantarlı Tavuk', 'Krema ve mantarla sote edilmiş tavuklarımıza Akdeniz salatası ve köri soslu makarnamız eşlik ediyor', 145.00, 'Coffee Specials', 1, 30, NOW(), NOW()),
('Mangal Soslu Tavuk', 'Mangal aramaları ile sote edilmiş tavuklarımıza Akdeniz salatası ve köri soslu makarnamız eşlik ediyor', 140.00, 'Coffee Specials', 1, 28, NOW(), NOW()),
('Tereyağlı Sosla Tavuk', 'Tiryaki sos ile sote edilmiş tavuklarımıza Akdeniz salatası ve köri soslu makarnamız eşlik ediyor', 135.00, 'Coffee Specials', 1, 28, NOW(), NOW());

-- IZZARO SALATALAR (Salads)
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Akdeniz Salata', 'Akdeniz yeşillikleri beyaz peynir Çeri domates havuç zeytin kapya zeytinyağlı Salata sos kekik', 85.00, 'Rum/Konyak Gin', 1, 15, NOW(), NOW()),
('Tuna Salata', 'Akdeniz yeşillikleri ton balığı zeytinyağlı salata sos', 95.00, 'Rum/Konyak Gin', 1, 12, NOW(), NOW()),
('Sezar Salata', 'Ice berg marul ızgara tavuk Sezar sos parmesan peyniri', 105.00, 'Rum/Konyak Gin', 1, 18, NOW(), NOW()),
('Tuna Peynirli Cevizli Salata', 'Akdeniz yeşillikleri tuna peyniri cevizli zeytinyagı salata sos', 110.00, 'Rum/Konyak Gin', 1, 15, NOW(), NOW()),
('Çıtır Tavuk Salata', 'Akdeniz yeşillikleri panellenmiş çıtır tavuk parmesan peyniri zeytinyagı salata sos', 115.00, 'Rum/Konyak Gin', 1, 20, NOW(), NOW());
