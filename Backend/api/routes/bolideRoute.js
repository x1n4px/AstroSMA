const express = require('express');
const router = express.Router();
const BolideController = require('../controllers/bolideController');
const {validateJWT} = require('../middlewares/validate-jwt');

// Ruta para obtener todas las estaciones
router.get('/bolide/testing', BolideController.testing)
router.get('/bolide',[validateJWT], BolideController.getAllBolide);
router.get('/bolide/months', BolideController.getAllBolideLastSixMonths);

router.get('/bolide/comparation', BolideController.getBolideCompareLastTen);
router.get('/bolide/comparation/two', BolideController.getBolideCompareLastTwo);
router.get('/bolide/search', BolideController.getBolideWithCustomSearch);

router.get('/bolide/:id', BolideController.getBolideById);
module.exports = router;