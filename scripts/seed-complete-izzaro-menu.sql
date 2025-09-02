-- Complete IZZARO Menu Items with All Beverages
-- All items priced at 100 TL as requested

-- Update existing items to 100 TL
UPDATE menu_items SET price = 100.00 WHERE 1=1;

-- CLASSIC COFFEE
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Americano', 'Klasik Amerikan kahvesi', 100.00, 'Classic Coffee', 1, 5, NOW(), NOW()),
('Latte', 'Espresso ve süt köpüğü ile hazırlanan latte', 100.00, 'Classic Coffee', 1, 8, NOW(), NOW()),
('Espresso', 'Yoğun İtalyan kahvesi', 100.00, 'Classic Coffee', 1, 3, NOW(), NOW()),
('Doppio', 'Çift espresso', 100.00, 'Classic Coffee', 1, 4, NOW(), NOW()),
('Lungo', 'Uzun çekilmiş espresso', 100.00, 'Classic Coffee', 1, 5, NOW(), NOW()),
('Macchiato', 'Espresso üzerine süt köpüğü', 100.00, 'Classic Coffee', 1, 6, NOW(), NOW()),
('Mocha', 'Espresso, çikolata ve süt karışımı', 100.00, 'Classic Coffee', 1, 10, NOW(), NOW()),
('Cappuccino', 'Espresso, sıcak süt ve süt köpüğü', 100.00, 'Classic Coffee', 1, 8, NOW(), NOW()),
('Lotus Latte', 'Lotus bisküvili özel latte', 100.00, 'Classic Coffee', 1, 10, NOW(), NOW()),
('Cortado', 'Espresso ve sıcak süt karışımı', 100.00, 'Classic Coffee', 1, 7, NOW(), NOW()),
('Flat White', 'Güçlü espresso ve mikroköpük süt', 100.00, 'Classic Coffee', 1, 8, NOW(), NOW()),
('Spanish Latte', 'Yoğunlaştırılmış süt ile İspanyol usulü latte', 100.00, 'Classic Coffee', 1, 10, NOW(), NOW()),
('White Mocha', 'Beyaz çikolatalı mocha', 100.00, 'Classic Coffee', 1, 10, NOW(), NOW()),
('Chai Tea', 'Baharatlı çay latte', 100.00, 'Classic Coffee', 1, 8, NOW(), NOW()),
('Turkish Coffee', 'Geleneksel Türk kahvesi', 100.00, 'Classic Coffee', 1, 15, NOW(), NOW()),
('Nescafe', 'Hazır kahve', 100.00, 'Classic Coffee', 1, 3, NOW(), NOW()),
('Bitki Çayları', 'Çeşitli bitki çayları', 100.00, 'Classic Coffee', 1, 5, NOW(), NOW()),
('Klasik Çay', 'Geleneksel çay', 100.00, 'Classic Coffee', 1, 5, NOW(), NOW());

-- COFFEE SPECIALS
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Vanilla Latte', 'Vanilya aromalı latte', 100.00, 'Coffee Specials', 1, 10, NOW(), NOW()),
('Caramel Latte', 'Karamel aromalı latte', 100.00, 'Coffee Specials', 1, 10, NOW(), NOW()),
('Coconut Latte', 'Hindistan cevizi aromalı latte', 100.00, 'Coffee Specials', 1, 10, NOW(), NOW()),
('Toffinut Latte', 'Toffinut aromalı latte', 100.00, 'Coffee Specials', 1, 10, NOW(), NOW()),
('Hazelnut Latte', 'Fındık aromalı latte', 100.00, 'Coffee Specials', 1, 10, NOW(), NOW());

-- HOT CHOCOLATE
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Classic Chocolate', 'Klasik sıcak çikolata', 100.00, 'Hot Chocolate', 1, 8, NOW(), NOW()),
('White Chocolate', 'Beyaz çikolata', 100.00, 'Hot Chocolate', 1, 8, NOW(), NOW()),
('Oreo Chocolate', 'Oreo bisküvili çikolata', 100.00, 'Hot Chocolate', 1, 10, NOW(), NOW()),
('Hazelnut Chocolate', 'Fındıklı sıcak çikolata', 100.00, 'Hot Chocolate', 1, 10, NOW(), NOW()),
('Salep', 'Geleneksel salep', 100.00, 'Hot Chocolate', 1, 12, NOW(), NOW());

