const express = require('express');
const router = express.Router();
const StationController = require('../controllers/stationController');
const { validateJWT } = require('../middlewares/validate-jwt');
const { validateRol } = require('../middlewares/validate-rol');

// Ruta para obtener todas las estaciones
router.get('/stations', validateJWT, StationController.getAllStations);
router.get('/stations/nearby', StationController.getNearbyStations);
router.get('/stations/associated/:id', StationController.getAsocciatedStations);
router.post('/stations', [validateJWT, validateRol], StationController.createStation);
router.put('/stations/:id/details', [validateJWT, validateRol], StationController.updateStation);
router.patch('/stations/:id/status', [validateJWT, validateRol], StationController.updateStationStatus);
router.delete('/stations/:id', [validateJWT, validateRol], StationController.deleteStation);


module.exports = router;
