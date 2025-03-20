const express = require('express');
const router = express.Router();
const ReportZController = require('../controllers/reportZController');
const { validateJWT } = require('../middlewares/validate-jwt');


// Ruta para obtener todas las estaciones
router.get('/reportz', validateJWT, ReportZController.getAllReportZ);
router.get('/reportz/:id', validateJWT, ReportZController.getReportZ);
router.post('/reportz/advice', validateJWT, ReportZController.saveReportAdvice);

module.exports = router;