-- ICE LATTE
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Ice Americano', 'Buzlu Amerikan kahvesi', 100.00, 'Ice Latte', 1, 5, NOW(), NOW()),
('Ice Latte', 'Buzlu latte', 100.00, 'Ice Latte', 1, 8, NOW(), NOW()),
('Ice Vanilla', 'Buzlu vanilya latte', 100.00, 'Ice Latte', 1, 10, NOW(), NOW()),
('Ice Spanish Latte', 'Buzlu İspanyol latte', 100.00, 'Ice Latte', 1, 10, NOW(), NOW()),
('Ice Coconut', 'Buzlu hindistan cevizi latte', 100.00, 'Ice Latte', 1, 10, NOW(), NOW()),
('Ice Hazelnut', 'Buzlu fındık latte', 100.00, 'Ice Latte', 1, 10, NOW(), NOW()),
('Ice Oreo', 'Buzlu Oreo latte', 100.00, 'Ice Latte', 1, 10, NOW(), NOW()),
('Ice Matcha Latte', 'Buzlu matcha latte', 100.00, 'Ice Latte', 1, 10, NOW(), NOW()),
('Ice Frappe', 'Buzlu frappe', 100.00, 'Ice Latte', 1, 8, NOW(), NOW());

-- COFFEE CHILLER
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Espresso Voltage', 'Güçlü espresso chiller', 100.00, 'Coffee Chiller', 1, 10, NOW(), NOW()),
('Caramel Voltage', 'Karamel chiller', 100.00, 'Coffee Chiller', 1, 10, NOW(), NOW()),
('Vanilla Voltage', 'Vanilya chiller', 100.00, 'Coffee Chiller', 1, 10, NOW(), NOW()),
('Hazelnut Voltage', 'Fındık chiller', 100.00, 'Coffee Chiller', 1, 10, NOW(), NOW()),
('Oreo Voltage', 'Oreo chiller', 100.00, 'Coffee Chiller', 1, 10, NOW(), NOW()),
('Toffinut Voltage', 'Toffinut chiller', 100.00, 'Coffee Chiller', 1, 10, NOW(), NOW()),
('Chai Tea Voltage', 'Chai tea chiller', 100.00, 'Coffee Chiller', 1, 10, NOW(), NOW()),
('Spanish Voltage', 'İspanyol chiller', 100.00, 'Coffee Chiller', 1, 10, NOW(), NOW());

-- SMOOTHIE FRUIT SPILLS
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Protein Smoothie', 'Protein içerikli smoothie', 100.00, 'Smoothie Fruit Spills', 1, 8, NOW(), NOW()),
('Strawberry Smoothie', 'Çilek smoothie', 100.00, 'Smoothie Fruit Spills', 1, 8, NOW(), NOW()),
('Banana Smoothie', 'Muz smoothie', 100.00, 'Smoothie Fruit Spills', 1, 8, NOW(), NOW()),
('Passion Fruit Smoothie', 'Çarkıfelek meyvesi smoothie', 100.00, 'Smoothie Fruit Spills', 1, 8, NOW(), NOW()),
('Green Detox Smoothie', 'Yeşil detoks smoothie', 100.00, 'Smoothie Fruit Spills', 1, 10, NOW(), NOW()),
('Pineapple Smoothie', 'Ananas smoothie', 100.00, 'Smoothie Fruit Spills', 1, 8, NOW(), NOW());

-- ITALIAN SODA
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Apple Italian Soda', 'Elma aromalı İtalyan sodası', 100.00, 'Italian Soda', 1, 5, NOW(), NOW()),
('Mango Italian Soda', 'Mango aromalı İtalyan sodası', 100.00, 'Italian Soda', 1, 5, NOW(), NOW()),
('Water Melon Italian Soda', 'Karpuz aromalı İtalyan sodası', 100.00, 'Italian Soda', 1, 5, NOW(), NOW()),
('Blue Lime Italian Soda', 'Mavi limon aromalı İtalyan sodası', 100.00, 'Italian Soda', 1, 5, NOW(), NOW()),
('Strawberry Italian Soda', 'Çilek aromalı İtalyan sodası', 100.00, 'Italian Soda', 1, 5, NOW(), NOW()),
('Melon Italian Soda', 'Kavun aromalı İtalyan sodası', 100.00, 'Italian Soda', 1, 5, NOW(), NOW()),
('Lemon Lavanta Italian Soda', 'Limon lavanta aromalı İtalyan sodası', 100.00, 'Italian Soda', 1, 5, NOW(), NOW()),
('Passion Chill Italian Soda', 'Çarkıfelek aromalı İtalyan sodası', 100.00, 'Italian Soda', 1, 5, NOW(), NOW());

