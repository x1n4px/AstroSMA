const express = require('express');
const router = express.Router();

const SonificationController = require('../controllers/sonificationController');

router.get('/reportz/:id/sonification', SonificationController.getSonificationOverview);
router.get('/reportz/:id/sonification/source/:filename', SonificationController.downloadSourceFile);
router.get('/reportz/:id/sonification/:metodo', SonificationController.getSonificationMethod);
router.get('/files/sonif/:filename', SonificationController.serveGeneratedFile);
router.get('/sonification/vids/:filename', SonificationController.serveVideo);
router.get('/vids/:filename', SonificationController.serveVideo);

module.exports = router;
