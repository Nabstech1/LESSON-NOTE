const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const bcrypt = require('bcrypt');

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

// Get all users (for Superadmin)
app.get('/api/users', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id, u.name, u.email, u.role, u.created_at,
                   u.dob, u.phone_number, u.sex, u.aims_number,
                   u.region_id, r.name AS region_name,
                   u.zone_id, z.name AS zone_name,
                   u.circuit_id, c.name AS circuit_name
            FROM users u
            LEFT JOIN regions r ON u.region_id = r.id
            LEFT JOIN zones z ON u.zone_id = z.id
            LEFT JOIN circuits c ON u.circuit_id = c.id
            ORDER BY u.created_at DESC
        `);
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a user by ID (for Superadmin)
app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await db.query('DELETE FROM users WHERE id = ?', [userId]);
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update a user by ID (for Superadmin)
app.patch('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, email, role, password, dob, phone_number, sex, aims_number, region_id, zone_id, circuit_id } = req.body;
    if (!name && !email && !role && !password && !dob && !phone_number && !sex && !aims_number && region_id === undefined && zone_id === undefined && circuit_id === undefined) {
        return res.status(400).json({ error: 'No fields to update.' });
    }
    try {
        let updateFields = [];
        let params = [];
        if (name) {
            updateFields.push('name = ?');
            params.push(name);
        }
        if (email) {
            updateFields.push('email = ?');
            params.push(email);
        }
        if (role) {
            updateFields.push('role = ?');
            params.push(role);
        }
        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            updateFields.push('password_hash = ?');
            params.push(password_hash);
        }
        if (dob) {
            updateFields.push('dob = ?');
            params.push(dob);
        }
        if (phone_number) {
            updateFields.push('phone_number = ?');
            params.push(phone_number);
        }
        if (sex) {
            updateFields.push('sex = ?');
            params.push(sex);
        }
        if (aims_number) {
            updateFields.push('aims_number = ?');
            params.push(aims_number);
        }
        if (region_id !== undefined) {
            updateFields.push('region_id = ?');
            params.push(region_id);
        }
        if (zone_id !== undefined) {
            updateFields.push('zone_id = ?');
            params.push(zone_id);
        }
        if (circuit_id !== undefined) {
            updateFields.push('circuit_id = ?');
            params.push(circuit_id);
        }
        params.push(userId);
        const result = await db.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            params
        );
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: err.message });
    }
});

// Classes
app.get('/api/classes', async (req, res) => {
    try {
        console.log('GET /api/classes - Fetching all classes');
        const result = await db.query('SELECT * FROM classes ORDER BY class_name, section');
        console.log('Classes fetched:', result[0]);
        res.json(result[0]);
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
            'SELECT * FROM classes WHERE class_name = ? AND section = ?',
            [class_name, normalizedSection]
        );
        
        // If class doesn't exist, create it
        if (result[0].length === 0) {
            console.log('Creating new class:', { class_name, section: normalizedSection });
            result = await db.query(
                'INSERT INTO classes (class_name, section) VALUES (?, ?)',
                [class_name, normalizedSection]
            );
            // Fetch the inserted class
            const insertedId = result[0].insertId;
            const classResult = await db.query(
                'SELECT * FROM classes WHERE id = ?',
                [insertedId]
            );
            res.json(classResult[0][0]);
            return;
        } else {
            console.log('Found existing class:', result[0][0]);
        }
        
        res.json(result[0][0]);
    } catch (err) {
        console.error('Error creating/finding class:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update a class by ID
app.patch('/api/classes/:id', async (req, res) => {
    const classId = req.params.id;
    const { class_name, section } = req.body;
    if (!class_name && !section) {
        return res.status(400).json({ error: 'No fields to update.' });
    }
    try {
        let updateFields = [];
        let params = [];
        if (class_name) {
            updateFields.push('class_name = ?');
            params.push(class_name);
        }
        if (section) {
            updateFields.push('section = ?');
            params.push(section);
        }
        params.push(classId);
        const result = await db.query(
            `UPDATE classes SET ${updateFields.join(', ')} WHERE id = ?`,
            params
        );
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Class not found.' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating class:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a class by ID
app.delete('/api/classes/:id', async (req, res) => {
    const classId = req.params.id;
    try {
        const result = await db.query('DELETE FROM classes WHERE id = ?', [classId]);
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Class not found.' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting class:', err);
        res.status(500).json({ error: err.message });
    }
});

// Weekly Forecasts
app.get('/api/forecasts/:classId', async (req, res) => {
    try {
        console.log(`GET /api/forecasts/${req.params.classId} - Fetching forecasts for class`);
        const result = await db.query(
            'SELECT f.*, c.class_name, c.section FROM weekly_forecasts f ' +
            'JOIN classes c ON f.class_id = c.id ' +
            'WHERE f.class_id = ? ORDER BY f.created_at DESC',
            [req.params.classId]
        );
        console.log(`Forecasts fetched for class ${req.params.classId}:`, result[0]);
        res.json(result[0]);
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
            'LEFT JOIN classes c ON f.class_id = c.id ' +
            'WHERE f.id = ?',
            [req.params.id]
        );
        
        if (result[0].length === 0) {
            return res.status(404).json({ error: 'Forecast not found' });
        }
        
        console.log('Forecast fetched:', result[0][0]);
        res.json(result[0][0]);
    } catch (err) {
        console.error('Error fetching forecast:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/forecasts', async (req, res) => {
    const { class_id, week_number, subject, topic, subtopic, material, date } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO weekly_forecasts (class_id, week_number, subject, topic, subtopic, material, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [class_id, week_number, subject, topic, subtopic, material, date]
        );
        // Fetch the inserted forecast
        const insertedId = result[0].insertId;
        const forecastResult = await db.query(
            'SELECT * FROM weekly_forecasts WHERE id = ?',
            [insertedId]
        );
        res.json(forecastResult[0][0]);
        return;
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Weekly Activities
app.get('/api/activities/:classId', async (req, res) => {
    try {
        console.log(`GET /api/activities/${req.params.classId} - Fetching activities for class`);
        const result = await db.query(
            'SELECT * FROM weekly_activities WHERE class_id = ? ORDER BY day_of_week',
            [req.params.classId]
        );
        console.log(`Activities fetched for class ${req.params.classId}:`, result[0]);
        res.json(result[0]);
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
            'WHERE a.id = ?',
            [req.params.id]
        );
        if (result[0].length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        res.json(result[0][0]);
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/activities', async (req, res) => {
    const { class_id, day_of_week, topic, subtopic, rpk, objectives, material } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO weekly_activities (class_id, day_of_week, topic, subtopic, rpk, objectives, material) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [class_id, day_of_week, topic, subtopic, rpk, objectives, material]
        );
        // Fetch the inserted activity
        const insertedId = result[0].insertId;
        const activityResult = await db.query(
            'SELECT * FROM weekly_activities WHERE id = ?',
            [insertedId]
        );
        res.json(activityResult[0][0]);
        return;
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
            'UPDATE weekly_activities SET rating = ?, admin_feedback = ?, admin_review = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [rating, admin_feedback, admin_review, id]
        );
        // Fetch the updated activity
        const activityResult = await db.query(
            'SELECT * FROM weekly_activities WHERE id = ?',
            [id]
        );
        res.json(activityResult[0][0]);
        return;
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
            'UPDATE weekly_forecasts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, req.params.id]
        );
        // Fetch the updated forecast
        const forecastResult = await db.query(
            'SELECT * FROM weekly_forecasts WHERE id = ?',
            [req.params.id]
        );
        res.json(forecastResult[0][0]);
        return;
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/activities/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const result = await db.query(
            'UPDATE weekly_activities SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, req.params.id]
        );
        // Fetch the updated activity
        const activityResult = await db.query(
            'SELECT * FROM weekly_activities WHERE id = ?',
            [req.params.id]
        );
        res.json(activityResult[0][0]);
        return;
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Review Forecast
app.post('/api/forecasts/:id/review', async (req, res) => {
    const { id } = req.params;
    // Destructure all possible fields from the request body
    const { rating, admin_feedback, admin_review, reviewed_at, week_number, topic, subtopic, material } = req.body;
    try {
        // Dynamically build the update statement
        const fields = [];
        const values = [];
        if (rating !== undefined) { fields.push('rating = ?'); values.push(rating); }
        if (admin_feedback !== undefined) { fields.push('admin_feedback = ?'); values.push(admin_feedback); }
        if (admin_review !== undefined) { fields.push('admin_review = ?'); values.push(admin_review); }
        if (reviewed_at !== undefined) { fields.push('updated_at = ?'); values.push(reviewed_at); }
        if (week_number !== undefined) { fields.push('week_number = ?'); values.push(week_number); }
        if (topic !== undefined) { fields.push('topic = ?'); values.push(topic); }
        if (subtopic !== undefined) { fields.push('subtopic = ?'); values.push(subtopic); }
        if (material !== undefined) { fields.push('material = ?'); values.push(material); }
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        const sql = `UPDATE weekly_forecasts SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        await db.query(sql, values);
        // Fetch the updated forecast
        const forecastResult = await db.query(
            'SELECT f.*, c.class_name, c.section FROM weekly_forecasts f LEFT JOIN classes c ON f.class_id = c.id WHERE f.id = ?',
            [id]
        );
        if (forecastResult[0].length === 0) {
            return res.status(404).json({ error: 'Forecast not found' });
        }
        res.json(forecastResult[0][0]);
    } catch (err) {
        console.error('Error updating forecast review:', err);
        res.status(500).json({ error: err.message });
    }
});

