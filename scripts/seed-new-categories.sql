-- Seed data with new Turkish categories
-- This script adds sample menu items for each new category

USE restaurant_pos;

-- Clear existing menu items to start fresh with new categories
DELETE FROM order_items;
DELETE FROM menu_items;

-- Insert sample items for each new category

-- Tatlılar
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-t1', 'Tiramisu', 'İtalyan klasiği, mascarpone ve kahve aromalı', 35.00, 'tatlilar', 5),
('menu-t2', 'Cheesecake', 'New York usulü cheesecake, meyveli sos ile', 32.00, 'tatlilar', 5),
('menu-t3', 'Baklava', 'Geleneksel Türk baklavası, antep fıstıklı', 28.00, 'tatlilar', 10);

-- Classic Coffee
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-cc1', 'Americano', 'Klasik Amerikan kahvesi, sade ve güçlü', 24.00, 'classic_coffee', 3),
('menu-cc2', 'Espresso', 'İtalyan espresso, yoğun ve aromatik', 22.00, 'classic_coffee', 2),
('menu-cc3', 'Cappuccino', 'Espresso, süt köpüğü ve tarçın ile', 28.00, 'classic_coffee', 4),
('menu-cc4', 'Latte', 'Espresso ve sıcak süt karışımı', 26.00, 'classic_coffee', 4);

-- Hot Chocolate
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-hc1', 'Classic Hot Chocolate', 'Geleneksel sıcak çikolata, marshmallow ile', 25.00, 'hot_chocolate', 5),
('menu-hc2', 'White Hot Chocolate', 'Beyaz çikolatalı sıcak içecek', 27.00, 'hot_chocolate', 5),
('menu-hc3', 'Spiced Hot Chocolate', 'Baharatlı sıcak çikolata, tarçın ve karanfil', 29.00, 'hot_chocolate', 6);

-- Coffee Specials
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-cs1', 'Turkish Coffee', 'Geleneksel Türk kahvesi, şekerli veya sade', 20.00, 'coffee_specials', 8),
('menu-cs2', 'French Press', 'Fransız usulü demlik kahve', 26.00, 'coffee_specials', 6),
('menu-cs3', 'Cortado', 'İspanyol kahvesi, eşit oranda süt ile', 28.00, 'coffee_specials', 4);

-- Rum/Konyak Gin
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-rkg1', 'Bacardi Rum', 'Premium Bacardi rom, buzlu', 45.00, 'rum_konyak_gin', 2),
('menu-rkg2', 'Hennessy Cognac', 'Fransız konyağı, premium kalite', 85.00, 'rum_konyak_gin', 2),
('menu-rkg3', 'Bombay Gin', 'İngiliz cini, botanik aromalı', 55.00, 'rum_konyak_gin', 2);

-- Whiskey
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-w1', 'Jack Daniels', 'Tennessee whiskey, klasik', 60.00, 'whiskey', 2),
('menu-w2', 'Jameson', 'İrlanda whiskey, yumuşak', 65.00, 'whiskey', 2),
('menu-w3', 'Macallan 12', 'İskoç single malt, 12 yıllık', 120.00, 'whiskey', 2);

-- Ice Latte
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-il1', 'Iced Vanilla Latte', 'Soğuk vanilya latte, buzlu', 32.00, 'ice_latte', 5),
('menu-il2', 'Iced Caramel Latte', 'Soğuk karamel latte, şuruplu', 34.00, 'ice_latte', 5),
('menu-il3', 'Iced Hazelnut Latte', 'Soğuk fındık aromalı latte', 33.00, 'ice_latte', 5);

-- Coffee Chiller
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-cch1', 'Frappuccino', 'Buzlu kahve karışımı, krema ile', 36.00, 'coffee_chiller', 6),
('menu-cch2', 'Iced Mocha', 'Soğuk mokka, çikolata ve kahve', 35.00, 'coffee_chiller', 5),
('menu-cch3', 'Cold Brew', 'Soğuk demleme kahve, yoğun', 30.00, 'coffee_chiller', 3);

-- Freshly Squeezed Juices
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-fsj1', 'Orange Juice', 'Taze sıkılmış portakal suyu', 18.00, 'freshly_squeezed_juices', 3),
('menu-fsj2', 'Apple Juice', 'Taze elma suyu, doğal', 16.00, 'freshly_squeezed_juices', 3),
('menu-fsj3', 'Mixed Fruit Juice', 'Karışık meyve suyu, vitamin deposu', 22.00, 'freshly_squeezed_juices', 4);

-- International Kokteyl
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-ik1', 'Mojito', 'Klasik mojito, nane ve lime ile', 42.00, 'international_kokteyl', 5),
('menu-ik2', 'Piña Colada', 'Tropik kokteyl, ananas ve hindistan cevizi', 45.00, 'international_kokteyl', 6),
('menu-ik3', 'Cosmopolitan', 'Pembe kokteyl, cranberry ve lime', 48.00, 'international_kokteyl', 4);

-- Signatura Izzaro
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-si1', 'Izzaro Special', 'Özel Izzaro karışımı, sır reçete', 55.00, 'signatura_izzaro', 8),
('menu-si2', 'Café Izzaro', 'Izzaro imza kahvesi, özel harman', 38.00, 'signatura_izzaro', 6),
('menu-si3', 'Izzaro Delight', 'Tatlı Izzaro karışımı, çikolatalı', 42.00, 'signatura_izzaro', 7);

-- Smoothie Fruit Spills
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-sfs1', 'Berry Smoothie', 'Karışık berry smoothie, yoğurtlu', 28.00, 'smoothie_fruit_spills', 4),
('menu-sfs2', 'Mango Smoothie', 'Tropik mango smoothie, taze', 26.00, 'smoothie_fruit_spills', 4),
('menu-sfs3', 'Green Smoothie', 'Yeşil smoothie, ıspanak ve meyve', 30.00, 'smoothie_fruit_spills', 5);

-- Italian Soda
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-is1', 'Lemon Italian Soda', 'İtalyan sodası, limon aromalı', 20.00, 'italian_soda', 3),
('menu-is2', 'Strawberry Italian Soda', 'Çilek aromalı İtalyan sodası', 22.00, 'italian_soda', 3),
('menu-is3', 'Vanilla Italian Soda', 'Vanilya aromalı İtalyan sodası', 21.00, 'italian_soda', 3);

-- Tropical Chillers
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-tc1', 'Tropical Paradise', 'Tropik meyve karışımı, buzlu', 32.00, 'tropical_chillers', 5),
('menu-tc2', 'Coconut Cooler', 'Hindistan cevizi serinletici', 28.00, 'tropical_chillers', 4),
('menu-tc3', 'Pineapple Chill', 'Ananas serinletici, nane ile', 30.00, 'tropical_chillers', 4);

-- Milk Shake
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-ms1', 'Chocolate Milkshake', 'Çikolatalı milkshake, krema ile', 25.00, 'milk_shake', 4),
('menu-ms2', 'Vanilla Milkshake', 'Vanilya milkshake, klasik', 23.00, 'milk_shake', 4),
('menu-ms3', 'Strawberry Milkshake', 'Çilek milkshake, taze meyveli', 26.00, 'milk_shake', 4);
