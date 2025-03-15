const express = require('express');
const router = express.Router();
const ReportZController = require('../controllers/reportZController');

// Ruta para obtener todas las estaciones
router.get('/reportz', ReportZController.getAllReportZ);
router.get('/reportz/:id', ReportZController.getReportZ);

module.exports = router;