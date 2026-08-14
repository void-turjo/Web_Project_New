const express = require('express');
const router = express.Router();
const { getUserCertificates, claimCertificate } = require('../controllers/certificateController');

router.get('/user/:userId', getUserCertificates);
router.post('/claim', claimCertificate);

module.exports = router;
