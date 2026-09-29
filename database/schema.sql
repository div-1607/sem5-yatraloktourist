-- =======================================================
-- YATRALOK SMART TOURISM & SAFETY PLATFORM
-- DATABASE SCHEMA DEFINITION (MySQL 8.0+)
-- Database: yatralok_db
-- =======================================================

CREATE DATABASE IF NOT EXISTS yatralok_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE yatralok_db;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------
-- 1. TABLE: users
-- -------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('TOURIST', 'POLICE', 'ADMIN') NOT NULL DEFAULT 'TOURIST',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 2. TABLE: tourists
-- Relationship: users 1 -> 1 tourists
-- -------------------------------------------------------
DROP TABLE IF EXISTS tourists;
CREATE TABLE tourists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  digital_id VARCHAR(50) NOT NULL UNIQUE, -- Format: YL-2026-000123
  date_of_birth DATE NULL,
  address TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tourists_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 3. TABLE: police_officers
-- Relationship: users 1 -> 1 police_officers
-- -------------------------------------------------------
DROP TABLE IF EXISTS police_officers;
CREATE TABLE police_officers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  badge_number VARCHAR(50) NOT NULL UNIQUE,
  station_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_police_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 4. TABLE: trips
-- Relationship: tourists 1 -> N trips
-- -------------------------------------------------------
DROP TABLE IF EXISTS trips;
CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tourist_id INT NOT NULL,
  destination VARCHAR(200) NOT NULL,
  start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME NULL,
  status ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_trips_tourist FOREIGN KEY (tourist_id)
    REFERENCES tourists (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 5. TABLE: location_points
-- Relationship: trips 1 -> N location_points (GPS Breadcrumbs)
-- -------------------------------------------------------
DROP TABLE IF EXISTS location_points;
CREATE TABLE location_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  accuracy DECIMAL(6, 2) DEFAULT 10.00,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_locations_trip FOREIGN KEY (trip_id)
    REFERENCES trips (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 6. TABLE: emergency_contacts
-- Relationship: tourists 1 -> (1 to 3) emergency_contacts
-- -------------------------------------------------------
DROP TABLE IF EXISTS emergency_contacts;
CREATE TABLE emergency_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tourist_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contacts_tourist FOREIGN KEY (tourist_id)
    REFERENCES tourists (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 7. TABLE: geo_zones
-- Circular Geofences (DANGER / RESTRICTED)
-- -------------------------------------------------------
DROP TABLE IF EXISTS geo_zones;
CREATE TABLE geo_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  radius DECIMAL(8, 2) NOT NULL, -- radius in meters
  zone_type ENUM('DANGER', 'RESTRICTED') NOT NULL DEFAULT 'DANGER',
  description TEXT NULL,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 8. TABLE: incidents
-- Relationship: tourists 1 -> N incidents, trips 1 -> N incidents
-- -------------------------------------------------------
DROP TABLE IF EXISTS incidents;
CREATE TABLE incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tourist_id INT NOT NULL,
  trip_id INT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  incident_type ENUM('SOS', 'GEOFENCE', 'ACCIDENT', 'MEDICAL', 'OTHER') NOT NULL DEFAULT 'SOS',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'CRITICAL',
  description TEXT NULL,
  status ENUM('NEW', 'ACKNOWLEDGED', 'ASSIGNED', 'EN_ROUTE', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'NEW',
  assigned_officer_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at DATETIME NULL,
  resolved_at DATETIME NULL,
  closed_at DATETIME NULL,
  CONSTRAINT fk_incidents_tourist FOREIGN KEY (tourist_id)
    REFERENCES tourists (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_incidents_trip FOREIGN KEY (trip_id)
    REFERENCES trips (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_incidents_police FOREIGN KEY (assigned_officer_id)
    REFERENCES police_officers (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 9. TABLE: incident_status_history
-- Full audit trail of incident status transitions
-- -------------------------------------------------------
DROP TABLE IF EXISTS incident_status_history;
CREATE TABLE incident_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  changed_by INT NULL, -- references users(id)
  old_status ENUM('NEW', 'ACKNOWLEDGED', 'ASSIGNED', 'EN_ROUTE', 'RESOLVED', 'CLOSED') NULL,
  new_status ENUM('NEW', 'ACKNOWLEDGED', 'ASSIGNED', 'EN_ROUTE', 'RESOLVED', 'CLOSED') NOT NULL,
  remarks TEXT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_incident FOREIGN KEY (incident_id)
    REFERENCES incidents (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (changed_by)
    REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 10. TABLE: notifications
-- -------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  incident_id INT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notif_incident FOREIGN KEY (incident_id)
    REFERENCES incidents (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 11. TABLE: audit_logs
-- -------------------------------------------------------
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NULL,
  old_value JSON NULL,
  new_value JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 12. TABLE: risk_predictions (AI / ML)
-- -------------------------------------------------------
DROP TABLE IF EXISTS risk_predictions;
CREATE TABLE risk_predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tourist_id INT NOT NULL,
  trip_id INT NULL,
  risk_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 1.00 or 0 to 100
  risk_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW',
  reason TEXT NULL,
  model_version VARCHAR(50) DEFAULT 'v1.0-rf',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_risk_tourist FOREIGN KEY (tourist_id)
    REFERENCES tourists (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_risk_trip FOREIGN KEY (trip_id)
    REFERENCES trips (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
