const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Classes
app.get('/api/classes', async (req, res) => {
    try {
        console.log('GET /api/classes - Fetching all classes');
        const result = await db.query('SELECT * FROM classes ORDER BY class_name, section');
        console.log('Classes fetched:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching classes:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/classes', async (req, res) => {
    const { class_name, section } = req.body;
    try {
        // Normalize the section value
        const normalizedSection = section === 'SINGLE' ? 'SINGLE' : section;
        
        // First check if the class exists
        let result = await db.query(
            'SELECT * FROM classes WHERE class_name = $1 AND section = $2',
            [class_name, normalizedSection]
        );
        
        // If class doesn't exist, create it
        if (result.rows.length === 0) {
            console.log('Creating new class:', { class_name, section: normalizedSection });
            result = await db.query(
                'INSERT INTO classes (class_name, section) VALUES ($1, $2) RETURNING *',
                [class_name, normalizedSection]
            );
        } else {
            console.log('Found existing class:', result.rows[0]);
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating/finding class:', err);
        res.status(500).json({ error: err.message });
    }
});

// Weekly Forecasts
app.get('/api/forecasts/:classId', async (req, res) => {
    try {
        console.log(`GET /api/forecasts/${req.params.classId} - Fetching forecasts for class`);
        const result = await db.query(
            'SELECT * FROM weekly_forecasts WHERE class_id = $1 ORDER BY week_number',
            [req.params.classId]
        );
        console.log(`Forecasts fetched for class ${req.params.classId}:`, result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching forecasts:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add this new endpoint for getting a single forecast
app.get('/api/forecasts/:id', async (req, res) => {
    try {
        console.log(`GET /api/forecasts/${req.params.id} - Fetching single forecast`);
        const result = await db.query(
            'SELECT f.*, c.class_name, c.section FROM weekly_forecasts f ' +
            'JOIN classes c ON f.class_id = c.id ' +
            'WHERE f.id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Forecast not found' });
        }
        
        console.log('Forecast fetched:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching forecast:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/forecasts', async (req, res) => {
    const { class_id, week_number, subject, topic, subtopic, material, date } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO weekly_forecasts 
            (class_id, week_number, subject, topic, subtopic, material, date) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [class_id, week_number, subject, topic, subtopic, material, date]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Weekly Activities
app.get('/api/activities/:classId', async (req, res) => {
    try {
        console.log(`GET /api/activities/${req.params.classId} - Fetching activities for class`);
        const result = await db.query(
            'SELECT * FROM weekly_activities WHERE class_id = $1 ORDER BY day_of_week',
            [req.params.classId]
        );
        console.log(`Activities fetched for class ${req.params.classId}:`, result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching activities:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/activities/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT a.*, c.class_name, c.section FROM weekly_activities a ' +
            'JOIN classes c ON a.class_id = c.id ' +
            'WHERE a.id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/activities', async (req, res) => {
    const { class_id, day_of_week, topic, subtopic, rpk, objectives, material } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO weekly_activities 
            (class_id, day_of_week, topic, subtopic, rpk, objectives, material) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [class_id, day_of_week, topic, subtopic, rpk, objectives, material]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating activity:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/activities/:id/review', async (req, res) => {
    const { id } = req.params;
    const { rating, admin_feedback, admin_review } = req.body;
    
    try {
        const result = await db.query(
            `UPDATE weekly_activities 
             SET rating = $1, 
                 admin_feedback = $2, 
                 admin_review = $3, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 
             RETURNING *`,
            [rating, admin_feedback, admin_review, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating activity review:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update status
app.patch('/api/forecasts/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const result = await db.query(
            'UPDATE weekly_forecasts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/activities/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const result = await db.query(
            'UPDATE weekly_activities SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Review Forecast
app.post('/api/forecasts/:id/review', async (req, res) => {
    const { id } = req.params;
    const { rating, admin_feedback, admin_review, reviewed_at } = req.body;
    
    try {
        // Update the forecast with review data
        const result = await db.query(
            `UPDATE weekly_forecasts 
             SET rating = $1, 
                 admin_feedback = $2, 
                 admin_review = $3, 
                 updated_at = $4
             WHERE id = $5 
             RETURNING *`,
            [rating, admin_feedback, admin_review, reviewed_at, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Forecast not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating forecast review:', err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Database connection details:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
    });
}); 