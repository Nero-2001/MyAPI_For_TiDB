const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const { URL } = require('url');


const app = express();
app.use(cors()); // อย่าลืมเปิด cors ถ้ามี frontend

// แปลง DATABASE_URL เป็น object
const dbUrl = new URL(process.env.DATABASE_URL);


// สร้าง connection จาก DATABASE_URL
// const connection = mysql.createConnection(process.env.DATABASE_URL);

// สร้าง connection
const connection = mysql.createConnection({
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    port: parseInt(dbUrl.port),
    ssl: JSON.parse(dbUrl.searchParams.get('ssl')) // จะอ่าน {"rejectUnauthorized":true} ได้ถูก
  });

// route สำหรับดึงข้อมูลทั้งหมดจากตาราง attractions
app.get('/attractions', (req, res) => {
    connection.query('SELECT * FROM attractions', (err, results , failed) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results); // ส่งข้อมูลกลับเป็น JSON
    });
});

// เริ่มต้น server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
