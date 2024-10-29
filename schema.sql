-- SQL Schema for Capsulify
CREATE DATABASE capsulify;

USE capsulify;

-- Create subscription_plan table
CREATE TABLE subscription_plan (
    subscription_type VARCHAR(45) PRIMARY KEY,
    price DECIMAL(6, 2) NOT NULL
);

-- Create user table
CREATE TABLE user (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subscription_type VARCHAR(45),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_joined DATE NOT NULL,
    churned_date DATE,
    FOREIGN KEY (subscription_type) REFERENCES subscription_plan(subscription_type)
);

-- Create clothing_type table
CREATE TABLE clothing_type (
    clothing_type_id INT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL
);

-- Create clothing_item table
CREATE TABLE clothing_item (
    item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    clothing_type INT,
    clothing_name VARCHAR(50) NOT NULL,
    clothing_color VARCHAR(50) NOT NULL,
    style_category VARCHAR(50),
    season VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (clothing_type) REFERENCES clothing_type(clothing_type_id)
);

-- Create combination table
CREATE TABLE combination (
    combo_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    combo_num INT UNSIGNED NOT NULL,
    bottom_id INT UNSIGNED,
    top_id INT UNSIGNED,
    bag_id INT UNSIGNED,
    layer_id INT UNSIGNED,
    shoes_id INT UNSIGNED,
    favorite BOOLEAN NOT NULL DEFAULT FALSE,
    item_id INT UNSIGNED,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (bottom_id) REFERENCES clothing_item(item_id),
    FOREIGN KEY (top_id) REFERENCES clothing_item(item_id),
    FOREIGN KEY (bag_id) REFERENCES clothing_item(item_id),
    FOREIGN KEY (layer_id) REFERENCES clothing_item(item_id),
    FOREIGN KEY (shoes_id) REFERENCES clothing_item(item_id)
);

-- Create user_tags table for user-defined tags
CREATE TABLE user_tags (
    tag_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    tag_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- Create clothing_item_tags table for associating clothing items with tags
CREATE TABLE clothing_item_tags (
    clothing_item_id INT UNSIGNED,
    tag_id INT UNSIGNED,
    PRIMARY KEY (clothing_item_id, tag_id),
    FOREIGN KEY (clothing_item_id) REFERENCES clothing_item(item_id),
    FOREIGN KEY (tag_id) REFERENCES user_tags(tag_id)
);

-- Create clothing types
INSERT INTO clothing_type (clothing_type_id, type_name) VALUES
(1, 'bottom'),
(2, 'top'),
(3, 'shoes'),
(4, 'bag'),
(5, 'layer'),
(6, 'accessory');