const express = require('express');
const router = express.Router();
const StationController = require('../controllers/stationController');

// Ruta para obtener todas las estaciones
router.get('/stations', StationController.getAllStations);

module.exports = router;