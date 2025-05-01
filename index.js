const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors()); // อย่าลืมเปิด cors ถ้ามี frontend

// สร้าง connection จาก DATABASE_URL
const connection = mysql.createConnection(process.env.DATABASE_URL);

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
