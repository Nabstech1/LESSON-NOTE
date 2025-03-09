const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const schema = `
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
`;

async function initDb() {
    try {
        // Create database if it doesn't exist
        const client = await pool.connect();
        
        console.log('Connected to PostgreSQL');
        
        // Create tables
        await client.query(schema);
        console.log('Database schema created successfully');
        
        client.release();
        await pool.end();
        
        console.log('Database initialization completed');
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDb(); 