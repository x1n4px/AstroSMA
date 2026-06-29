const express = require('express');
const router = express.Router();
const ReportZController = require('../controllers/reportZController');
const { validateJWT } = require('../middlewares/validate-jwt');
const { validateRol } = require('../middlewares/validate-rol');


// Ruta para obtener todas las estaciones
router.get('/reportz', validateJWT, ReportZController.getAllReportZ);
router.get('/reportz/search', validateJWT, ReportZController.getReportzWithCustomSearch);
router.get('/admin/reportz', [validateJWT, validateRol], ReportZController.getAdminReportZ);
router.post('/admin/reportz', [validateJWT, validateRol], ReportZController.createAdminReportZ);
router.put('/admin/reportz/:id', [validateJWT, validateRol], ReportZController.updateAdminReportZ);
router.delete('/admin/reportz/:id', [validateJWT, validateRol], ReportZController.deleteAdminReportZ);
router.post('/reportz/showerInfo/:selectedCode/:dateIn/:dateOut', validateJWT, ReportZController.getReportZListFromRain);
router.get('/reportz/:id/related', ReportZController.getRelatedReportsByMeteor);
router.get('/reportz/:id/media', ReportZController.getReportMediaById);
router.get('/reportz/:id',  ReportZController.getReportZ);


module.exports = router;
