const express = require('express');
const router = express.Router();
const ReportZController = require('../controllers/reportZController');
const { validateJWT } = require('../middlewares/validate-jwt');


// Ruta para obtener todas las estaciones
router.get('/reportz', validateJWT, ReportZController.getAllReportZ);
router.get('/reportz/search', validateJWT, ReportZController.getReportzWithCustomSearch);
router.post('/reportz/showerInfo/:selectedCode/:dateIn/:dateOut', validateJWT, ReportZController.getReportZListFromRain);
router.get('/reportz/:id', validateJWT, ReportZController.getReportZ);


module.exports = router;