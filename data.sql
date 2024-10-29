USE capsulify;

-- Insert sample subscription plans
INSERT INTO subscription_plan (subscription_type, price) VALUES
('Basic', 7.99),
('Pro', 19.99),
('Premium', 49.99);

-- Insert sample clothing types
INSERT INTO clothing_type (clothing_type_id, type_name) VALUES
(1, 'bottom'),
(2, 'top'),
(3, 'shoes'),
(4, 'bag'),
(5, 'layer'),
(6, 'accessory');

-- Insert sample users
INSERT INTO user (subscription_type, name, email, password, date_joined) VALUES
('Basic', 'Alice Smith', 'alice@example.com', 'password123', '2024-01-01'),
('Pro', 'Bob Johnson', 'bob@example.com', 'password123', '2024-01-15');

-- Insert sample clothing items (with corrected IDs)
INSERT INTO clothing_item (item_id, clothing_type, clothing_name, clothing_color, style_category, season) VALUES
(1, 1, 'Black Formal Pants', 'Black', 'Formal', 'All Year'),
(2, 1, 'Denim Jeans', 'Blue', 'Casual', 'All Year'),
(3, 1, 'Blue Skirt', 'Blue', 'Casual', 'All Year'),
(4, 2, 'Black Collared Shirt', 'Black', 'Formal', 'All Year'),
(5, 2, 'White Top', 'White', 'Casual', 'All Year'),
(6, 2, 'Accent-Colored Blouse', 'Red', 'Casual', 'All Year'),
(7, 3, 'Black Pumps', 'Black', 'Formal', 'All Year'),
(8, 3, 'Beige Heels', 'Beige', 'Formal', 'All Year'),
(9, 3, 'Sneakers', 'Blue', 'Sport', 'All Year'),
(10, 4, 'Black Tote', 'Black', 'Formal', 'All Year'),
(11, 4, 'Beige Tote', 'Beige', 'Casual', 'All Year'),
(12, 4, 'Black Clutch', 'Black', 'Formal', 'All Year'),
(13, 5, 'Black Cardigan', 'Black', 'Formal', 'Winter'),
(14, 5, 'Black Blazer', 'Black', 'Formal', 'Winter'),
(15, 5, 'Parka', 'Green', 'Casual', 'Winter'),
(16, 6, 'Earrings', 'Gold', 'Accessory', 'All Year'),
(17, 6, 'Bangles', 'Silver', 'Accessory', 'All Year'),
(18, 6, 'Scarves', 'Red', 'Accessory', 'All Year');

-- Insert sample user-defined tags
INSERT INTO user_tags (user_id, tag_name) VALUES
(1, 'Date'),
(1, 'Office'),
(1, 'Weekend'),
(1, 'Party'),
(1, 'Business Meeting'),
(2, 'Casual Friday'),
(2, 'Brunch');

-- Example of associating tags with clothing items
INSERT INTO clothing_item_tags (clothing_item_id, tag_id) VALUES
(1, 1), -- Black Formal Pants tagged as 'Date'
(2, 2), -- Denim Jeans tagged as 'Office'
(3, 3), -- Blue Skirt tagged as 'Weekend'
(4, 4), -- Black Collared Shirt tagged as 'Party'
(5, 5); -- White Top tagged as 'Business Meeting'

-- Insert sample combinations (with corrected IDs)
INSERT INTO combination (user_id, combo_num, bottom_id, top_id, bag_id, layer_id, shoes_id, favorite) VALUES
(1, 1, 1, 4, 10, 13, 7, TRUE),  -- Combo with Black Formal Pants, Black Collared Shirt, Black Tote, Black Cardigan, Black Pumps
(1, 2, 2, 5, 12, 14, 9, FALSE),  -- Combo with Denim Jeans, White Top, Black Clutch, Black Blazer, Sneakers
(2, 1, 3, 4, 11, NULL, 8, FALSE); -- Combo with Blue Skirt, Black Collared Shirt, Beige Tote, NULL, Beige Heels

-- Query to join clothing_item with combination table to show clothing_name values rather than IDs
SELECT 
    c.combo_id,
    c.user_id,
    c.combo_num,
    b.clothing_name AS bottom,
    t.clothing_name AS top,
    ba.clothing_name AS bag,
    l.clothing_name AS layer,
    s.clothing_name AS shoes,
    c.favorite
FROM 
    combination c
LEFT JOIN 
    clothing_item b ON c.bottom_id = b.item_id
LEFT JOIN 
    clothing_item t ON c.top_id = t.item_id
LEFT JOIN 
    clothing_item ba ON c.bag_id = ba.item_id
LEFT JOIN 
    clothing_item l ON c.layer_id = l.item_id
LEFT JOIN 
    clothing_item s ON c.shoes_id = s.item_id;

-- CREATE FAVORITE TABLE TO STORE FAVORITE COMBOS FROM THE CLIENT-SIDE
CREATE TABLE favorite (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    bottom_id INT UNSIGNED NOT NULL,
    top_id INT UNSIGNED NOT NULL,
    bag_id INT UNSIGNED NOT NULL,
    layer_id INT UNSIGNED,  -- Optional, so no NOT NULL constraint
    accessory_id INT UNSIGNED,  -- Optional, so no NOT NULL constraint
    user_id INT UNSIGNED,  -- Optional: Use if you plan to associate favorites with specific users
    FOREIGN KEY (bottom_id) REFERENCES clothing_item(item_id),
    FOREIGN KEY (top_id) REFERENCES clothing_item(item_id),
    FOREIGN KEY (bag_id) REFERENCES clothing_item(item_id),
    FOREIGN KEY (layer_id) REFERENCES clothing_item(item_id),
    FOREIGN KEY (accessory_id) REFERENCES clothing_item(item_id)
);

