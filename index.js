const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const { URL } = require('url');

const app = express();
app.use(cors()); // อย่าลืมเปิด cors ถ้ามี frontend
app.use(express.json()); // อย่าลืม! สำหรับแปลง JSON body เป็น object

// แปลง DATABASE_URL เป็น object
const dbUrl = new URL(process.env.DATABASE_URL);


// สร้าง connection จาก DATABASE_URL
// ตัวอย่าง DATABASE_URL: mysql://username:password@hostname:port/database?ssl={"rejectUnauthorized":true
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
    connection.query('SELECT * FROM attractions', (err, results ) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results); // ส่งข้อมูลกลับเป็น JSON
    });
});


// ✅ GET รายการเดียวตาม id
app.get('/attractions/:id', (req, res) => {
    const attractionId = req.params.id;
  
    connection.query(
      'SELECT * FROM attractions WHERE id = ?',
      [attractionId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database query failed' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ error: 'Attraction not found' });
        }
  
        res.json(results[0]);
      }
    );
  });


app.post('/attractions', (req, res) => {  // สร้าง
    const { name, detail, coverimage, latitude, longitude } = req.body;

    connection.query(
        'INSERT INTO attractions (name, detail, coverimage, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
        [name, detail, coverimage, latitude, longitude],
        (err, results) => {
            if (err) {
                console.error('Insert Error:', err);
                return res.status(500).json({ error: 'Insert failed' });
            }
            res.status(201).json({ message: 'Attraction added successfully', id: results.insertId });
        }
    );
});

app.put('/attractions/:id', (req, res) => {  // แก้ไข
  const id = req.params.id;
  const { name, detail, coverimage, latitude, longitude } = req.body;

  connection.query(
      'UPDATE attractions SET name=?, detail=?, coverimage=?, latitude=?, longitude=? WHERE id=?',
      [name, detail, coverimage, latitude, longitude, id],
      (err, results) => {
          if (err) {
              console.error('Update Error:', err);
              return res.status(500).json({ error: 'Update failed' });
          }

          if (results.affectedRows === 0) {
              return res.status(404).json({ error: 'Attraction not found' });
          }

          res.json({ message: 'Attraction updated successfully' });
      }
  );
});


app.delete('/attractions/:id', (req, res) => {
  const id = req.params.id;

  connection.query(
      'DELETE FROM attractions WHERE id = ?',
      [id],
      (err, results) => {
          if (err) {
              console.error('Delete Error:', err);
              return res.status(500).json({ error: 'Delete failed' });
          }

          if (results.affectedRows === 0) {
              return res.status(404).json({ error: 'Attraction not found' });
          }

          res.json({ message: 'Attraction deleted successfully' });
      }
  );
});




  // url ที่เปิดผ่าน Cloud TiDB 
  // https://myapi-for-tidb-4.onrender.com/attractions

// เริ่มต้น server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
