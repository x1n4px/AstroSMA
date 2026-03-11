const express = require('express');
const router = express.Router();
const workflowsController = require('../controllers/workflowsController');
const workflowViewsController = require('../controllers/workflowViewsController');
const { validateJWT } = require('../middlewares/validate-jwt');
const { validateRol } = require('../middlewares/validate-rol');

const adminOnly = [validateJWT, validateRol];

router.get('/workflows/health/check', adminOnly, workflowsController.check);
router.get('/workflows/runQuery', adminOnly, workflowsController.runQuery);
router.get('/workflows/runPredefinedQuery', adminOnly, workflowsController.runPredefinedQuery);
router.post('/workflows/publish-to-wordpress', adminOnly, workflowsController.publishToWordPress);
router.get('/workflows/wordpress-status', adminOnly, workflowsController.checkWordPressStatus);

router.get('/views', adminOnly, workflowViewsController.getAllViews);
router.get('/views/stats', adminOnly, workflowViewsController.getViewStats);
router.get('/views/:name', adminOnly, workflowViewsController.getViewByName);
router.post('/views', adminOnly, workflowViewsController.createView);
router.put('/views/:id', adminOnly, workflowViewsController.updateView);
router.delete('/views/:name', adminOnly, workflowViewsController.deleteView);
router.post('/views/import', adminOnly, workflowViewsController.importViews);
router.post('/views/sync', adminOnly, workflowViewsController.syncLocalStorageViews);

module.exports = router;
