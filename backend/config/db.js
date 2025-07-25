const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Successfully connected to MySQL database');
        connection.release();
    }
});

module.exports = {
    query: (sql, params) =>
        new Promise((resolve, reject) => {
            pool.query(sql, params, (error, results, fields) => {
                if (error) return reject(error);
                resolve([results, fields]);
            });
        }),
}; 