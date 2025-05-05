const express = require('express');
const router = express.Router();
const { auditC, getAuditEventsByDateRange } = require('../controllers/auditController');
const {validateRol} = require('../middlewares/validate-rol');
const { validateJWT } = require('../middlewares/validate-jwt');

router.post('/audit',auditC);
router.get('/audit',[validateRol, validateJWT], getAuditEventsByDateRange);

module.exports = router;