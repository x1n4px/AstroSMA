const express = require('express');
const router = express.Router();
const BolideController = require('../controllers/bolideController');
const {validateJWT} = require('../middlewares/validate-jwt');
const { validateRol } = require('../middlewares/validate-rol');

// Ruta para obtener todas las estaciones
router.get('/bolide/testing', BolideController.testing)
router.get('/bolide',[validateJWT], BolideController.getAllBolide);
router.get('/bolide/months', BolideController.getAllBolideLastSixMonths);

router.get('/bolide/comparation', BolideController.getBolideCompareLastTen);
router.get('/bolide/comparation/two', BolideController.getBolideCompareLastTwo);
router.get('/bolide/earth/trajectories', BolideController.getBolideTrajectoriesForEarthGlobe);
router.get('/bolide/search', BolideController.getBolideWithCustomSearch);
router.get('/bolide/search/csv', BolideController.getBolideWithCustomSearchCSV);
router.get('/bolide/search/reports', BolideController.getReportData);
router.get('/admin/bolides', [validateJWT, validateRol], BolideController.getAdminBolides);
router.post('/admin/bolides', [validateJWT, validateRol], BolideController.createAdminBolide);
router.put('/admin/bolides/:id', [validateJWT, validateRol], BolideController.updateAdminBolide);
router.delete('/admin/bolides/:id', [validateJWT, validateRol], BolideController.deleteAdminBolide);

router.get('/bolide/:id', BolideController.getBolideById);
module.exports = router;
