-- MySQL-compatible schema

-- Create Regions Table
CREATE TABLE IF NOT EXISTS regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Create Zones Table
CREATE TABLE IF NOT EXISTS zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region_id INT NOT NULL,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Create Circuits Table
CREATE TABLE IF NOT EXISTS circuits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    zone_id INT NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    circuit_id INT,
    zone_id INT,
    region_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (circuit_id) REFERENCES circuits(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Create Weekly Forecasts Table
CREATE TABLE IF NOT EXISTS weekly_forecasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT,
    week_number VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    subtopic VARCHAR(200),
    material TEXT,
    date DATE,
    status VARCHAR(20) DEFAULT 'Incomplete',
    admin_review TINYINT(1) DEFAULT 0,
    rating INT,
    admin_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Create Weekly Activities Table
CREATE TABLE IF NOT EXISTS weekly_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT,
    day_of_week VARCHAR(20) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    subtopic VARCHAR(200),
    rpk TEXT,
    objectives TEXT,
    material TEXT,
    status VARCHAR(20) DEFAULT 'Incomplete',
    admin_review TINYINT(1) DEFAULT 0,
    rating INT,
    admin_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- New table for dynamic questionnaire responses
CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region_id INT NOT NULL,
    zone_id INT NOT NULL,
    circuit_id INT NOT NULL,
    date DATE NOT NULL,
    type ENUM('forecast', 'activity') NOT NULL,
    submitted_by INT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answers JSON NOT NULL,
    status VARCHAR(20) DEFAULT 'Incomplete',
    stage VARCHAR(20) DEFAULT 'admin', -- Added for workflow
    admin_review TINYINT(1) DEFAULT 0,
    rating INT,
    admin_feedback TEXT,
    FOREIGN KEY (region_id) REFERENCES regions(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (circuit_id) REFERENCES circuits(id)
);

-- Create indexes for faster queries
DROP INDEX IF EXISTS idx_forecast_status ON weekly_forecasts;
CREATE INDEX idx_forecast_status ON weekly_forecasts(status);

DROP INDEX IF EXISTS idx_forecast_review ON weekly_forecasts;
CREATE INDEX idx_forecast_review ON weekly_forecasts(admin_review);

DROP INDEX IF EXISTS idx_activity_status ON weekly_activities;
CREATE INDEX idx_activity_status ON weekly_activities(status);

DROP INDEX IF EXISTS idx_activity_review ON weekly_activities;
CREATE INDEX idx_activity_review ON weekly_activities(admin_review);

-- Helpful indexes for questionnaire_responses
DROP INDEX IF EXISTS idx_qr_submitted_by ON questionnaire_responses;
CREATE INDEX idx_qr_submitted_by ON questionnaire_responses(submitted_by);

DROP INDEX IF EXISTS idx_qr_zone_id ON questionnaire_responses;
CREATE INDEX idx_qr_zone_id ON questionnaire_responses(zone_id);

DROP INDEX IF EXISTS idx_qr_region_id ON questionnaire_responses;
CREATE INDEX idx_qr_region_id ON questionnaire_responses(region_id);

DROP INDEX IF EXISTS idx_qr_stage ON questionnaire_responses;
CREATE INDEX idx_qr_stage ON questionnaire_responses(stage); 

ALTER TABLE users
  ADD COLUMN dob DATE NULL,
  ADD COLUMN phone_number VARCHAR(30) NULL,
  ADD COLUMN sex ENUM('Male','Female','Other') NULL,
  ADD COLUMN aims_number VARCHAR(50) NULL; 