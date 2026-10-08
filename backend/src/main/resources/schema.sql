-- ==========================================================
-- HydroAlert MySQL Database Schema Reference
-- Spring Data JPA / Hibernate automatically generates these
-- when spring.jpa.hibernate.ddl-auto=update is enabled.
-- ==========================================================

CREATE DATABASE IF NOT EXISTS hydroalert_db;
USE hydroalert_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Water Readings Table
CREATE TABLE IF NOT EXISTS water_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(150) NOT NULL,
    flow_rate DOUBLE NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    leakage_status VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(150) NOT NULL,
    flow_rate DOUBLE NOT NULL,
    detection_time VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    acknowledgement_time VARCHAR(50),
    resolution_time VARCHAR(50),
    notes VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
