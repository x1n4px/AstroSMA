const express = require('express');
const router = express.Router();
const { auditC } = require('../controllers/auditController');


router.post('/audit',auditC);

module.exports = router;