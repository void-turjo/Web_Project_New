const db = require('../config/db');

// Get downloadable PDF notes
const getNotes = (req, res) => {
  const { subject } = req.query;
  let sql = 'SELECT * FROM notes';
  const params = [];

  if (subject && subject !== 'All Subjects') {
    sql += ' WHERE subject = ?';
    params.push(subject);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.log('Error fetching notes:', err);
      return res.status(500).json({ message: 'Database error fetching notes!' });
    }
    res.status(200).json({ notes: results });
  });
};

// Increment download count
const incrementDownload = (req, res) => {
  const { noteId } = req.params;

  db.query('UPDATE notes SET download_count = download_count + 1 WHERE note_id = ?', [noteId], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Database error!' });
    }
    res.status(200).json({ message: 'Download counted.' });
  });
};

module.exports = {
  getNotes,
  incrementDownload
};
