-- ==========================================================
-- LARO SPORTS™ Webstore Database Schema (XAMPP / MySQL)
-- Import this file in phpMyAdmin or let the app auto-initialize
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `laro_sports_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `laro_sports_db`;

-- ----------------------------------------------------------
-- 1. Users Table (Roles: 'customer', 'admin')
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  `birthdate` VARCHAR(20) DEFAULT '',
  `age` INT NULL,
  `gender` VARCHAR(40) DEFAULT '',
  `address` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 2. Products Inventory Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products_inventory` (
  `product_id` VARCHAR(100) PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `handle` VARCHAR(150) NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `image_url` VARCHAR(255) DEFAULT '',
  `description` TEXT NULL,
  `variants_json` LONGTEXT NOT NULL,
  `is_custom` TINYINT(1) DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 3. Orders Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(32) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `customer_name` VARCHAR(120) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(40) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `province` VARCHAR(100) NOT NULL DEFAULT '',
  `postal_code` VARCHAR(20) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'COD',
  `notes` TEXT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 4. Order Items Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` VARCHAR(100) NOT NULL,
  `product_title` VARCHAR(150) NOT NULL,
  `variant_title` VARCHAR(80) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `image_url` VARCHAR(255) DEFAULT '',
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 5. Default Seed Accounts
-- Admin:    admin@larosports.com    / admin123
-- Customer: customer@larosports.com / customer123
-- ----------------------------------------------------------
INSERT IGNORE INTO `users` (`name`, `email`, `password_hash`, `role`, `birthdate`, `age`, `gender`, `address`) VALUES
  ('LARO SPORTS Admin', 'admin@larosports.com', 'larosalt2025:58518420f55c65cfbd4acbf93dbecdc3c904d433dc5c36ee75faa6f3e6792b19b04901c987ed7716c972d31330aedbf4403dbf058f8550b2030a2b0037a07053', 'admin', '2000-01-01', 26, 'Male', 'LARO SPORTS HQ, Metro Manila'),
  ('Demo Customer', 'customer@larosports.com', 'larosalt2025:160678ec17b3984817dd09c1336f36565b01dbc6002cbd5029da0e4a4c90bfb05def29aea641fce5851743818cdc6bdc848288e05fbf01e8a228051b3d9b0638', 'customer', '2002-05-15', 24, 'Male', '142 Katipunan Ave, Quezon City, Metro Manila');
