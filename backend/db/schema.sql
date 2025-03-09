-- Create Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    section VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_name, section)
);

-- Create Weekly Forecasts Table
CREATE TABLE IF NOT EXISTS weekly_forecasts (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id),
    week_number VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    subtopic VARCHAR(200),
    material TEXT,
    date DATE,
    status VARCHAR(20) DEFAULT 'Incomplete',
    admin_review BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    admin_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Weekly Activities Table
CREATE TABLE IF NOT EXISTS weekly_activities (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id),
    day_of_week VARCHAR(20) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    subtopic VARCHAR(200),
    rpk TEXT,
    objectives TEXT,
    material TEXT,
    status VARCHAR(20) DEFAULT 'Incomplete',
    admin_review BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    admin_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_class_id_forecasts ON weekly_forecasts(class_id);
CREATE INDEX IF NOT EXISTS idx_class_id_activities ON weekly_activities(class_id);

-- Create index for status and review filters
CREATE INDEX IF NOT EXISTS idx_forecast_status ON weekly_forecasts(status);
CREATE INDEX IF NOT EXISTS idx_forecast_review ON weekly_forecasts(admin_review);
CREATE INDEX IF NOT EXISTS idx_activity_status ON weekly_activities(status);
CREATE INDEX IF NOT EXISTS idx_activity_review ON weekly_activities(admin_review); 