// Unified endpoint for submitting questionnaire responses (forecast or activity)
app.post('/api/questionnaire-responses', async (req, res) => {
    // Destructure only the fields that exist in the table
    const {
        region_id,
        zone_id,
        circuit_id,
        date,
        type,
        submitted_by,
        answers,
        status,
        stage,
        admin_review,
        rating,
        admin_feedback
    } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO questionnaire_responses 
                (region_id, zone_id, circuit_id, date, type, submitted_by, answers, status, stage, admin_review, rating, admin_feedback)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                region_id,
                zone_id,
                circuit_id,
                date,
                type,
                submitted_by || null,
                JSON.stringify(answers),
                status || 'Incomplete',
                stage || 'admin',
                admin_review || 0,
                rating || null,
                admin_feedback || null
            ]
        );
        const insertedId = result[0].insertId;
        const responseResult = await db.query(
            'SELECT * FROM questionnaire_responses WHERE id = ?',
            [insertedId]
        );
        res.json(responseResult[0][0]);
    } catch (err) {
        console.error('Error saving questionnaire response:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH endpoint to update answers in questionnaire_responses
app.patch('/api/questionnaire-responses', async (req, res) => {
    const { id, answers, stage, submitted_by, forward_date, region_id, zone_id, zonal_forward_date, regional_forward_date } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Missing id' });
    }
    try {
        let updateFields = [];
        let params = [];
        if (answers) {
            updateFields.push('answers = ?');
            params.push(JSON.stringify(answers));
        }
        if (stage) {
            updateFields.push('stage = ?');
            params.push(stage);
        }
        if (submitted_by) {
            updateFields.push('submitted_by = ?');
            params.push(submitted_by);
        }
        if (forward_date) {
            updateFields.push('forward_date = ?');
            params.push(forward_date);
        }
        if (region_id) {
            updateFields.push('region_id = ?');
            params.push(region_id);
        }
        if (zone_id) {
            updateFields.push('zone_id = ?');
            params.push(zone_id);
        }
        if (zonal_forward_date) {
            updateFields.push('zonal_forward_date = ?');
            params.push(zonal_forward_date);
        }
        if (regional_forward_date) {
            updateFields.push('regional_forward_date = ?');
            params.push(regional_forward_date);
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        params.push(id);
        const sql = `UPDATE questionnaire_responses SET ${updateFields.join(', ')} WHERE id = ?`;
        console.log('PATCH /api/questionnaire-responses SQL:', sql);
        console.log('PATCH /api/questionnaire-responses params:', params);
        await db.query(sql, params);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating questionnaire response:', err);
        res.status(500).json({ error: err.message });
    }
});

// Unified endpoint for retrieving questionnaire responses (optionally filtered by class, type, and stage)
app.get('/api/questionnaire-responses', async (req, res) => {
    const { class_id, type, stage, submitted_by, zone_id, region_id } = req.query;
    let sql = `
        SELECT qr.*, c.name AS circuit_name, z.name AS zone_name
        FROM questionnaire_responses qr
        LEFT JOIN circuits c ON qr.circuit_id = c.id
        LEFT JOIN zones z ON qr.zone_id = z.id
        WHERE 1=1
    `;
    const params = [];
    if (class_id) {
        sql += ' AND qr.class_id = ?';
        params.push(class_id);
    }
    if (type) {
        sql += ' AND qr.type = ?';
        params.push(type);
    }
    if (stage) {
        sql += ' AND qr.stage = ?';
        params.push(stage);
    }
    if (submitted_by) {
        sql += ' AND qr.submitted_by = ?';
        params.push(submitted_by);
    }
    if (zone_id) {
        sql += ' AND qr.zone_id = ?';
        params.push(zone_id);
    }
    if (region_id) {
        sql += ' AND qr.region_id = ?';
        params.push(region_id);
    }
    sql += ' ORDER BY qr.submitted_at DESC';
    try {
        const result = await db.query(sql, params);
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching questionnaire responses:', err);
        res.status(500).json({ error: err.message });
    }
});

// Submission history endpoint for all levels
app.get('/api/submission-history', async (req, res) => {
    const { user_id, zone_id, region_id, stage } = req.query;
    let sql = 'SELECT * FROM questionnaire_responses WHERE 1=1';
    const params = [];
    if (user_id) {
        sql += ' AND submitted_by = ?';
        params.push(user_id);
    }
    if (zone_id) {
        sql += ' AND zone_id = ?';
        params.push(zone_id);
    }
    if (region_id) {
        sql += ' AND region_id = ?';
        params.push(region_id);
    }
    if (stage) {
        sql += ' AND stage = ?';
        params.push(stage);
    }
    sql += ' ORDER BY submitted_at DESC';
    try {
        const result = await db.query(sql, params);
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching submission history:', err);
        res.status(500).json({ error: err.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        // You can add session/cookie/JWT logic here if needed
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                dob: user.dob,
                phone_number: user.phone_number,
                sex: user.sex,
                aims_number: user.aims_number,
                region_id: user.region_id,
                zone_id: user.zone_id,
                circuit_id: user.circuit_id
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Create user account endpoint
app.post('/api/create-user', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        // Check if user already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// ALL REPORTS ENDPOINT for Superadmin/National
app.get('/api/all-reports', async (req, res) => {
    const { from, to, level } = req.query;
    let sql = `
        SELECT qr.id, qr.date, qr.type, qr.submitted_at, qr.status, qr.stage, qr.answers,
               u.name AS submitted_by_name, u.role AS level,
               c.name AS circuit_name, z.name AS zone_name, r.name AS region_name
        FROM questionnaire_responses qr
        LEFT JOIN users u ON qr.submitted_by = u.id
        LEFT JOIN circuits c ON qr.circuit_id = c.id
        LEFT JOIN zones z ON qr.zone_id = z.id
        LEFT JOIN regions r ON qr.region_id = r.id
        WHERE 1=1
    `;
    const params = [];
    if (from) {
        sql += ' AND qr.date >= ?';
        params.push(from);
    }
    if (to) {
        sql += ' AND qr.date <= ?';
        params.push(to);
    }
    if (level) {
        sql += ' AND u.role = ?';
        params.push(level);
    }
    sql += ' ORDER BY qr.submitted_at DESC';
    try {
        const result = await db.query(sql, params);
        // Map to frontend format: FROM, TO, LEVEL, etc.
        const mapped = result[0].map(row => ({
            id: row.id,
            date: row.date,
            submitted_at: row.submitted_at,
            from: row.circuit_name || row.zone_name || row.region_name || '',
            to: row.zone_name || row.region_name || '',
            level: row.level,
            status: row.status,
            answers: row.answers
        }));
        res.json(mapped);
    } catch (err) {
        console.error('Error fetching all reports:', err);
        res.status(500).json({ error: err.message });
    }
});
// REGION ENDPOINTS
app.get('/api/regions', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM regions ORDER BY name');
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/regions', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    try {
        const result = await db.query('INSERT INTO regions (name) VALUES (?)', [name]);
        res.json({ id: result[0].insertId, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.patch('/api/regions/:id', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    try {
        const result = await db.query('UPDATE regions SET name = ? WHERE id = ?', [name, req.params.id]);
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Region not found.' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/regions/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM regions WHERE id = ?', [req.params.id]);
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Region not found.' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ZONE ENDPOINTS
app.get('/api/zones', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM zones ORDER BY name');
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/zones', async (req, res) => {
    const { name, region_id } = req.body;
    if (!name || !region_id) return res.status(400).json({ error: 'Name and region_id are required.' });
    try {
        const result = await db.query('INSERT INTO zones (name, region_id) VALUES (?, ?)', [name, region_id]);
        res.json({ id: result[0].insertId, name, region_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.patch('/api/zones/:id', async (req, res) => {
    const { name, region_id } = req.body;
    if (!name && !region_id) return res.status(400).json({ error: 'No fields to update.' });
    try {
        let updateFields = [];
        let params = [];
        if (name) { updateFields.push('name = ?'); params.push(name); }
        if (region_id) { updateFields.push('region_id = ?'); params.push(region_id); }
        params.push(req.params.id);
        const result = await db.query(`UPDATE zones SET ${updateFields.join(', ')} WHERE id = ?`, params);
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Zone not found.' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/zones/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM zones WHERE id = ?', [req.params.id]);
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Zone not found.' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CIRCUIT ENDPOINTS
app.get('/api/circuits', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM circuits ORDER BY name');
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/circuits', async (req, res) => {
    const { name, zone_id } = req.body;
    if (!name || !zone_id) return res.status(400).json({ error: 'Name and zone_id are required.' });
    try {
        const result = await db.query('INSERT INTO circuits (name, zone_id) VALUES (?, ?)', [name, zone_id]);
        res.json({ id: result[0].insertId, name, zone_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.patch('/api/circuits/:id', async (req, res) => {
    const { name, zone_id } = req.body;
    if (!name && !zone_id) return res.status(400).json({ error: 'No fields to update.' });
    try {
        let updateFields = [];
        let params = [];
        if (name) { updateFields.push('name = ?'); params.push(name); }
        if (zone_id) { updateFields.push('zone_id = ?'); params.push(zone_id); }
        params.push(req.params.id);
        const result = await db.query(`UPDATE circuits SET ${updateFields.join(', ')} WHERE id = ?`, params);
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Circuit not found.' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/circuits/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM circuits WHERE id = ?', [req.params.id]);
        if (result[0].affectedRows === 0) return res.status(404).json({ error: 'Circuit not found.' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API endpoint: Get account stats for Superadmin dashboard
app.get('/api/account-stats', async (req, res) => {
    try {
        // Total users
        const [total] = await db.query('SELECT COUNT(*) as count FROM users');
        // By role
        const [circuit] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'");
        const [zonal] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        const [regional] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'regional'");
        const [national] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'national'");
        res.json({
            total: total[0].count,
            circuit: circuit[0].count,
            zonal: zonal[0].count,
            regional: regional[0].count,
            national: national[0].count
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch account stats' });
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