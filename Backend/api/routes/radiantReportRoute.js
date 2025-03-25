const express = require('express');
const router = express.Router();
const RadiantReportController = require('../controllers/radianteReportController');
const { validateJWT } = require('../middlewares/validate-jwt');


// Ruta para obtener todas las estaciones
router.post('/radiant-report/advice', validateJWT, RadiantReportController.saveReportAdvice);
router.get('/radiant-report/:id', validateJWT, RadiantReportController.getRadiantReport);


module.exports = router;