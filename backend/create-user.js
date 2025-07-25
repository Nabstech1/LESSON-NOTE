const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// Database connection config
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_db',
    port: 3306
};

// Usage: node create-user.js user@example.com password123 "Full Name" role
async function createUser(email, password, name, role = 'teacher') {
    const hash = await bcrypt.hash(password, 10);
    const connection = await mysql.createConnection(dbConfig);

    const sql = 'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)';
    try {
        await connection.execute(sql, [email, hash, name, role]);
        console.log('User created successfully!');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('A user with this email already exists.');
        } else {
            console.error('Error creating user:', err.message);
        }
    } finally {
        await connection.end();
    }
}

// Get arguments from command line
const [,, email, password, ...rest] = process.argv;
const name = rest.slice(0, -1).join(' ');
const role = rest[rest.length - 1] || 'teacher';

if (!email || !password || !name || !role) {
    console.log('Usage: node create-user.js user@example.com password123 "Full Name" role');
    process.exit(1);
}

createUser(email, password, name, role);