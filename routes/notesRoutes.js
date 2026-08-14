const express = require('express');
const router = express.Router();
const { getNotes, incrementDownload } = require('../controllers/notesController');

router.get('/', getNotes);
router.post('/download/:noteId', incrementDownload);

module.exports = router;
