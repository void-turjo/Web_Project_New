const db = require('../config/db');

// Get certificates for a user
const getUserCertificates = (req, res) => {
  const { userId } = req.params;

  db.query('SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC', [userId], (err, results) => {
    if (err) {
      console.log('Certificates DB Error:', err);
      return res.status(500).json({ message: 'Database error fetching certificates!' });
    }
    res.status(200).json({ certificates: results });
  });
};

// Generate certificate upon course completion
const claimCertificate = (req, res) => {
  const { user_id, user_name, course_id, course_name } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ message: 'Missing user or course details!' });
  }

  // Check if certificate already generated
  db.query('SELECT * FROM certificates WHERE user_id = ? AND course_id = ?', [user_id, course_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error checking certificate!' });
    }

    if (results.length > 0) {
      return res.status(200).json({ message: 'Certificate already issued!', certificate: results[0] });
    }

    // Generate unique code (e.g. SL-2026-98214)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const certificate_code = `SL-2026-${randomNum}`;

    const sql = 'INSERT INTO certificates (user_id, user_name, course_id, course_name, certificate_code) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [user_id, user_name || 'SmartLearn Student', course_id, course_name || 'Course', certificate_code], (err, result) => {
      if (err) {
        console.log('Error generating certificate:', err);
        return res.status(500).json({ message: 'Error generating certificate!' });
      }

      res.status(201).json({
        message: 'Certificate earned and issued successfully! 🎉',
        certificate: {
          certificate_id: result.insertId,
          user_id,
          user_name,
          course_id,
          course_name,
          certificate_code
        }
      });
    });
  });
};

module.exports = {
  getUserCertificates,
  claimCertificate
};
