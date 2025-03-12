const express = require('express');
const router = express.Router();
const StationController = require('../controllers/StationController');

// Ruta para obtener todas las tiendas
router.get('/stations', StationController.getAllStations);



module.exports = router;
