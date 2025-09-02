-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, available, preparation_time) VALUES
-- Başlangıçlar (Starters)
('Mercimek Çorbası', 'Geleneksel Türk mercimek çorbası', 25.00, 'starters', TRUE, 10),
('Domates Çorbası', 'Taze domates ile hazırlanan çorba', 22.00, 'starters', TRUE, 10),
('Çoban Salatası', 'Domates, salatalık, soğan, maydanoz', 35.00, 'starters', TRUE, 5),
('Mevsim Salatası', 'Taze yeşillikler ve mevsim sebzeleri', 30.00, 'starters', TRUE, 5),
('Humus', 'Nohut ezmesi, tahin, zeytinyağı', 28.00, 'starters', TRUE, 5),
('Cacık', 'Yoğurt, salatalık, sarımsak, nane', 20.00, 'starters', TRUE, 5),

-- Ana Yemekler (Mains)
('Adana Kebap', 'Acılı kıyma kebabı, pilav, salata', 85.00, 'mains', TRUE, 25),
('Urfa Kebap', 'Acısız kıyma kebabı, pilav, salata', 80.00, 'mains', TRUE, 25),
('Kuzu Şiş', 'Marine edilmiş kuzu eti, pilav, salata', 95.00, 'mains', TRUE, 30),
('Tavuk Şiş', 'Marine edilmiş tavuk göğsü, pilav, salata', 70.00, 'mains', TRUE, 20),
('Karışık Izgara', 'Adana, urfa, tavuk şiş, pilav, salata', 120.00, 'mains', TRUE, 35),
('Döner Kebap', 'Et döner, pilav, salata', 65.00, 'mains', TRUE, 15),
('Tavuk Döner', 'Tavuk döner, pilav, salata', 60.00, 'mains', TRUE, 15),
('Köfte', 'Ev yapımı köfte, pilav, salata', 55.00, 'mains', TRUE, 20),
('Balık Izgara', 'Günün taze balığı, pilav, salata', 90.00, 'mains', TRUE, 25),
('Vegetaryen Güveç', 'Sebze güveci, pilav', 45.00, 'mains', TRUE, 30),

-- Tatlılar (Desserts)
('Baklava', 'Geleneksel fıstıklı baklava (4 adet)', 40.00, 'desserts', TRUE, 5),
('Künefe', 'Sıcak künefe, kaymak', 45.00, 'desserts', TRUE, 15),
('Sütlaç', 'Ev yapımı sütlaç', 25.00, 'desserts', TRUE, 5),
('Kazandibi', 'Geleneksel kazandibi', 30.00, 'desserts', TRUE, 5),
('Muhallebi', 'Vanilyalı muhallebi', 22.00, 'desserts', TRUE, 5),
('Dondurma', 'Vanilyalı dondurma (3 top)', 20.00, 'desserts', TRUE, 2),
('Meyveli Tart', 'Mevsim meyveli tart', 35.00, 'desserts', TRUE, 5),

-- İçecekler (Drinks)
('Çay', 'Geleneksel Türk çayı', 8.00, 'drinks', TRUE, 3),
('Türk Kahvesi', 'Geleneksel Türk kahvesi', 15.00, 'drinks', TRUE, 10),
('Americano', 'Espresso + sıcak su', 18.00, 'drinks', TRUE, 5),
('Cappuccino', 'Espresso + süt köpüğü', 22.00, 'drinks', TRUE, 5),
('Latte', 'Espresso + süt', 20.00, 'drinks', TRUE, 5),
('Su', 'İçme suyu (500ml)', 5.00, 'drinks', TRUE, 1),
('Kola', 'Coca Cola (330ml)', 12.00, 'drinks', TRUE, 1),
('Fanta', 'Fanta (330ml)', 12.00, 'drinks', TRUE, 1),
('Sprite', 'Sprite (330ml)', 12.00, 'drinks', TRUE, 1),
('Ayran', 'Ev yapımı ayran', 10.00, 'drinks', TRUE, 2),
('Taze Sıkılmış Portakal Suyu', 'Taze portakal suyu', 25.00, 'drinks', TRUE, 5),
('Limonata', 'Ev yapımı limonata', 18.00, 'drinks', TRUE, 5);