-- TROPICAL CHILLERS
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Mango Chillers', 'Mango chiller', 100.00, 'Tropical Chillers', 1, 8, NOW(), NOW()),
('Apple Chillers', 'Elma chiller', 100.00, 'Tropical Chillers', 1, 8, NOW(), NOW()),
('Water Melon Chillers', 'Karpuz chiller', 100.00, 'Tropical Chillers', 1, 8, NOW(), NOW()),
('Strawberry Chillers', 'Çilek chiller', 100.00, 'Tropical Chillers', 1, 8, NOW(), NOW()),
('Berry Chillers', 'Böğürtlen chiller', 100.00, 'Tropical Chillers', 1, 8, NOW(), NOW()),
('Passion Chillers', 'Çarkıfelek chiller', 100.00, 'Tropical Chillers', 1, 8, NOW(), NOW());

-- MILK SHAKE
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Chocolate Milkshake', 'Çikolatalı milkshake', 100.00, 'Milk Shake', 1, 10, NOW(), NOW()),
('White Chocolate Milkshake', 'Beyaz çikolatalı milkshake', 100.00, 'Milk Shake', 1, 10, NOW(), NOW()),
('Oreo Milkshake', 'Oreo milkshake', 100.00, 'Milk Shake', 1, 10, NOW(), NOW()),
('Strawberry Milkshake', 'Çilek milkshake', 100.00, 'Milk Shake', 1, 10, NOW(), NOW()),
('Vanilla Milkshake', 'Vanilya milkshake', 100.00, 'Milk Shake', 1, 10, NOW(), NOW()),
('Cici Shake', 'Özel Cici Shake', 100.00, 'Milk Shake', 1, 12, NOW(), NOW());

-- INTERNATIONAL KOKTEYL
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Mojito', 'Klasik mojito kokteyli', 100.00, 'International Kokteyl', 1, 8, NOW(), NOW()),
('Margarita', 'Klasik margarita kokteyli', 100.00, 'International Kokteyl', 1, 8, NOW(), NOW()),
('Negroni', 'İtalyan negroni kokteyli', 100.00, 'International Kokteyl', 1, 5, NOW(), NOW()),
('Apoel Spritz', 'Apoel spritz kokteyli', 100.00, 'International Kokteyl', 1, 5, NOW(), NOW()),
('Jack Safari', 'Jack safari kokteyli', 100.00, 'International Kokteyl', 1, 8, NOW(), NOW()),
('Sex on the Beach', 'Sex on the beach kokteyli', 100.00, 'International Kokteyl', 1, 8, NOW(), NOW()),
('Long Island', 'Long island iced tea', 100.00, 'International Kokteyl', 1, 10, NOW(), NOW()),
('Whiskey Sour', 'Whiskey sour kokteyli', 100.00, 'International Kokteyl', 1, 8, NOW(), NOW()),
('Lynchburg Lemonade', 'Lynchburg lemonade kokteyli', 100.00, 'International Kokteyl', 1, 8, NOW(), NOW()),
('Archer Spite', 'Archer spite kokteyli', 100.00, 'International Kokteyl', 1, 8, NOW(), NOW()),
('Malibu Ana', 'Malibu ana kokteyli', 100.00, 'International Kokteyl', 1, 8, NOW(), NOW()),
('Tiki Mai Tai', 'Tiki mai tai kokteyli', 100.00, 'International Kokteyl', 1, 10, NOW(), NOW());

