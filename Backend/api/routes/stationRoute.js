const express = require('express');
const router = express.Router();
const StationController = require('../controllers/stationController');

// Ruta para obtener todas las estaciones
router.get('/stations', StationController.getAllStations);
router.get('/stations/nearby', StationController.getNearbyStations);
router.get('/stations/associated/:id', StationController.getAsocciatedStations);

module.exports = router;