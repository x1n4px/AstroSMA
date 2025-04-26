const express = require('express');
const router = express.Router();
const { auditC, getAuditEventsByDateRange } = require('../controllers/auditController');


router.post('/audit',auditC);
router.get('/audit', getAuditEventsByDateRange);

module.exports = router;