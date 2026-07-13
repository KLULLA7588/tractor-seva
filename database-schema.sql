-- Tractor Seva - Database Schema
-- MySQL 8.0+
-- Run: mysql -u root -p < database-schema.sql

CREATE DATABASE IF NOT EXISTS tractor_seva
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tractor_seva;

-- Table 1: Harvesters
CREATE TABLE IF NOT EXISTS harvesters (
  id BINARY(16) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Table 2: Sections (Main Sections + Subsections via parent_id)
CREATE TABLE IF NOT EXISTS sections (
  id BINARY(16) PRIMARY KEY,
  harvester_id BINARY(16) NOT NULL,
  parent_id BINARY(16),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (harvester_id) REFERENCES harvesters(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES sections(id) ON DELETE CASCADE,
  INDEX idx_harvester_id (harvester_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Table 3: Images (Diagrams for sections/subsections)
CREATE TABLE IF NOT EXISTS images (
  id BINARY(16) PRIMARY KEY,
  section_id BINARY(16) NOT NULL,
  image_path LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  INDEX idx_section_id (section_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Table 4: Parts
CREATE TABLE IF NOT EXISTS parts (
  id BINARY(16) PRIMARY KEY,
  serial_no VARCHAR(255),
  part_no VARCHAR(255) NOT NULL,
  kubota_part_no VARCHAR(255),
  description TEXT,
  quantity INT DEFAULT 1,
  fm_code VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_part_no (part_no),
  INDEX idx_serial_no (serial_no),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Table 5: Image Coordinates (Hotspots on diagrams)
CREATE TABLE IF NOT EXISTS image_coordinates (
  id BINARY(16) PRIMARY KEY,
  part_id BINARY(16) NOT NULL,
  image_id BINARY(16) NOT NULL,
  x_coordinate DECIMAL(10, 2) NOT NULL,
  y_coordinate DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
  INDEX idx_part_id (part_id),
  INDEX idx_image_id (image_id),
  INDEX idx_created_at (created_at),
  UNIQUE KEY unique_part_image (part_id, image_id)
) ENGINE=InnoDB;

-- Table 6: Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id BINARY(16) PRIMARY KEY,
  part_id BINARY(16),
  part_name VARCHAR(255),
  part_no VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  email_address VARCHAR(255) NOT NULL,
  message LONGTEXT,
  status VARCHAR(50) DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB;

-- Table 7: Admin Users (For Authentication)
CREATE TABLE IF NOT EXISTS admin_users (
  id BINARY(16) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;
