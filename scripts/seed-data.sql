-- Seed data for Restaurant POS system

-- Insert sample users
INSERT INTO users (id, name, username, password, role, is_active) VALUES
('admin-1', 'Sistem Yöneticisi', 'admin', 'admin123', 'admin', TRUE),
('user-1', 'Ahmet Garson', 'ahmet', '123456', 'garson', TRUE),
('user-2', 'Ayşe Kasiyer', 'ayse', '123456', 'kasiyer', TRUE),
('user-3', 'Mehmet Müdür', 'mehmet', '123456', 'mudur', TRUE),
('user-4', 'Fatma Garson', 'fatma', '123456', 'garson', TRUE),
('user-5', 'Ali Kasiyer', 'ali', '123456', 'kasiyer', TRUE);

-- Insert sample tables
INSERT INTO restaurant_tables (id, number, capacity, status) VALUES
('table-1', 'M1', 4, 'musait'),
('table-2', 'M2', 2, 'musait'),
('table-3', 'M3', 6, 'dolu'),
('table-4', 'M4', 4, 'musait'),
('table-5', 'M5', 8, 'rezerve'),
('table-6', 'M6', 2, 'temizlik'),
('table-7', 'M7', 4, 'musait'),
('table-8', 'M8', 6, 'musait'),
('table-9', 'M9', 2, 'musait'),
('table-10', 'M10', 10, 'musait');

-- Insert sample menu items
-- Başlangıçlar
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-1', 'AMERICANO', 'Taze marul, parmesan peyniri ve kruton ile', 24.99, 'starters', 10),
('menu-2', 'LATTE', 'Acılı buffalo soslu kanatlar, mavi peynir sosu ile', 29.99, 'starters', 15),
('menu-3', 'ESPRESSO', 'Çıtır paneli mozzarella, marinara sosu ile', 19.99, 'starters', 12),
('menu-4', 'CAPPUCHINO', 'Kızarmış ekmek üzerinde taze domates ve fesleğen', 17.99, 'starters', 8),
('menu-5', 'FRENCH COFFEE LATTE', 'Çıtır soğan halkaları, ranch sosu ile', 16.99, 'starters', 10),
('menu-6', 'LOTUS LATTE', 'Çıtır soğan halkaları, ranch sosu ile', 16.99, 'starters', 10),
('menu-7', 'CORTADO', 'Çıtır soğan halkaları, ranch sosu ile', 16.99, 'starters', 10),
('menu-8', 'FLAT WHITE', 'Çıtır soğan halkaları, ranch sosu ile', 16.99, 'starters', 10),
('menu-9', 'CLASSIC CHOCOLATE', 'Çıtır soğan halkaları, ranch sosu ile', 16.99, 'starters', 10),
('menu-10', 'TURKISH COFFEE', 'Çıtır soğan halkaları, ranch sosu ile', 16.99, 'starters', 10);


-- Ana Yemekler
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-11', 'ICE AMERICANO', 'Taze Atlantik somonu, limonlu tereyağı ile', 49.99, 'mains', 20),
('menu-12', 'ICE LATTE', '300gr prime ribeye, istediğiniz pişirme derecesinde', 65.99, 'mains', 25),
('menu-13', 'ICE VANILLA', 'Paneli tavuk göğsü, marinara ve mozzarella ile', 39.99, 'mains', 18),
('menu-14', 'ICE CARAMEL', 'Kremalı makarna, pastırma ve parmesan ile', 33.99, 'mains', 15),
('menu-15', 'ICE COCONUT', 'Bira hamuruyla kaplı morina, çıtır patates ile', 37.99, 'mains', 20),
('menu-16', 'ICE OREO', 'Bira hamuruyla kaplı morina, çıtır patates ile', 37.99, 'mains', 20),
('menu-17', 'ICE FRAPPE', 'Bira hamuruyla kaplı morina, çıtır patates ile', 37.99, 'mains', 20),
('menu-18', 'CARAMEL VOLTAGE', 'Bira hamuruyla kaplı morina, çıtır patates ile', 37.99, 'mains', 20),
('menu-19', 'COCONUT VOLTAGE', 'Bira hamuruyla kaplı morina, çıtır patates ile', 37.99, 'mains', 20),
('menu-20', 'TOFFINUT VOLTAGE', 'Bira hamuruyla kaplı morina, çıtır patates ile', 37.99, 'mains', 20);

-- Tatlılar
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-21', 'BACARDI', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5),
('menu-22', 'SMIRNOFF', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5),
('menu-23', 'HENDRICKS', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5),
('menu-24', 'TANGUERAY', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5),
('menu-25', 'PINK GIN', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5),
('menu-26', 'DALMORE', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5),
('menu-27', 'MOJITO', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5),
('menu-28', 'SEX ON THE BEACH', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5),
('menu-29', 'LYNCBURG LEMONATE', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5),
('menu-30', 'MELODI IZZARO', 'Zengin çikolatalı pasta, vanilyalı dondurma ile', 17.99, 'desserts', 5);


-- İçecekler
INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES
('menu-31', 'ITALIAN SODA APPLE', 'Klasik gazlı içecek', 5.99, 'drinks', 1),
('menu-32', 'MANGO CHILLERS', 'Klasik gazlı içecek', 5.99, 'drinks', 1),
('menu-33', 'PROTEIN SMOOTHIE', 'Klasik gazlı içecek', 5.99, 'drinks', 1),
('menu-34', 'MILKSHAKE CHOCOLATE', 'Klasik gazlı içecek', 5.99, 'drinks', 1),
('menu-35', 'ORANGE JUICE', 'Klasik gazlı içecek', 5.99, 'drinks', 1),
('menu-36', 'MILKSHAKE VANILLA', 'Klasik gazlı içecek', 5.99, 'drinks', 1),
('menu-37', 'MILKSHAKE LOTUS', 'Klasik gazlı içecek', 5.99, 'drinks', 1),
('menu-38', 'MIX JUICE', 'Klasik gazlı içecek', 5.99, 'drinks', 1),
('menu-39', 'ITALIAN SODA MELON', 'Klasik gazlı içecek', 5.99, 'drinks', 1),
('menu-40', 'ITALIAN SODA STRAWBERRY', 'Klasik gazlı içecek', 5.99, 'drinks', 1);


-- Insert sample orders
INSERT INTO orders (id, table_id, user_id, status, total) VALUES
('order-1', 'table-3', 'user-1', 'hazirlaniyor', 91.97);

-- Insert sample order items
INSERT INTO order_items (id, order_id, menu_item_id, quantity, price) VALUES
('item-1', 'order-1', 'menu-2', 1, 29.99),
('item-2', 'order-1', 'menu-7', 1, 65.99),
('item-3', 'order-1', 'menu-19', 2, 17.99);

-- Insert sample daily sales
INSERT INTO daily_sales (id, date, total_sales, total_orders, average_order_value) VALUES
('sales-1', CURDATE(), 450.75, 12, 37.56),
('sales-2', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 523.40, 15, 34.89),
('sales-3', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 389.20, 10, 38.92);