-- SIGNATURA IZZARO
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Izzaro Passion Fruit', 'IZZARO özel çarkıfelek kokteyli', 100.00, 'Signatura Izzaro', 1, 12, NOW(), NOW()),
('Izzaro Ocean Blue', 'IZZARO özel okyanus mavisi kokteyli', 100.00, 'Signatura Izzaro', 1, 12, NOW(), NOW()),
('Green Mint Izzaro', 'IZZARO özel yeşil nane kokteyli', 100.00, 'Signatura Izzaro', 1, 12, NOW(), NOW()),
('Double Stream Izzaro', 'IZZARO özel çifte akım kokteyli', 100.00, 'Signatura Izzaro', 1, 12, NOW(), NOW()),
('Melodi Izzaro', 'IZZARO özel melodi kokteyli', 100.00, 'Signatura Izzaro', 1, 12, NOW(), NOW()),
('Strawberry Fields Izzaro', 'IZZARO özel çilek tarlaları kokteyli', 100.00, 'Signatura Izzaro', 1, 12, NOW(), NOW()),
('Berry Basil Izzaro', 'IZZARO özel böğürtlen fesleğen kokteyli', 100.00, 'Signatura Izzaro', 1, 12, NOW(), NOW()),
('Explosion Izzaro', 'IZZARO özel patlama kokteyli', 100.00, 'Signatura Izzaro', 1, 12, NOW(), NOW()),
('White Lady', 'Beyaz hanım kokteyli', 100.00, 'Signatura Izzaro', 1, 10, NOW(), NOW()),
('Golden Man', 'Altın adam kokteyli', 100.00, 'Signatura Izzaro', 1, 10, NOW(), NOW());

-- RUM / KONYAK / GIN
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Bacardi', 'Bacardi rom', 100.00, 'Rum/Konyak Gin', 1, 2, NOW(), NOW()),
('Hennessy V.S.O.P', 'Hennessy konyak', 100.00, 'Rum/Konyak Gin', 1, 2, NOW(), NOW()),
('Martell XO', 'Martell XO konyak', 100.00, 'Rum/Konyak Gin', 1, 2, NOW(), NOW()),
('Smirnoff', 'Smirnoff vodka', 100.00, 'Rum/Konyak Gin', 1, 2, NOW(), NOW()),
('Kettel One', 'Kettel One vodka', 100.00, 'Rum/Konyak Gin', 1, 2, NOW(), NOW()),
('Grey Goose', 'Grey Goose vodka', 100.00, 'Rum/Konyak Gin', 1, 2, NOW(), NOW()),
('Hendricks', 'Hendricks gin', 100.00, 'Rum/Konyak Gin', 1, 2, NOW(), NOW());

-- WHISKEY
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Gentleman Jack', 'Gentleman Jack whiskey', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Red Label', 'Johnnie Walker Red Label', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Black Label', 'Johnnie Walker Black Label', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Chivas Regal 12', 'Chivas Regal 12 yıl', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Chivas Regal 25', 'Chivas Regal 25 yıl', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Jack Daniels', 'Jack Daniels whiskey', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Monkey Shoulder', 'Monkey Shoulder whiskey', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Jameson', 'Jameson Irish whiskey', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Glenfiddich 12', 'Glenfiddich 12 yıl', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Glenfiddich 18', 'Glenfiddich 18 yıl', 100.00, 'Whiskey', 1, 2, NOW(), NOW()),
('Balmore', 'Balmore whiskey', 100.00, 'Whiskey', 1, 2, NOW(), NOW());

-- FRESHLY SQUEEZED JUICES
INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at) VALUES
('Orange Juice', 'Taze sıkılmış portakal suyu', 100.00, 'Freshly Squeezed Juces', 1, 5, NOW(), NOW()),
('Apple Juice', 'Taze sıkılmış elma suyu', 100.00, 'Freshly Squeezed Juces', 1, 5, NOW(), NOW()),
('Carrot Juice', 'Taze sıkılmış havuç suyu', 100.00, 'Freshly Squeezed Juces', 1, 5, NOW(), NOW()),
('Mix Juice', 'Karışık meyve suyu', 100.00, 'Freshly Squeezed Juces', 1, 8, NOW(), NOW()),
('Fresh Banana Milk', 'Orijinal Adana muzlu sütü', 100.00, 'Freshly Squeezed Juces', 1, 5, NOW(), NOW());
